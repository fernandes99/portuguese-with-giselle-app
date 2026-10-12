import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { TeacherAvatar } from '@/components/teacherChat/MessageBubble';
import { colors } from '@/constants/theme';
import { useTeacherChatUnread } from '@/contexts/TeacherChatUnreadContext';
import { formatUnread } from '@/utils/teacherChat';

// Quanto o dedo precisa arrastar para a direita para fechar o botão
const DISMISS_DISTANCE = 80;
// Um arrasto rápido fecha mesmo sem chegar à distância
const DISMISS_VELOCITY = 800;
// Para onde o botão vai ao fechar: fora da tela, à direita
const HIDDEN_OFFSET = 320;
const LEAVE_DURATION = 180;

// Botão flutuante do chat com a professora, no canto inferior direito da aba
// Aprender, acima do menu. Só aparece quando o backend libera (a partir da
// terceira aula concluída). O aluno fecha pelo X ou arrastando para a
// direita; ele volta na próxima vez que o app abrir. O chat também abre pelo
// Perfil.
export function TeacherChatButton() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { available, dismissed, unread, refreshUnread, dismiss } =
    useTeacherChatUnread();
  const translateX = useSharedValue(0);

  // A aba ganhou foco, inclusive na volta de uma aula recém-concluída
  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

  // Quando o botão volta, volta para o lugar
  useEffect(() => {
    if (!dismissed) {
      translateX.value = 0;
    }
  }, [dismissed, translateX]);

  function leave() {
    'worklet';
    translateX.value = withTiming(
      HIDDEN_OFFSET,
      { duration: reducedMotion ? 0 : LEAVE_DURATION },
      (finished) => {
        if (finished) {
          scheduleOnRN(dismiss);
        }
      }
    );
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-24, 24])
    .onUpdate((event) => {
      // Só acompanha o dedo para a direita
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd((event) => {
      const isFar = event.translationX > DISMISS_DISTANCE;
      const isFast = event.velocityX > DISMISS_VELOCITY;

      if (isFar || isFast) {
        leave();
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [0, HIDDEN_OFFSET / 2], [1, 0.3]),
  }));

  if (!available || dismissed) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={style}
        className="absolute bottom-4 right-4 flex-row items-center rounded-full border border-gray-200 bg-white p-1.5"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0
              ? `Falar com a professora, ${unread} mensagens não lidas`
              : 'Precisa de ajuda? Fale com a professora'
          }
          onPress={() => router.push('/teacher-chat')}
          className="flex-row items-center gap-2.5 pr-2 active:opacity-70"
        >
          <View>
            <TeacherAvatar size={36} />
            {unread > 0 ? (
              <View className="absolute -right-1 -top-1 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-green-600 px-1">
                <Text
                  // Sem o espaço extra da fonte, o número fica no centro
                  style={{ includeFontPadding: false }}
                  className="font-poppins-bold text-[9px] leading-[12px] text-white"
                >
                  {formatUnread(unread)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Altura de linha fixa: as duas linhas ficam centradas com a foto */}
          <View className="justify-center">
            <Text
              style={{ includeFontPadding: false }}
              className="font-poppins-medium text-xs leading-4 text-gray-900"
            >
              Precisa de ajuda?
            </Text>
            <Text
              style={{ includeFontPadding: false }}
              className="font-poppins text-[11px] leading-4 text-gray-500"
            >
              Fale com a professora
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={dismiss}
          hitSlop={8}
          className="h-6 w-6 items-center justify-center rounded-full active:bg-gray-100"
        >
          <Ionicons name="close" size={14} color={colors.gray} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
