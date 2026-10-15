import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const DOT_DURATION = 350;

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: DOT_DURATION }),
          withTiming(0.35, { duration: DOT_DURATION })
        ),
        -1
      )
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View className="h-2 w-2 rounded-full bg-white" style={style} />
  );
}

// Conteúdo do balão da Gisa enquanto a resposta não chega
export function TypingIndicator() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <Text className="font-poppins text-[15px] text-white">Digitando...</Text>
    );
  }

  return (
    <View
      accessibilityLabel="Gisa está digitando"
      className="h-6 flex-row items-center gap-1.5"
    >
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
