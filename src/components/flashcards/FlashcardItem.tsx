import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { FlashcardSummary } from '@/services/flashcards';
import { formatCards, getFlashcardProgress } from '@/utils/flashcards';

// Um conjunto na lista de flashcards, com o progresso do aluno
export function FlashcardItem({
  flashcard,
  onPress,
}: {
  flashcard: FlashcardSummary;
  onPress: () => void;
}) {
  const { percentage, isStarted, isCompleted } =
    getFlashcardProgress(flashcard);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${flashcard.title}, ${formatCards(flashcard.totalCards)}`}
      onPress={onPress}
      className="gap-2 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-2">
        <Text
          numberOfLines={2}
          className="flex-1 font-poppins-bold text-lg text-gray-900"
        >
          {flashcard.title}
        </Text>
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.green} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>

      {flashcard.description ? (
        <Text numberOfLines={2} className="font-poppins text-sm text-gray-600">
          {flashcard.description}
        </Text>
      ) : null}

      {isStarted ? (
        <View className="mt-1 gap-1.5">
          <ProgressBar percentage={percentage} />
          <Text className="font-poppins text-xs text-gray-500">
            {flashcard.learnedCards} de {formatCards(flashcard.totalCards)}{' '}
            aprendidos
          </Text>
        </View>
      ) : (
        <Text className="font-poppins text-xs text-gray-500">
          {formatCards(flashcard.totalCards)}
        </Text>
      )}
    </Pressable>
  );
}
