import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

// Tempo em que o aviso fica na tela, em ms
const VISIBLE_DURATION = 2200;
const FADE_DURATION = 180;

export interface ToastMessage {
  text: string;
  // Muda a cada toque, para o mesmo aviso reaparecer
  id: number;
}

// Aviso curto que aparece acima do rodapé da aula e some sozinho
export function FlowToast({ message }: { message: ToastMessage | null }) {
  const visibility = useSharedValue(0);

  useEffect(() => {
    if (!message) {
      return;
    }

    visibility.value = withSequence(
      withTiming(1, { duration: FADE_DURATION }),
      withDelay(VISIBLE_DURATION, withTiming(0, { duration: FADE_DURATION }))
    );
  }, [message, visibility]);

  const style = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [{ translateY: (1 - visibility.value) * 8 }],
  }));

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      className="absolute inset-x-5 bottom-full mb-3 flex-row items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3"
      style={style}
    >
      <Ionicons
        name="information-circle-outline"
        size={20}
        color={colors.white}
      />
      <Text className="flex-1 font-poppins-medium text-sm text-white">
        {message.text}
      </Text>
    </Animated.View>
  );
}
