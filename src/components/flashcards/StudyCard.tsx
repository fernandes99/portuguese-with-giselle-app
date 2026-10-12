import { type Ref, useEffect, useImperativeHandle, useState } from 'react';
import { Image, Text, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { CardSide, FlashcardCard } from '@/services/flashcards';
import { getCardFontSize, getSideLabel } from '@/utils/flashcards';

const FLIP_DURATION = 320;
const LEAVE_DURATION = 220;
// Fração da largura da tela que o card precisa andar para contar como resposta
const SWIPE_RATIO = 0.28;
// Um arrasto rápido conta mesmo sem chegar à distância
const SWIPE_VELOCITY = 900;
const SPRING = { damping: 18, stiffness: 220 };

export interface StudyCardHandle {
  // Tira o card da tela para o lado da resposta, como um arrasto
  answer: (learned: boolean) => void;
}

interface StudyCardProps {
  card: FlashcardCard;
  // Lado que aparece primeiro
  isShowFront: boolean;
  // O card de cima responde aos gestos; o de baixo só espera a vez
  isTop: boolean;
  onAnswer: (learned: boolean) => void;
  ref?: Ref<StudyCardHandle>;
}

function SideContent({ side }: { side: CardSide }) {
  if (side.imageUrl) {
    return (
      <Image
        source={{ uri: `${side.imageUrl}?w=800&auto=compress` }}
        resizeMode="contain"
        className="h-full w-full"
      />
    );
  }

  return (
    <Text
      className="text-center font-poppins-semibold text-white"
      style={{
        fontSize: getCardFontSize(side.text),
        lineHeight: getCardFontSize(side.text) * 1.35,
      }}
    >
      {side.text}
    </Text>
  );
}

// Card de estudo: toque para virar, arraste para a direita ("aprendi") ou
// para a esquerda ("ainda aprendendo")
export function StudyCard({
  card,
  isShowFront,
  isTop,
  onAnswer,
  ref,
}: StudyCardProps) {
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [isBack, setIsBack] = useState(!isShowFront);

  const translateX = useSharedValue(0);
  // 0: frente à vista; 1: verso à vista
  const flip = useSharedValue(isShowFront ? 0 : 1);
  // 0: card de cima; 1: card de baixo, menor e um pouco mais abaixo
  const depth = useSharedValue(isTop ? 0 : 1);
  const isLeaving = useSharedValue(false);

  useEffect(() => {
    flip.value = withTiming(isBack ? 1 : 0, {
      duration: reducedMotion ? 0 : FLIP_DURATION,
    });
  }, [isBack, flip, reducedMotion]);

  useEffect(() => {
    depth.value = withTiming(isTop ? 0 : 1, {
      duration: reducedMotion ? 0 : LEAVE_DURATION,
    });
  }, [isTop, depth, reducedMotion]);

  function leave(learned: boolean) {
    'worklet';
    if (isLeaving.value) {
      return;
    }

    isLeaving.value = true;
    translateX.value = withTiming(
      (learned ? 1 : -1) * width * 1.5,
      { duration: reducedMotion ? 0 : LEAVE_DURATION },
      (finished) => {
        if (finished) {
          scheduleOnRN(onAnswer, learned);
        }
      }
    );
  }

  useImperativeHandle(ref, () => ({ answer: leave }));

  const pan = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-12, 12])
    .failOffsetY([-24, 24])
    .onUpdate((event) => {
      if (!isLeaving.value) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isLeaving.value) {
        return;
      }

      const toRight = event.translationX > 0;
      const isFar = Math.abs(event.translationX) > width * SWIPE_RATIO;
      const isFast =
        Math.abs(event.velocityX) > SWIPE_VELOCITY &&
        event.velocityX > 0 === toRight;

      if (isFar || isFast) {
        leave(toRight);
      } else {
        translateX.value = withSpring(0, SPRING);
      }
    });

  const tap = Gesture.Tap()
    .enabled(isTop)
    .runOnJS(true)
    .onEnd((_event, success) => {
      if (success) {
        setIsBack((current) => !current);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: interpolate(depth.value, [0, 1], [0, 14]) },
      {
        rotate: `${interpolate(translateX.value, [-width, 0, width], [-10, 0, 10])}deg`,
      },
      { scale: interpolate(depth.value, [0, 1], [1, 0.94]) },
    ],
  }));

  // Cada lado gira meia volta e some quando fica de perfil
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 0 : 1,
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [-180, 0])}deg` },
    ],
  }));

  // Selos que aparecem conforme o card anda para um lado
  const learnedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 90],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  const learningStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-90, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View
        accessible={isTop}
        accessibilityRole="button"
        accessibilityLabel={`${getSideLabel(isBack ? card.back : card.front)}. Toque para virar.`}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => setIsBack((current) => !current)}
        accessibilityElementsHidden={!isTop}
        importantForAccessibility={isTop ? 'yes' : 'no-hide-descendants'}
        style={cardStyle}
        className="absolute inset-0"
      >
        <Animated.View
          style={frontStyle}
          className="absolute inset-0 items-center justify-center rounded-3xl bg-blue-600 px-6 pb-14 pt-10"
        >
          <SideContent side={card.front} />
          <Text className="absolute bottom-5 font-poppins text-sm text-white/70">
            Toque para virar
          </Text>
        </Animated.View>

        <Animated.View
          style={backStyle}
          className="absolute inset-0 items-center justify-center rounded-3xl bg-green-600 px-6 pb-14 pt-10"
        >
          <SideContent side={card.back} />
          <Text className="absolute bottom-5 font-poppins text-sm text-white/70">
            Toque para virar
          </Text>
        </Animated.View>

        <Animated.View
          style={learnedStyle}
          className="absolute left-4 top-4 rounded-full bg-white px-3 py-1"
        >
          <Text className="font-poppins-semibold text-sm text-green-700">
            Aprendi
          </Text>
        </Animated.View>
        <Animated.View
          style={learningStyle}
          className="absolute right-4 top-4 rounded-full bg-white px-3 py-1"
        >
          <Text className="font-poppins-semibold text-sm text-orange-600">
            Ainda aprendendo
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
