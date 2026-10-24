import { setAudioModeAsync } from 'expo-audio';
import type { ExpoSpeechRecognitionNativeEventMap } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { HoldToTalkState } from '@/hooks/useHoldToTalk';
import { speechRecognition } from '@/lib/speechRecognition';

// Menos que isso é um toque, não uma fala: não envia (o mesmo da gravação)
const MIN_SPEECH_MS = 500;

// As alternativas que o servidor aceita
const MAX_ALTERNATIVES = 5;

const IDLE: HoldToTalkState = { phase: 'idle', hint: null };

// Sem fala: o servidor recebe a lista vazia, que vira "não ouvimos"
const NO_SPEECH_ERRORS = new Set(['no-speech', 'speech-timeout']);

// O volume do reconhecimento vai de -2 a 10 (abaixo de 0 é silêncio); o
// botão espera dB de -50 a 0, como o metering da gravação
function toMetering(volume: number) {
  return -50 + Math.min(10, Math.max(0, volume)) * 5;
}

// Fora do reconhecimento, o iPhone volta a tocar pelo alto-falante
function setPlaybackMode() {
  return setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  }).catch(() => undefined);
}

// Uma fala, do dedo no botão até soltar
interface Press {
  released: boolean;
  startedAt: number | null;
  // Soltou dentro do tempo e espera o resultado para entregar
  delivering: boolean;
  transcripts: string[];
}

interface UseSpeechRecognitionHoldOptions {
  // O reconhecimento para e entrega sozinho depois disso
  maxDurationMs: number;
  // Recebe as alternativas; enquanto a promessa não termina, o estado é
  // `sending`
  onRecognized: (transcripts: string[]) => Promise<void>;
}

