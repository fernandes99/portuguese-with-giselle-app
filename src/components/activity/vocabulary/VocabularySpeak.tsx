import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { VocabularyPrompt } from '@/components/activity/vocabulary/VocabularyPrompt';
import { Button } from '@/components/Button';
import { HoldToTalkButton } from '@/components/vocabulary/HoldToTalkButton';
import { colors } from '@/constants/theme';
import {
  MAX_RECORDING_MS,
  type PronunciationUnavailableReason,
  usePronunciationRecorder,
} from '@/hooks/usePronunciationRecorder';
import type { VocabularyQuestion } from '@/services/lesson';
import type {
  PronunciationEngine,
  PronunciationEvaluation,
} from '@/services/vocabulary';

interface VocabularySpeakProps {
  question: Extract<VocabularyQuestion, { kind: 'speak' }>;
  // Quem transcreve: a gravação ou o reconhecimento do aparelho
  engine: PronunciationEngine;
  onInteract: () => void;
  // A conferência voltou: a atividade abre o painel com o resultado
  onEvaluated: (evaluation: PronunciationEvaluation) => void;
  onSkip: () => void;
  // Limite do dia ou plano gratuito: a atividade tira as de falar
  onUnavailable: (reason: PronunciationUnavailableReason) => void;
}

const HINTS = {
  too_short: 'Segure o botão enquanto fala.',
  cancelled: 'Gravação cancelada.',
};

// Falar a palavra: segurar o microfone, falar e soltar, com a conferência da
// tela de vocabulário
export function VocabularySpeak({
  question,
  engine,
  onInteract,
  onEvaluated,
  onSkip,
  onUnavailable,
}: VocabularySpeakProps) {
  const { stop: stopAudio } = useActivityAudio();
  const { state, metering, requestPermission, pressIn, release } =
    usePronunciationRecorder(question.vocabularyId, {
      engine,
      onUnavailable,
    });
  const reportedRef = useRef<PronunciationEvaluation | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pede o microfone só quando a pergunta aparece
  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (state.phase === 'result' && reportedRef.current !== state.evaluation) {
      reportedRef.current = state.evaluation;
      onEvaluated(state.evaluation);
    }
  }, [state, onEvaluated]);

  function handlePressIn() {
    // O áudio tocando entraria na gravação
    stopAudio();
    onInteract();
    pressIn();
  }

  const isHolding = state.phase === 'starting' || state.phase === 'recording';

  return (
    <View className="gap-6">
      <VocabularyPrompt
        prompt={{ text: question.term, audioUrl: question.termAudioUrl }}
        autoPlay={false}
        hint={question.pronunciation}
      />

      {state.phase === 'denied' ? (
        <View className="gap-3">
          <Text className="font-poppins text-sm text-red-500">
            Permita o acesso ao microfone nas configurações para falar a
            palavra.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="settings-outline" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                Abrir configurações
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="refresh" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                Tentar de novo
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="items-center gap-3">
          {state.phase === 'checking' ? (
            <View className="h-14 flex-row items-center justify-center gap-2">
              <ActivityIndicator color={colors.darkGreen} />
              <Text className="font-poppins text-sm text-gray-500">
                Conferindo...
              </Text>
            </View>
          ) : (
            <HoldToTalkButton
              isHolding={isHolding}
              isRecording={state.phase === 'recording'}
              disabled={state.phase === 'result'}
              metering={metering}
              maxDurationMs={MAX_RECORDING_MS}
              onPressIn={handlePressIn}
              onRelease={release}
            />
          )}

          {state.phase === 'idle' && state.hint ? (
            <Text className="text-center font-poppins text-sm text-gray-500">
              {HINTS[state.hint]}
            </Text>
          ) : null}
        </View>
      )}

      {state.phase !== 'checking' && state.phase !== 'result' ? (
        <Button variant="link" label="Não posso falar agora" onPress={onSkip} />
      ) : null}
    </View>
  );
}
