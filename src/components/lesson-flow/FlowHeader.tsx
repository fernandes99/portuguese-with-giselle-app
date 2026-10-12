import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

interface FlowHeaderProps {
  // De 0 a 1
  progress: number;
  // Sem onClose (tela de parabéns) o botão de fechar não aparece
  onClose?: () => void;
}

// Topo da aula guiada: fechar e a barra de progresso da aula
export function FlowHeader({ progress, onClose }: FlowHeaderProps) {
  const value = useSharedValue(progress);

  useEffect(() => {
    value.value = withTiming(progress, { duration: 350 });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${value.value * 100}%`,
  }));

  return (
    <View className="h-14 flex-row items-center gap-4 px-5">
      {onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da aula"
          onPress={onClose}
          hitSlop={12}
        >
          <Ionicons name="close" size={26} color={colors.gray} />
        </Pressable>
      ) : null}

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200"
      >
        <Animated.View
          className="h-full rounded-full bg-green-600"
          style={fillStyle}
        />
      </View>
    </View>
  );
}
