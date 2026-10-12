import { useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

const PIECES = 36;
const COLORS = [
  colors.green,
  colors.darkGreen,
  colors.orange,
  colors.blue,
  colors.purple,
];

interface Piece {
  id: number;
  // Posição horizontal de partida, de 0 a 1 da largura da tela
  x: number;
  drift: number;
  delay: number;
  duration: number;
  turns: number;
  size: number;
  color: string;
}

function createPieces(): Piece[] {
  return Array.from({ length: PIECES }, (_, id) => ({
    id,
    x: Math.random(),
    drift: (Math.random() - 0.5) * 120,
    delay: Math.random() * 600,
    duration: 1800 + Math.random() * 900,
    turns: 1 + Math.random() * 3,
    size: 8 + Math.random() * 6,
    color: COLORS[id % COLORS.length],
  }));
}

function ConfettiPiece({
  piece,
  width,
  height,
}: {
  piece: Piece;
  width: number;
  height: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, {
        duration: piece.duration,
        easing: Easing.in(Easing.quad),
      })
    );
  }, [progress, piece]);

  const style = useAnimatedStyle(() => ({
    // Some no fim da queda
    opacity: progress.value < 0.8 ? 1 : (1 - progress.value) * 5,
    transform: [
      { translateX: piece.x * width + piece.drift * progress.value },
      { translateY: -20 + progress.value * (height * 0.75) },
      { rotate: `${progress.value * piece.turns * 360}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: piece.size,
          height: piece.size * 0.6,
          borderRadius: 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

// Confete que cai uma vez por cima da tela, sem atrapalhar os toques.
// Não aparece quando o sistema pede menos movimento.
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [pieces] = useState(createPieces);

  if (reducedMotion) {
    return null;
  }

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          piece={piece}
          width={width}
          height={height}
        />
      ))}
    </View>
  );
}
