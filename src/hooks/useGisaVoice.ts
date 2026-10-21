import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import { getChatAutoplay, setChatAutoplay } from '@/lib/storage';
import {
  getPracticeSpeech,
  PRACTICE_AUDIO_ERROR_CODES,
} from '@/services/practice';

export type VoiceState = 'idle' | 'loading' | 'playing';

// Voz das falas da Gisa no chat. Cada fala é pedida ao backend uma vez,
// gravada no cache e tocada de novo dali; sair da tela para o som e apaga os
// arquivos. Só uma fala toca por vez, e cada pedido novo (ou `stop`) descarta
// o que ainda estava chegando, para uma fala que saiu da conversa nunca
// tocar depois. A `key` é o id da mensagem (a frase corrigida usa
// `<id>-corrected`) e só marca qual botão está tocando; o arquivo é guardado
// pela assinatura, única para cada texto: a abertura tem o mesmo id em toda
// conversa, mas não o mesmo texto.
//
// Com os tempos das palavras que o backend devolve, `activeWordOf` diz qual
// palavra está sendo falada, para o balão destacar como uma legenda.

// Frequência com que o player informa o tempo: curta para a palavra
// destacada acompanhar a fala
const STATUS_INTERVAL_MS = 100;

interface CachedSpeech {
  uri: string;
  wordStarts: number[] | null;
}

export function useGisaVoice() {
  const { token } = useAuth();
  const player = useAudioPlayer(undefined, {
    updateInterval: STATUS_INTERVAL_MS,
  });
  const status = useAudioPlayerStatus(player);
  // Assinatura da fala para o arquivo no cache e os tempos das palavras
  const files = useRef(new Map<string, CachedSpeech>());
  // Sobe a cada pedido e a cada `stop`: a resposta de um pedido antigo não toca
  const request = useRef(0);
  const isMountedRef = useRef(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [currentWordStarts, setCurrentWordStarts] = useState<number[] | null>(
    null
  );
  // A mesma chave e o arquivo carregado no player, lidos depois de um pedido
  // que demorou
  const currentKeyRef = useRef<string | null>(null);
  const currentUriRef = useRef<string | null>(null);
  const [autoplayEnabled, setAutoplayState] = useState(true);
  const autoplayRef = useRef(true);
  // O limite de falas do dia ou do mês: a voz automática para até sair da
  // tela
  // A mensagem do backend sobre o limite, para a tela avisar no chat
  const [speechLimitMessage, setSpeechLimitMessage] = useState<string | null>(
    null
  );
  const blockedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    // Sem isso o iPhone no modo silencioso não toca nada
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    getChatAutoplay().then((enabled) => {
      if (isMountedRef.current) {
        autoplayRef.current = enabled;
        setAutoplayState(enabled);
      }
    });

    const cached = files.current;
    return () => {
      isMountedRef.current = false;
      // Sem pause: o useAudioPlayer já liberou o player, o que para o som
      request.current += 1;
      for (const { uri } of cached.values()) {
        try {
          new File(uri).delete();
        } catch {
          // o sistema pode já ter limpado o cache
        }
      }
      cached.clear();
    };
  }, []);

  // Pausa o player se a tela ainda está montada. Ao sair da tela, o
  // useAudioPlayer libera o player antes das outras limpezas (a desta tela e
  // a do foco, no chat), e o pause num player liberado lança erro no Android.
  function pause() {
    if (!isMountedRef.current) {
      return;
    }
    try {
      player.pause();
    } catch {
      // player já liberado
    }
  }

  // `current` é o pedido que mandou tocar: um `stop` no meio cancela
  function play(key: string, speech: CachedSpeech, current: number) {
    const { uri } = speech;
    if (key === currentKeyRef.current && uri === currentUriRef.current) {
      // Depois de tocar até o fim o player fica parado no final do áudio
      player
        .seekTo(0)
        .then(() => {
          if (current === request.current) {
            player.play();
          }
        })
        .catch(() => undefined);
    } else {
      player.replace({ uri });
      player.play();
      currentKeyRef.current = key;
      currentUriRef.current = uri;
      setCurrentKey(key);
      setCurrentWordStarts(speech.wordStarts);
    }
  }

  async function start(
    key: string,
    text: string,
    signature: string,
    voiceId: string | null,
    fromUser: boolean
  ) {
    request.current += 1;
    const current = request.current;
    pause();

    const cached = files.current.get(signature);
    if (cached) {
      setLoadingKey(null);
      play(key, cached, current);
      return;
    }
    if (!token) {
      return;
    }

    setLoadingKey(key);
    try {
      const speech = await getPracticeSpeech(token, text, signature, voiceId);
      if (!isMountedRef.current) {
        return;
      }
      const file = new File(Paths.cache, `gisa-${Date.now()}-${current}.mp3`);
      file.write(speech.audio, { encoding: 'base64' });
      const entry: CachedSpeech = {
        uri: file.uri,
        wordStarts: speech.wordStarts ?? null,
      };
      files.current.set(signature, entry);
      if (current === request.current) {
        play(key, entry, current);
      }
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      if (
        err instanceof ApiError &&
        (err.code === PRACTICE_AUDIO_ERROR_CODES.speechLimit ||
          err.code === PRACTICE_AUDIO_ERROR_CODES.speechMonthlyLimit)
      ) {
        blockedRef.current = true;
        setSpeechLimitMessage(err.message);
      }
      // Na voz automática, a falha é silenciosa
      if (fromUser && current === request.current) {
        Alert.alert(
          'Não foi possível tocar o áudio',
          getErrorMessage(err, 'Erro ao gerar o áudio. Tente novamente.')
        );
      }
    } finally {
      if (isMountedRef.current && current === request.current) {
        setLoadingKey(null);
      }
    }
  }

  function stateOf(key: string): VoiceState {
    if (loadingKey === key) {
      return 'loading';
    }
    return currentKey === key && status.playing ? 'playing' : 'idle';
  }

  // Índice da palavra que está sendo falada na fala `key` (as partes do texto
  // separadas por espaço); null quando ela não está tocando ou não tem tempos
  function activeWordOf(key: string): number | null {
    if (stateOf(key) !== 'playing' || !currentWordStarts?.length) {
      return null;
    }
    let index = 0;
    for (let i = 0; i < currentWordStarts.length; i++) {
      if (currentWordStarts[i] <= status.currentTime) {
        index = i;
      }
    }
    return index;
  }

  // Toque do aluno no botão de ouvir: toca, ou para o que está tocando.
  // `voiceId` só para a fala de uma personagem das simulações.
  function toggle(
    key: string,
    text: string,
    signature: string,
    voiceId: string | null = null
  ) {
    if (stateOf(key) !== 'idle') {
      stop();
      return;
    }
    start(key, text, signature, voiceId, true);
  }

  // Fala nova da Gisa (ou da personagem), com a voz automática ligada
  function autoplay(
    key: string,
    text: string,
    signature: string,
    voiceId: string | null = null
  ) {
    if (!autoplayRef.current || blockedRef.current) {
      return;
    }
    start(key, text, signature, voiceId, false);
  }

  function stop() {
    request.current += 1;
    if (isMountedRef.current) {
      setLoadingKey(null);
    }
    pause();
  }

  function setAutoplayEnabled(enabled: boolean) {
    autoplayRef.current = enabled;
    setAutoplayState(enabled);
    setChatAutoplay(enabled).catch(() => undefined);
  }

  return {
    stateOf,
    activeWordOf,
    toggle,
    autoplay,
    stop,
    autoplayEnabled,
    setAutoplayEnabled,
    speechLimitMessage,
  };
}
