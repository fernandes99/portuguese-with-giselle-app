import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { type ReactNode, useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';
import successSound from '@assets/sounds/success.wav';

interface ExerciseFeedbackSheetProps {
  visible: boolean;
  isCorrect: boolean;
  isLast: boolean;
  // Rótulo (vazio: sem rótulo) e conteúdo da resposta certa, mostrados só no
  // erro. O exercício guarda os dados à parte do atual, para o painel não
  // mudar enquanto desce e o próximo exercício já aparece.
  answerLabel: string;
  answer: ReactNode;
  onContinue: () => void;
  // Chamado quando o painel termina de descer. Só funciona no iOS: o Modal do
  // Android não avisa.
  onDismiss?: () => void;
}

// Painel que sobe depois de "Verificar": diz se o aluno acertou e, no erro,
// mostra a resposta certa
export function ExerciseFeedbackSheet({
  visible,
  isCorrect,
  isLast,
  answerLabel,
  answer,
  onContinue,
  onDismiss,
}: ExerciseFeedbackSheetProps) {
  const bottomInset = useModalBottomInset();
  const successPlayer = useAudioPlayer(successSound);

  useEffect(() => {
    if (!visible || !isCorrect) {
      return;
    }

    successPlayer
      .seekTo(0)
      .then(() => successPlayer.play())
      .catch(() => undefined);
  }, [visible, isCorrect, successPlayer]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onContinue}
      onDismiss={onDismiss}
    >
      <View className="flex-1 justify-end">
        <View
          accessibilityLiveRegion="polite"
          className={`gap-4 rounded-t-3xl border-t-2 px-5 pt-5 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
          style={{ paddingBottom: bottomInset + 16 }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${isCorrect ? 'bg-green-600' : 'bg-red-500'}`}
            >
              <Ionicons
                name={isCorrect ? 'checkmark' : 'close'}
                size={24}
                color={colors.white}
              />
            </View>
            <Text
              className={`font-poppins-bold text-xl ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
            >
              {isCorrect ? 'Correto!' : 'Não foi dessa vez'}
            </Text>
          </View>

          {isCorrect ? null : (
            <View className="gap-2">
              {answerLabel ? (
                <Text className="font-poppins-semibold text-sm text-red-700">
                  {answerLabel}
                </Text>
              ) : null}
              {answer}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            className={`h-14 items-center justify-center rounded-2xl ${isCorrect ? 'bg-green-600 active:bg-green-700' : 'bg-red-500 active:bg-red-600'}`}
          >
            <Text className="font-poppins-semibold text-base text-white">
              {isLast ? 'Ver resultado' : 'Continuar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
