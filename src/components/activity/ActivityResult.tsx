import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import successSound from '@assets/sounds/success.wav';

interface ActivityResultProps {
  correct: number;
  total: number;
  // O que está sendo contado quando não são perguntas, ex.: "lacunas"
  unit?: string;
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
  onRetry,
}: ActivityResultProps) {
  const isAllCorrect = correct === total;

  return (
    <View className="items-center gap-3 rounded-xl bg-gray-50 p-5">
      {isAllCorrect ? (
        <SuccessTrophy />
      ) : (
        <Ionicons name="ribbon-outline" size={36} color={colors.gray} />
      )}
      <Text className="text-center font-poppins-bold text-lg text-gray-900">
        Você acertou {correct} de {total}
        {unit ? ` ${unit}` : ''}
      </Text>
      <Text className="text-center font-poppins text-sm text-gray-600">
        {isAllCorrect
          ? 'Parabéns! Atividade concluída.'
          : 'Acerte tudo para concluir a atividade.'}
      </Text>
      <Button variant="link" label="Tentar de novo" onPress={onRetry} />
    </View>
  );
}
