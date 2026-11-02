import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import successSound from '@assets/sounds/success.wav';

interface ActivityResultProps {
  correct: number;
  total: number;
  // O que está sendo contado quando não são perguntas
  unit?: 'blanks' | 'statements' | 'firstTry';
  // Troca o texto de baixo; a atividade de vocabulário conclui sempre
  message?: string;
  onRetry: () => void;
}

// Troféu de quando o aluno acerta tudo: toca um som curto, o troféu "salta"
// para dentro e um anel verde se abre e some atrás dele.
function SuccessTrophy() {
  const player = useAudioPlayer(successSound);
  const pop = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    player.play();

    Animated.parallel([
      Animated.spring(pop, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(ring, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [player, pop, ring]);

  return (
    <View className="h-20 w-20 items-center justify-center">
      <Animated.View
        className="absolute h-16 w-16 rounded-full bg-green-500"
        style={{
          opacity: ring.interpolate({
            inputRange: [0, 1],
            outputRange: [0.45, 0],
          }),
          transform: [
            {
              scale: ring.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1.7],
              }),
            },
          ],
        }}
      />
      <Animated.View
        className="h-16 w-16 items-center justify-center rounded-full bg-green-100"
        style={{
          transform: [
            { scale: pop },
            {
              rotate: pop.interpolate({
                inputRange: [0, 1],
                outputRange: ['-25deg', '0deg'],
              }),
            },
          ],
        }}
      >
        <Ionicons name="trophy" size={32} color={colors.green} />
      </Animated.View>
    </View>
  );
}

// Placar no fim de uma atividade
export function ActivityResult({
  correct,
  total,
  unit,
  message,
  onRetry,
}: ActivityResultProps) {
  const { t } = useTranslation();

  const isAllCorrect = correct === total;
  const score =
    unit === 'blanks'
      ? t('lesson.exercise.scoreBlanks', { correct, count: total })
      : unit === 'statements'
        ? t('lesson.exercise.scoreStatements', { correct, count: total })
        : unit === 'firstTry'
          ? t('lesson.exercise.scoreFirstTry', { correct, total })
          : t('lesson.exercise.score', { correct, total });

  return (
    <View className="items-center gap-3 rounded-xl bg-gray-50 p-5">
      {isAllCorrect ? (
        <SuccessTrophy />
      ) : (
        <Ionicons name="ribbon-outline" size={36} color={colors.gray} />
      )}
      <Text className="text-center font-poppins-bold text-lg text-gray-900">
        {score}
      </Text>
      <Text className="text-center font-poppins text-sm text-gray-600">
        {message ??
          (isAllCorrect
            ? t('lesson.exercise.passed')
            : t('lesson.exercise.notPassed'))}
      </Text>
      <Button variant="link" label={t('common.retry')} onPress={onRetry} />
    </View>
  );
}
