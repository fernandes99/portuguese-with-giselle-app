import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

const DEFAULT_SIZE = 88;
// Arrastar para a esquerda além disso cancela a gravação
const CANCEL_DISTANCE = 96;
// O botão para de acompanhar o dedo aqui
const MAX_DRAG = 140;

interface HoldToTalkButtonProps {
  // Dedo no botão (abrindo o gravador ou gravando)
  isHolding: boolean;
  isRecording: boolean;
  // Enquanto confere: o botão não responde
  disabled: boolean;
  // Volume da voz em dB, enquanto grava
  metering: number | undefined;
  // Duração máxima, para a barra de progresso
  maxDurationMs: number;
  // Diâmetro do botão; 88 na pronúncia
  size?: number;
  // Sem a barra de progresso: só o tempo, enquanto grava (barra do chat)
  compact?: boolean;
  onPressIn: () => void;
  onRelease: (cancel: boolean) => void;
}

// dB do expo-audio (de -160 a 0) para 0 a 1; abaixo de -50 é silêncio
function toLevel(metering: number | undefined) {
  if (metering === undefined) {
    return 0;
  }
  return Math.min(1, Math.max(0, (metering + 50) / 50));
}

function formatSeconds(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// Microfone de segurar para falar: soltar envia, arrastar para a esquerda e
// soltar cancela
export function HoldToTalkButton({
  isHolding,
  isRecording,
  disabled,
  metering,
  maxDurationMs,
  size = DEFAULT_SIZE,
  compact = false,
  onPressIn,
  onRelease,
}: HoldToTalkButtonProps) {
  const translateX = useSharedValue(0);
  const pressed = useSharedValue(0);
  const level = useSharedValue(0);
  const progress = useSharedValue(0);
  const [isInCancelZone, setIsInCancelZone] = useState(false);
  const isInCancelZoneRef = useRef(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    level.value = withTiming(toLevel(metering), { duration: 120 });
  }, [metering, level]);

  useEffect(() => {
    pressed.value = withSpring(isHolding ? 1 : 0, { damping: 14 });
  }, [isHolding, pressed]);

  // Barra e tempo correm só durante a gravação
  useEffect(() => {
    if (!isRecording) {
      cancelAnimation(progress);
      progress.value = 0;
      setElapsedMs(0);
      return;
    }

    progress.value = withTiming(1, {
      duration: maxDurationMs,
      easing: Easing.linear,
    });
    const startedAt = Date.now();
    const interval = setInterval(
      () => setElapsedMs(Date.now() - startedAt),
      200
    );
    return () => clearInterval(interval);
  }, [isRecording, maxDurationMs, progress]);

  // O gesto é criado uma vez (e quando muda o disabled): os callbacks atuais
  // ficam em refs, para não trocar o gesto no meio de uma gravação
  const onPressInRef = useRef(onPressIn);
  const onReleaseRef = useRef(onRelease);
  onPressInRef.current = onPressIn;
  onReleaseRef.current = onRelease;

  const gesture = useMemo(() => {
    function setCancelZone(value: boolean) {
      if (isInCancelZoneRef.current !== value) {
        isInCancelZoneRef.current = value;
        setIsInCancelZone(value);
      }
    }

    // Os callbacks rodam no JS: começam e param a gravação
    return (
      Gesture.Pan()
        .runOnJS(true)
        .enabled(!disabled)
        .minDistance(0)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          setCancelZone(false);
          onPressInRef.current();
        })
        .onUpdate((event) => {
          const x = Math.max(-MAX_DRAG, Math.min(0, event.translationX));
          translateX.value = x;
          setCancelZone(x <= -CANCEL_DISTANCE);
        })
        // O sistema tirou o toque (uma ligação, por exemplo): descarta
        .onTouchesCancelled(() => {
          setCancelZone(true);
        })
        .onFinalize(() => {
          translateX.value = withSpring(0, { damping: 16 });
          const cancel = isInCancelZoneRef.current;
          setCancelZone(false);
          onReleaseRef.current(cancel);
        })
    );
  }, [disabled, translateX]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: 1 + pressed.value * 0.12 },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: 1 + pressed.value * 0.15 + level.value * 0.6 },
    ],
    opacity: pressed.value * 0.25,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const action = isInCancelZone
    ? 'Solte para cancelar'
    : isHolding
      ? '‹ Deslize para cancelar'
      : 'Segure para falar';
  // Sem a barra, o tempo vai junto do aviso
  const hint =
    compact && isRecording ? `${formatSeconds(elapsedMs)}  ${action}` : action;

  return (
    <View className="items-center gap-3">
      <View className="h-6 flex-row items-center gap-1.5">
        {isInCancelZone ? (
          <Ionicons name="trash-outline" size={16} color={colors.red} />
        ) : null}
        <Text
          className={`font-poppins-semibold text-sm ${isInCancelZone ? 'text-red-500' : 'text-gray-500'}`}
        >
          {hint}
        </Text>
      </View>

      {/* Só o botão recebe o toque; o arrasto pode sair dele */}
      <GestureDetector gesture={gesture}>
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel="Segure para falar"
          accessibilityHint="Solte para enviar. Arraste para a esquerda para cancelar."
          accessibilityState={{ disabled, busy: isRecording }}
          style={{
            width: size,
            height: size,
            marginVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isInCancelZone ? colors.gray : colors.red,
              },
              haloStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: disabled
                  ? colors.gray
                  : isHolding
                    ? isInCancelZone
                      ? colors.gray
                      : colors.red
                    : colors.green,
              },
              buttonStyle,
            ]}
          >
            <Ionicons
              name={isInCancelZone ? 'close' : 'mic'}
              size={Math.round(size * 0.45)}
              color="#ffffff"
            />
          </Animated.View>
        </View>
      </GestureDetector>

      {compact ? null : (
        <View className="w-44 gap-1.5">
          <View className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <Animated.View
              style={[
                { height: '100%', backgroundColor: colors.red },
                progressStyle,
              ]}
            />
          </View>
          <Text className="text-center font-poppins text-xs text-gray-400">
            {formatSeconds(elapsedMs)} / {formatSeconds(maxDurationMs)}
          </Text>
        </View>
      )}
    </View>
  );
}
