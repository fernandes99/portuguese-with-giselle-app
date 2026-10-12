import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { formatCards } from '@/utils/flashcards';

interface StudySummaryProps {
  totalCards: number;
  learnedCount: number;
  // Cards que o aluno ainda não aprendeu
  remainingCount: number;
  // Aviso opcional, mostrado acima dos botões
  notice?: ReactNode;
  onStudyRemaining: () => void;
  onStudyAll: () => void;
  onExit: () => void;
}

// Fim de uma rodada: quanto o aluno já aprendeu e o que dá para fazer agora
export function StudySummary({
  totalCards,
  learnedCount,
  remainingCount,
  notice,
  onStudyRemaining,
  onStudyAll,
  onExit,
}: StudySummaryProps) {
  const isCompleted = remainingCount === 0;

  return (
    <Animated.View entering={FadeIn.duration(250)} className="flex-1 px-6 pb-4">
      <View className="flex-1 items-center justify-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Ionicons
            name={isCompleted ? 'trophy' : 'checkmark-done'}
            size={36}
            color={colors.green}
          />
        </View>
        <Text className="text-center font-poppins-bold text-2xl text-gray-900">
          {isCompleted ? 'Você aprendeu todos os cards!' : 'Rodada concluída'}
        </Text>
        <Text className="text-center font-poppins text-base text-gray-600">
          {isCompleted
            ? 'Revise quando quiser para não esquecer.'
            : `Você já aprendeu ${learnedCount} de ${formatCards(totalCards)}.`}
        </Text>
      </View>

      <View className="gap-2">
        {notice}
        {isCompleted ? (
          <Button label="Revisar todos os cards" onPress={onStudyAll} />
        ) : (
          <>
            <Button
              label={`Continuar com ${formatCards(remainingCount)}`}
              onPress={onStudyRemaining}
            />
            <Button
              variant="link"
              label="Revisar todos os cards"
              onPress={onStudyAll}
            />
          </>
        )}
        <Button variant="link" label="Voltar aos flashcards" onPress={onExit} />
      </View>
    </Animated.View>
  );
}
