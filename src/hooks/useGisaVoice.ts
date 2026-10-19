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
export function useGisaVoice() {
  const { token } = useAuth();
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  // Assinatura da fala para o arquivo no cache
  const files = useRef(new Map<string, string>());
  // Sobe a cada pedido e a cada `stop`: a resposta de um pedido antigo não toca
  const request = useRef(0);
  const isMountedRef = useRef(true);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  // A mesma chave e o arquivo carregado no player, lidos depois de um pedido
  // que demorou
  const currentKeyRef = useRef<string | null>(null);
  const currentUriRef = useRef<string | null>(null);
  const [autoplayEnabled, setAutoplayState] = useState(true);
  const autoplayRef = useRef(true);
  // O limite de falas do dia: a voz automática para até sair da tela
  const [isSpeechBlocked, setIsSpeechBlocked] = useState(false);
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
      request.current += 1;
      try {
        player.pause();
      } catch {
        // player já liberado
      }
      for (const uri of cached.values()) {
        try {
          new File(uri).delete();
        } catch {
          // o sistema pode já ter limpado o cache
        }
      }
      cached.clear();
    };
  }, [player]);

  // `current` é o pedido que mandou tocar: um `stop` no meio cancela
  function play(key: string, uri: string, current: number) {
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
    }
  }

  async function start(
    key: string,
    text: string,
    signature: string,
    fromUser: boolean
  ) {
    request.current += 1;
    const current = request.current;
    player.pause();

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
      const speech = await getPracticeSpeech(token, text, signature);
      if (!isMountedRef.current) {
        return;
      }
      const file = new File(Paths.cache, `gisa-${Date.now()}-${current}.mp3`);
      file.write(speech.audio, { encoding: 'base64' });
      files.current.set(signature, file.uri);
      if (current === request.current) {
        play(key, file.uri, current);
      }
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      if (
        err instanceof ApiError &&
        err.code === PRACTICE_AUDIO_ERROR_CODES.speechLimit
      ) {
        blockedRef.current = true;
        setIsSpeechBlocked(true);
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

  // Toque do aluno no botão de ouvir: toca, ou para o que está tocando
  function toggle(key: string, text: string, signature: string) {
    if (stateOf(key) !== 'idle') {
      stop();
      return;
    }
    start(key, text, signature, true);
  }

  // Fala nova da Gisa, com a voz automática ligada
  function autoplay(key: string, text: string, signature: string) {
    if (!autoplayRef.current || blockedRef.current) {
      return;
    }
    start(key, text, signature, false);
  }

  function stop() {
    request.current += 1;
    setLoadingKey(null);
    player.pause();
  }

  function setAutoplayEnabled(enabled: boolean) {
    autoplayRef.current = enabled;
    setAutoplayState(enabled);
    setChatAutoplay(enabled).catch(() => undefined);
  }

  return {
    stateOf,
    toggle,
    autoplay,
    stop,
    autoplayEnabled,
    setAutoplayEnabled,
    isSpeechBlocked,
  };
}
