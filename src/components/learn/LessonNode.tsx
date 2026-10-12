import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import type { LessonStatus, PathLesson } from '@/utils/learn';

// completing: a aula acabou de ser concluída; unlocking: acabou de destrancar
export type LessonTransition = 'completing' | 'unlocking';

interface LessonNodeProps {
  lesson: PathLesson;
  // A última aula do módulo não tem linha ligando à próxima
  isLast: boolean;
  transition?: LessonTransition;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const STYLES = {
  completed: {
    row: 'border-transparent',
    circle: 'border-green-600 bg-green-600',
    title: 'text-gray-900',
    line: 'bg-green-600',
  },
  current: {
    row: 'border-green-100 bg-green-50',
    circle: 'border-green-600 bg-white',
    title: 'text-gray-900',
    line: 'bg-gray-200',
  },
  locked: {
    row: 'border-transparent',
    circle: 'border-gray-200 bg-gray-100',
    title: 'text-gray-400',
    line: 'bg-gray-200',
  },
};

const STATUS_LABEL = {
  completed: 'concluída',
  current: 'aula atual',
  locked: 'trancada',
};

// Como a aula aparecia antes da transição
const PREVIOUS_STATUS: Record<LessonTransition, LessonStatus> = {
  completing: 'current',
  unlocking: 'locked',
};

// Sequência da animação, em ms: a aula vira concluída, a linha se preenche
// e a próxima aula destranca
const REVEAL_DELAY: Record<LessonTransition, number> = {
  completing: 350,
  unlocking: 1100,
};
const LINE_FILL_DURATION = 500;

// Uma aula do caminho: círculo com o estado, título e a linha até a próxima
export function LessonNode({
  lesson,
  isLast,
  transition,
  onPress,
  onLayout,
}: LessonNodeProps) {
  // Com transição, a aula começa no visual anterior e muda no meio da animação
  // Guarda qual transição já foi mostrada: assim a aula já aparece no visual
  // anterior no mesmo render em que a transição chega, sem piscar
  const [revealed, setRevealed] = useState<LessonTransition | null>(null);
  const isRevealed = !transition || revealed === transition;
  const scale = useSharedValue(1);
  const lineFill = useSharedValue(0);

  useEffect(() => {
    if (!transition) {
      return;
    }

    lineFill.value = 0;

    const timeout = setTimeout(() => {
      setRevealed(transition);
      scale.value = withSequence(
        withTiming(1.2, { duration: 140 }),
        withSpring(1, { damping: 8, stiffness: 160 })
      );
      if (transition === 'completing') {
        lineFill.value = withTiming(1, { duration: LINE_FILL_DURATION });
      }
    }, REVEAL_DELAY[transition]);

    return () => clearTimeout(timeout);
  }, [transition, scale, lineFill]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const lineFillStyle = useAnimatedStyle(() => ({
    height: `${lineFill.value * 100}%`,
  }));

  // O toque segue o estado real, mesmo durante a animação
  const isLocked = lesson.status === 'locked';
  const status =
    transition && !isRevealed ? PREVIOUS_STATUS[transition] : lesson.status;
  const styles = STYLES[status];
  const looksLocked = status === 'locked';

  return (
    <View onLayout={onLayout}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Aula ${lesson.number}: ${lesson.title}, ${STATUS_LABEL[lesson.status]}`}
        accessibilityState={{ disabled: isLocked }}
        disabled={isLocked}
        onPress={onPress}
        className={`flex-row items-center gap-4 rounded-2xl border p-3 active:opacity-70 ${styles.row}`}
      >
        <Animated.View
          className={`h-14 w-14 items-center justify-center rounded-full border-2 ${styles.circle}`}
          style={circleStyle}
        >
          {status === 'completed' ? (
            <Ionicons name="checkmark" size={26} color={colors.white} />
          ) : null}
          {status === 'current' ? (
            <Text className="font-poppins-bold text-lg text-green-700">
              {lesson.number}
            </Text>
          ) : null}
          {looksLocked ? (
            <Ionicons name="lock-closed" size={20} color={colors.placeholder} />
          ) : null}
        </Animated.View>

        <View className="flex-1">
          <Text
            numberOfLines={2}
            className={`font-poppins-semibold text-base ${styles.title}`}
          >
            {lesson.title}
          </Text>
          {lesson.duration > 0 ? (
            <Text
              className={`font-poppins text-xs ${looksLocked ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {lesson.duration} min
            </Text>
          ) : null}
        </View>

        {status === 'current' ? (
          <Ionicons name="play-circle" size={28} color={colors.green} />
        ) : null}
      </Pressable>

      {/* Alinhada ao centro do círculo: borda, padding e meio círculo */}
      {isLast ? null : transition === 'completing' ? (
        // Na conclusão, o verde desce pela linha em vez de aparecer de uma vez
        <View className="ml-[39px] h-5 w-1 overflow-hidden rounded-full bg-gray-200">
          <Animated.View
            className="w-full rounded-full bg-green-600"
            style={lineFillStyle}
          />
        </View>
      ) : (
        <View className={`ml-[39px] h-5 w-1 rounded-full ${styles.line}`} />
      )}
    </View>
  );
}
