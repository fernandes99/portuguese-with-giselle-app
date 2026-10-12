import achievementSound from '@assets/sounds/achievement.wav';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { colors } from '@/constants/theme';
import { setAchievementHandler, type UnlockedAchievement } from '@/lib/api';

// Tempo em que o aviso fica parado na tela, em ms
const VISIBLE_DURATION = 2600;
const LEAVE_DURATION = 220;
// De onde o aviso entra e para onde sai, acima da tela
const HIDDEN_OFFSET = -160;

// Aviso de conquista desbloqueada: desce do topo, toca o som e some sozinho.
// Fica montado por cima de toda a área logada e mostra uma conquista por vez;
// as que chegarem juntas esperam na fila.
export function AchievementToast() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const player = useAudioPlayer(achievementSound);

  const [queue, setQueue] = useState<UnlockedAchievement[]>([]);
  const current = queue[0] ?? null;

  const translateY = useSharedValue(HIDDEN_OFFSET);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setAchievementHandler((achievements) =>
      setQueue((waiting) => [
        ...waiting,
        // A mesma conquista pode vir em duas respostas quase simultâneas
        ...achievements.filter(
          (achievement) =>
            !waiting.some((item) => item.code === achievement.code)
        ),
      ])
    );
    return () => setAchievementHandler(null);
  }, []);

  const showNext = useCallback(() => {
    setQueue((waiting) => waiting.slice(1));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a animação recomeça a cada conquista, identificada pelo código
  useEffect(() => {
    if (!current) {
      return;
    }

    player.seekTo(0);
    player.play();

    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(
        VISIBLE_DURATION,
        withTiming(0, { duration: LEAVE_DURATION }, (finished) => {
          if (finished) {
            scheduleOnRN(showNext);
          }
        })
      )
    );
    translateY.value = reducedMotion
      ? 0
      : withSequence(
          withSpring(0, { damping: 14, stiffness: 180 }),
          withDelay(
            VISIBLE_DURATION - 200,
            withTiming(HIDDEN_OFFSET, { duration: LEAVE_DURATION + 100 })
          )
        );
  }, [current?.code]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!current) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Conquista desbloqueada: ${current.title}`}
      className="absolute inset-x-4 flex-row items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3"
      style={[{ top: insets.top + 8 }, style]}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-500">
        <Ionicons name="trophy" size={20} color={colors.white} />
      </View>
      <View className="flex-1">
        <Text className="font-poppins-medium text-xs text-orange-300">
          Conquista desbloqueada!
        </Text>
        <Text
          numberOfLines={1}
          className="font-poppins-bold text-base text-white"
        >
          {current.title}
        </Text>
        <Text numberOfLines={2} className="font-poppins text-xs text-gray-300">
          {current.description}
        </Text>
      </View>
    </Animated.View>
  );
}
