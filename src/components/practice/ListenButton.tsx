import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import type { VoiceState } from '@/hooks/useGisaVoice';

// Botão redondo de ouvir uma fala, só com o ícone: baixando, mostra o
// carregamento; tocando, vira "parar" com o fundo verde pulsando
export function ListenButton({
  state,
  label,
  onPress,
}: {
  state: VoiceState;
  // "Ouvir a Gisa" ou "Ouvir a correção"
  label: string;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (state === 'playing' && !reducedMotion) {
      pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [state, reducedMotion, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
  }));

  const isPlaying = state === 'playing';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPlaying || state === 'loading' ? 'Parar' : label}
      accessibilityState={{ busy: state === 'loading' }}
      onPress={onPress}
      hitSlop={6}
      className="h-8 w-8 items-center justify-center rounded-full active:opacity-70"
    >
      {isPlaying ? (
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 rounded-full bg-green-200"
          style={pulseStyle}
        />
      ) : null}
      {state === 'loading' ? (
        <ActivityIndicator size="small" color={colors.green} />
      ) : (
        <Ionicons
          name={isPlaying ? 'stop' : 'volume-medium'}
          size={16}
          color={isPlaying ? colors.darkGreen : colors.gray}
        />
      )}
    </Pressable>
  );
}
