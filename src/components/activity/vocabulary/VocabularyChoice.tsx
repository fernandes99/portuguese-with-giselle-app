import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityCheck } from '@/components/activity/ActivityFooter';
import {
  ALTERNATIVE_STYLES,
  getAlternativeState,
} from '@/components/activity/ChoiceAlternatives';
import { VocabularyPrompt } from '@/components/activity/vocabulary/VocabularyPrompt';
import { colors } from '@/constants/theme';
import type {
  VocabularyExerciseType,
  VocabularyQuestion,
} from '@/services/lesson';
import { getLetter } from '@/utils/choice';

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

// Escolher entre as opções: o significado, a palavra ou a tradução, com as
// letras e os ícones das alternativas das outras atividades
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
    <View className="gap-6">
      <VocabularyPrompt
        prompt={question.prompt}
        autoPlay={LISTEN_TYPES.includes(exerciseType)}
      />

      <View className="gap-3">
        {question.options.map((option, position) => {
          const isSelected = option.id === selectedId;
          const state = getAlternativeState(
            option.id === question.correctOptionId,
            isSelected,
            isChecked
          );
          const style = ALTERNATIVE_STYLES[state];
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={`${getLetter(position)}: ${option.text}`}
              accessibilityState={{ checked: isSelected, disabled: isChecked }}
              onPress={() => select(option.id)}
              disabled={isChecked}
              className={`flex-row items-center gap-3 rounded-2xl border-2 p-4 ${style.box}`}
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-xl ${style.chip}`}
              >
                <Text className={`font-poppins-bold text-sm ${style.letter}`}>
                  {getLetter(position)}
                </Text>
              </View>
              <Text className="flex-1 font-poppins-medium text-base text-gray-900">
                {option.text}
              </Text>
              {state === 'correct' ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.green}
                />
              ) : null}
              {state === 'wrong' ? (
                <Ionicons name="close-circle" size={24} color={colors.red} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <ActivityCheck disabled={!selectedId || isChecked} onCheck={check} />
    </View>
  );
}
