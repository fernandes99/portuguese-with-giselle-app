import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityCheck } from '@/components/activity/ActivityFooter';
import {
  ALTERNATIVE_STYLES,
  getAlternativeState,
} from '@/components/activity/ChoiceAlternatives';
import { VocabularyPrompt } from '@/components/activity/vocabulary/VocabularyPrompt';
import type {
  VocabularyExerciseType,
  VocabularyQuestion,
} from '@/services/lesson';

interface VocabularyChoiceProps {
  question: Extract<VocabularyQuestion, { kind: 'choice' }>;
  exerciseType: VocabularyExerciseType;
  onInteract: () => void;
  // Depois de "Verificar": a atividade abre o painel do acerto ou do erro
  onChecked: (isCorrect: boolean) => void;
}

const LISTEN_TYPES: VocabularyExerciseType[] = [
  'listen_choice',
  'listen_example',
];

// Escolher entre as opções: o significado, a palavra ou a tradução
export function VocabularyChoice({
  question,
  exerciseType,
  onInteract,
  onChecked,
}: VocabularyChoiceProps) {
  const { stop } = useActivityAudio();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  function select(optionId: string) {
    if (isChecked) {
      return;
    }
    onInteract();
    setSelectedId(optionId);
  }

  function check() {
    if (!selectedId) {
      return;
    }
    stop();
    setIsChecked(true);
    onChecked(selectedId === question.correctOptionId);
  }

  return (
    <View className="gap-5">
      <VocabularyPrompt
        prompt={question.prompt}
        autoPlay={LISTEN_TYPES.includes(exerciseType)}
        audioLabel={
          exerciseType === 'listen_example'
            ? 'Ouvir a frase'
            : 'Ouvir a palavra'
        }
      />

      <View className="gap-3">
        {question.options.map((option) => {
          const isSelected = option.id === selectedId;
          const state = getAlternativeState(
            option.id === question.correctOptionId,
            isSelected,
            isChecked
          );
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.text}
              accessibilityState={{ selected: isSelected, disabled: isChecked }}
              onPress={() => select(option.id)}
              disabled={isChecked}
              className={`rounded-2xl border-2 p-4 ${ALTERNATIVE_STYLES[state].box}`}
            >
              <Text className="font-poppins text-base text-gray-900">
                {option.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ActivityCheck disabled={!selectedId || isChecked} onCheck={check} />
    </View>
  );
}
