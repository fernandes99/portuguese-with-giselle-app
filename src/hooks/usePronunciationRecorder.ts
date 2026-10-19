import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { type RecorderHint, useHoldToTalk } from '@/hooks/useHoldToTalk';
import { getErrorMessage } from '@/lib/api';
import {
  evaluatePronunciation,
  type PronunciationEvaluation,
} from '@/services/vocabulary';

export type { RecorderHint };

// A gravação é enviada sozinha depois disso
export const MAX_RECORDING_MS = 5000;

export type RecorderState =
  | { phase: 'idle'; hint: RecorderHint }
  | { phase: 'denied' }
  // Dedo no botão, gravador ainda abrindo
  | { phase: 'starting' }
  | { phase: 'recording'; startedAt: number }
  | { phase: 'checking' }
  | { phase: 'result'; evaluation: PronunciationEvaluation };

// Segurar para falar na pronúncia do vocabulário: a gravação
// (useHoldToTalk) vai para a avaliação, e o resultado fica até a próxima
// gravação
export function usePronunciationRecorder(itemId: string) {
  const { token } = useAuth();
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(
    null
  );
  // Fechado o detalhe, a avaliação que chegar depois não mostra nada
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const send = useCallback(
    async (uri: string) => {
      if (!token) {
        return;
      }

      try {
        const result = await evaluatePronunciation(token, itemId, uri);
        if (isMountedRef.current) {
          setEvaluation(result);
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }
        Alert.alert(
          'Não foi possível conferir',
          getErrorMessage(
            error,
            'Erro ao avaliar a pronúncia. Tente novamente.'
          )
        );
      }
    },
    [token, itemId]
  );

  const holdToTalk = useHoldToTalk({
    maxDurationMs: MAX_RECORDING_MS,
    onRecorded: send,
  });
  const { pressIn: startHold, requestPermission: askPermission } = holdToTalk;

  // O resultado some ao gravar de novo e ao pedir o microfone outra vez
  const pressIn = useCallback(() => {
    setEvaluation(null);
    startHold();
  }, [startHold]);

  const requestPermission = useCallback(() => {
    setEvaluation(null);
    return askPermission();
  }, [askPermission]);

  const { state: hold } = holdToTalk;
  let state: RecorderState;
  if (hold.phase === 'sending') {
    state = { phase: 'checking' };
  } else if (hold.phase === 'idle' && !hold.hint && evaluation) {
    state = { phase: 'result', evaluation };
  } else {
    state = hold;
  }

  return {
    state,
    metering: holdToTalk.metering,
    requestPermission,
    pressIn,
    release: holdToTalk.release,
  };
}