// Segurar para falar pelo reconhecimento do aparelho, com a mesma interface
// de useHoldToTalk: pressIn começa a ouvir e release para, entregando as
// alternativas ou descartando (cancelado ou curto demais). Em pt-BR, com até
// 5 alternativas, sem resultados parciais e sem o termo como dica
// (.specs/device-pronunciation/01-device-recognition.md).
export function useSpeechRecognitionHold({
  maxDurationMs,
  onRecognized,
}: UseSpeechRecognitionHoldOptions) {
  const [state, setState] = useState<HoldToTalkState>(IDLE);
  const [metering, setMetering] = useState<number | undefined>(undefined);
  const pressRef = useRef<Press | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Os eventos do módulo são de todo o app: só os da fala começada aqui contam
  const isActiveRef = useRef(false);
  const isMountedRef = useRef(true);
  const onRecognizedRef = useRef(onRecognized);
  onRecognizedRef.current = onRecognized;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (next: HoldToTalkState) => {
      isActiveRef.current = false;
      clearTimer();
      setMetering(undefined);
      setPlaybackMode();
      if (isMountedRef.current) {
        setState(next);
      }
    },
    [clearTimer]
  );

  const deliver = useCallback(
    async (transcripts: string[]) => {
      isActiveRef.current = false;
      clearTimer();
      setMetering(undefined);
      await setPlaybackMode();
      if (!isMountedRef.current) {
        return;
      }
      setState({ phase: 'sending' });
      try {
        await onRecognizedRef.current(transcripts);
      } finally {
        if (isMountedRef.current) {
          setState(IDLE);
        }
      }
    },
    [clearTimer]
  );

  // Pede o microfone e o reconhecimento antes de segurar o botão: o aviso do
  // sistema tiraria o dedo do botão
  const requestPermission = useCallback(async () => {
    if (!speechRecognition) {
      return false;
    }
    const current = await speechRecognition.getPermissionsAsync();
    const permission = current.granted
      ? current
      : await speechRecognition.requestPermissionsAsync();
    if (isMountedRef.current) {
      setState(permission.granted ? IDLE : { phase: 'denied' });
    }
    return permission.granted;
  }, []);

  const release = useCallback(
    async (cancel: boolean) => {
      const press = pressRef.current;
      if (!press || press.released) {
        return;
      }
      press.released = true;
      clearTimer();

      const elapsed =
        press.startedAt === null ? 0 : Date.now() - press.startedAt;
      if (cancel || elapsed < MIN_SPEECH_MS) {
        speechRecognition?.abort();
        finish({ phase: 'idle', hint: cancel ? 'cancelled' : 'too_short' });
        return;
      }

      // O aparelho entrega o resultado e depois o fim (evento end)
      press.delivering = true;
      speechRecognition?.stop();
    },
    [clearTimer, finish]
  );

  const pressIn = useCallback(() => {
    if (
      !speechRecognition ||
      (pressRef.current && !pressRef.current.released)
    ) {
      return;
    }

    pressRef.current = {
      released: false,
      startedAt: null,
      delivering: false,
      transcripts: [],
    };
    isActiveRef.current = true;
    setState({ phase: 'starting' });

    try {
      speechRecognition.start({
        lang: 'pt-BR',
        interimResults: false,
        maxAlternatives: MAX_ALTERNATIVES,
        continuous: false,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
    } catch {
      pressRef.current.released = true;
      finish(IDLE);
      Alert.alert('Não foi possível ouvir', 'Tente novamente.');
    }
  }, [finish]);

  // Os eventos do reconhecimento
  useEffect(() => {
    const module = speechRecognition;
    if (!module) {
      return;
    }

    const onStart = () => {
      const press = pressRef.current;
      if (!isActiveRef.current || !press) {
        return;
      }
      // Soltou antes de o reconhecimento abrir: foi só um toque
      if (press.released) {
        module.abort();
        finish({ phase: 'idle', hint: 'too_short' });
        return;
      }
      press.startedAt = Date.now();
      setState({ phase: 'recording', startedAt: press.startedAt });
      timerRef.current = setTimeout(() => {
        release(false);
      }, maxDurationMs);
    };

    const onResult = (event: ExpoSpeechRecognitionNativeEventMap['result']) => {
      const press = pressRef.current;
      if (!isActiveRef.current || !press || !event.isFinal) {
        return;
      }
      press.transcripts = event.results
        .slice(0, MAX_ALTERNATIVES)
        .map((result) => result.transcript);
    };

    const onError = (event: ExpoSpeechRecognitionNativeEventMap['error']) => {
      const press = pressRef.current;
      if (!isActiveRef.current || !press) {
        return;
      }
      if (event.error === 'aborted' || NO_SPEECH_ERRORS.has(event.error)) {
        return;
      }
      press.delivering = false;
      press.released = true;
      if (event.error === 'not-allowed') {
        finish({ phase: 'denied' });
        return;
      }
      finish(IDLE);
      Alert.alert('Não foi possível ouvir', 'Tente novamente.');
    };

    const onEnd = () => {
      const press = pressRef.current;
      if (!isActiveRef.current || !press) {
        return;
      }
      // Parou sozinho com o dedo ainda no botão (o aparelho achou que a fala
      // acabou): entrega o que ouviu, como no tempo máximo
      if (!press.released) {
        press.released = true;
        press.delivering = true;
      }
      if (press.delivering) {
        press.delivering = false;
        deliver(press.transcripts);
        return;
      }
      finish(IDLE);
    };

    const onVolume = (
      event: ExpoSpeechRecognitionNativeEventMap['volumechange']
    ) => {
      if (isActiveRef.current) {
        setMetering(toMetering(event.value));
      }
    };

    const subscriptions = [
      module.addListener('start', onStart),
      module.addListener('result', onResult),
      module.addListener('error', onError),
      module.addListener('end', onEnd),
      module.addListener('volumechange', onVolume),
    ];
    return () => {
      for (const subscription of subscriptions) {
        subscription.remove();
      }
    };
  }, [deliver, finish, release, maxDurationMs]);

  // Sair da tela para o reconhecimento, sem entregar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimer();
      if (isActiveRef.current) {
        isActiveRef.current = false;
        speechRecognition?.abort();
        setPlaybackMode();
      }
    };
  }, [clearTimer]);

  return {
    state,
    // Volume da voz em dB (de -50 a 0), enquanto ouve
    metering: state.phase === 'recording' ? metering : undefined,
    requestPermission,
    pressIn,
    release,
  };
}
