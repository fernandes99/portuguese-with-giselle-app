import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  StudyCard,
  type StudyCardHandle,
} from '@/components/flashcards/StudyCard';
import { StudySummary } from '@/components/flashcards/StudySummary';
import { EmptyState } from '@/components/lesson/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import type { Flashcard } from '@/services/flashcards';

function Counter({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className={`min-w-[36px] items-center rounded-full border px-2.5 py-0.5 ${className}`}
      >
        <Text className={`font-poppins-semibold text-sm ${className}`}>
          {count}
        </Text>
      </View>
      <Text className={`font-poppins-medium text-sm ${className}`}>
        {label}
      </Text>
    </View>
  );
}

function AnswerButton({
  icon,
  label,
  className,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  className: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className="items-center gap-1.5 active:opacity-70"
    >
      <View
        className={`h-16 w-16 items-center justify-center rounded-full ${className}`}
      >
        <Ionicons name={icon} size={30} color={colors.white} />
      </View>
      <Text className="font-poppins-medium text-xs text-gray-600">{label}</Text>
    </Pressable>
  );
}

// Sessão de estudo: contadores, pilha de cards e os botões de resposta.
// Ao fim da rodada, dá lugar ao resumo.
export function StudySession({
  flashcard,
  onExit,
}: {
  flashcard: Flashcard;
  onExit: () => void;
}) {
  const {
    round,
    position,
    isFinished,
    learnedCount,
    learningCount,
    remainingCount,
    hasSaveError,
    answer,
    studyRemaining,
    studyAll,
  } = useFlashcardSession(flashcard);
  const topCard = useRef<StudyCardHandle>(null);

  if (flashcard.cards.length === 0) {
    return (
      <View className="flex-1 justify-center px-5">
        <EmptyState
          title="Nenhum card disponível"
          text="Este flashcard não possui cards ainda"
        />
      </View>
    );
  }

  const saveError = hasSaveError ? (
    <Text className="text-center font-poppins text-xs text-red-700">
      Algumas respostas não foram salvas. Verifique sua internet.
    </Text>
  ) : null;

  if (isFinished) {
    return (
      <StudySummary
        totalCards={flashcard.cards.length}
        learnedCount={learnedCount}
        remainingCount={remainingCount}
        notice={saveError}
        onStudyRemaining={studyRemaining}
        onStudyAll={studyAll}
        onExit={onExit}
      />
    );
  }

  const total = round.cards.length;
  // O card da vez e o seguinte, que já fica montado embaixo dele. O de
  // cima vem por último para ficar na frente.
  const visible = [position + 1, position].filter((index) => index < total);

  return (
    <View className="flex-1">
      <View className="gap-3 px-5 pt-2">
        <View className="flex-row items-center justify-between">
          <Counter
            label="Aprendendo"
            count={learningCount}
            className="border-orange-500 text-orange-600"
          />
          <Counter
            label="Aprendi"
            count={learnedCount}
            className="border-green-600 text-green-700"
          />
        </View>

        <View className="gap-1.5">
          <Text className="font-poppins text-xs text-gray-600">
            Card {position + 1} de {total}
          </Text>
          <ProgressBar percentage={Math.round((position / total) * 100)} />
        </View>

        {saveError}
      </View>

      <View className="flex-1 px-5 pb-6 pt-5">
        <View className="flex-1">
          {visible.map((index) => (
            <StudyCard
              key={`${round.number}-${round.cards[index].id}`}
              ref={index === position ? topCard : undefined}
              card={round.cards[index]}
              isShowFront={flashcard.isShowFront}
              isTop={index === position}
              onAnswer={(learned) => answer(index, learned)}
            />
          ))}
        </View>
      </View>

      <View className="flex-row justify-center gap-12 px-5 pb-4">
        <AnswerButton
          icon="close"
          label="Ainda aprendendo"
          className="bg-orange-500"
          onPress={() => topCard.current?.answer(false)}
        />
        <AnswerButton
          icon="checkmark"
          label="Aprendi"
          className="bg-green-600"
          onPress={() => topCard.current?.answer(true)}
        />
      </View>
    </View>
  );
}
