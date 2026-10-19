import {
  getRecordingPermissionsAsync,
  type RecordingOptions,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

// Menos que isso é um toque, não uma fala: não envia
const MIN_RECORDING_MS = 500;

// m4a, com o volume da voz para a animação do microfone
const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

// Aviso curto embaixo do microfone, depois de uma gravação não enviada
export type RecorderHint = 'too_short' | 'cancelled' | null;

export type HoldToTalkState =
  | { phase: 'idle'; hint: RecorderHint }
  | { phase: 'denied' }
  // Dedo no botão, gravador ainda abrindo
  | { phase: 'starting' }
  | { phase: 'recording'; startedAt: number }
  // A gravação foi entregue e quem usa o hook ainda está cuidando dela
  | { phase: 'sending' };

const IDLE: HoldToTalkState = { phase: 'idle', hint: null };

// Uma gravação, do dedo no botão até soltar
interface Press {
  released: boolean;
  startedAt: number | null;
}

// Fora da gravação, o iPhone volta a tocar pelo alto-falante
function setPlaybackMode() {
  return setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
  }).catch(() => undefined);
}

interface UseHoldToTalkOptions {
  // A gravação para e é entregue sozinha depois disso
  maxDurationMs: number;
  // Recebe a gravação; enquanto a promessa não termina, o estado é `sending`
  onRecorded: (uri: string) => Promise<void>;
}

// Segurar para falar: pressIn começa a gravar e release para, entregando a
// gravação ou descartando (cancelada ou curta demais). Usado pela pronúncia
// do vocabulário e pelo chat com a Gisa.
export function useHoldToTalk({
  maxDurationMs,
  onRecorded,
}: UseHoldToTalkOptions) {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [state, setState] = useState<HoldToTalkState>(IDLE);
  const pressRef = useRef<Press | null>(null);
  const isRecordingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Desmontado (tela fechada): não mexe mais no estado nem entrega
  const isMountedRef = useRef(true);
  const onRecordedRef = useRef(onRecorded);
  onRecordedRef.current = onRecorded;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const deliver = useCallback(async (uri: string) => {
    setState({ phase: 'sending' });
    try {
      await onRecordedRef.current(uri);
    } finally {
      if (isMountedRef.current) {
        setState(IDLE);
      }
    }
  }, []);

  // Pede o microfone antes de segurar o botão: o aviso do sistema tiraria o
  // dedo do botão
  const requestPermission = useCallback(async () => {
    const current = await getRecordingPermissionsAsync();
    const permission = current.granted
      ? current
      : await requestRecordingPermissionsAsync();
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

      // Soltou antes de o gravador abrir: pressIn termina o serviço
      if (!isRecordingRef.current) {
        return;
      }
      isRecordingRef.current = false;

      try {
        await recorder.stop();
      } catch {
        // já parado
      }
      await setPlaybackMode();
      if (!isMountedRef.current) {
        return;
      }

      const elapsed = Date.now() - (press.startedAt ?? Date.now());
      if (cancel) {
        setState({ phase: 'idle', hint: 'cancelled' });
      } else if (elapsed < MIN_RECORDING_MS || !recorder.uri) {
        setState({ phase: 'idle', hint: 'too_short' });
      } else {
        deliver(recorder.uri);
      }
    },
    [clearTimer, recorder, deliver]
  );

  const pressIn = useCallback(async () => {
    if (
      isRecordingRef.current ||
      (pressRef.current && !pressRef.current.released)
    ) {
      return;
    }

    const press: Press = { released: false, startedAt: null };
    pressRef.current = press;
    setState({ phase: 'starting' });

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      press.released = true;
      await setPlaybackMode();
      if (isMountedRef.current) {
        setState(IDLE);
        Alert.alert('Não foi possível gravar', 'Tente novamente.');
      }
      return;
    }

    // Soltou enquanto o gravador abria: foi só um toque
    if (press.released || !isMountedRef.current) {
      try {
        await recorder.stop();
      } catch {
        // já parado
      }
      await setPlaybackMode();
      if (isMountedRef.current) {
        setState({ phase: 'idle', hint: 'too_short' });
      }
      return;
    }

    isRecordingRef.current = true;
    press.startedAt = Date.now();
    setState({ phase: 'recording', startedAt: press.startedAt });
    timerRef.current = setTimeout(() => {
      release(false);
    }, maxDurationMs);
  }, [recorder, release, maxDurationMs]);

  // Sair da tela para a gravação, sem entregar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimer();
      if (isRecordingRef.current) {
        isRecordingRef.current = false;
        // O useAudioRecorder também libera o gravador ao desmontar; se ele
        // já tiver sido liberado, a chamada falha e a gravação já parou
        try {
          recorder.stop().catch(() => undefined);
        } catch {
          // gravador já liberado
        }
        setPlaybackMode();
      }
    };
  }, [clearTimer, recorder]);

  return {
    state,
    // Volume da voz em dB (de -160 a 0), enquanto grava
    metering: state.phase === 'recording' ? recorderState.metering : undefined,
    requestPermission,
    pressIn,
    release,
  };
}
