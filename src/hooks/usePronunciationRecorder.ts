import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { type RecorderHint, useHoldToTalk } from '@/hooks/useHoldToTalk';
import { useSpeechRecognitionHold } from '@/hooks/useSpeechRecognitionHold';
import { ApiError, getErrorMessage } from '@/lib/api';
import { isSpeechRecognitionAvailable } from '@/lib/speechRecognition';
import {
  evaluatePronunciation,
  evaluatePronunciationText,
  type PronunciationEngine,
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

// Por que a conferência não está disponível: o limite do dia acabou (429) ou
// o aluno não é assinante (403)
export type PronunciationUnavailableReason = 'daily_limit' | 'subscribers_only';

const UNAVAILABLE_STATUSES: Record<number, PronunciationUnavailableReason> = {
  429: 'daily_limit',
  403: 'subscribers_only',
};

interface PronunciationRecorderOptions {
  // Quem transcreve, decidido pelo site. Com 'device' e o reconhecimento no
  // aparelho, a fala vai como texto; senão, como gravação.
  engine?: PronunciationEngine;
  // Com ele, o limite e o plano não viram alerta: quem chama decide o que
  // mostrar (a atividade de vocabulário pula as perguntas de falar)
  onUnavailable?: (reason: PronunciationUnavailableReason) => void;
}

// Segurar para falar na pronúncia do vocabulário: a gravação
// (useHoldToTalk) ou o texto do reconhecimento do aparelho
// (useSpeechRecognitionHold) vai para a avaliação, e o resultado fica até a
// próxima fala. Os dois rodam sempre, pela regra dos hooks, e só um é usado.
export function usePronunciationRecorder(
  itemId: string,
  { engine = 'elevenlabs', onUnavailable }: PronunciationRecorderOptions = {}
) {
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

  const usesRecognition = useMemo(
    () => engine === 'device' && isSpeechRecognitionAvailable(),
    [engine]
  );

  const evaluate = useCallback(
    async (
      request: (authToken: string) => Promise<PronunciationEvaluation>
    ) => {
      if (!token) {
        return;
      }

      try {
        const result = await request(token);
        if (isMountedRef.current) {
          setEvaluation(result);
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }
        const unavailable =
          error instanceof ApiError
            ? UNAVAILABLE_STATUSES[error.status]
            : undefined;
        if (unavailable && onUnavailable) {
          onUnavailable(unavailable);
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
    [token, onUnavailable]
  );

  const recording = useHoldToTalk({
    maxDurationMs: MAX_RECORDING_MS,
    onRecorded: (uri) =>
      evaluate((authToken) => evaluatePronunciation(authToken, itemId, uri)),
  });
  const recognition = useSpeechRecognitionHold({
    maxDurationMs: MAX_RECORDING_MS,
    onRecognized: (transcripts) =>
      evaluate((authToken) =>
        evaluatePronunciationText(authToken, itemId, transcripts)
      ),
  });
  const holdToTalk = usesRecognition ? recognition : recording;
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
