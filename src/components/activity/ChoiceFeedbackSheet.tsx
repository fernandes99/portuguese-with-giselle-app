import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioButton } from '@/components/activity/ActivityAudio';
import { colors } from '@/constants/theme';
import { type ChoiceExercise, getLetter, isAudio } from '@/utils/choice';
import successSound from '@assets/sounds/success.wav';

export interface ChoiceFeedback {
  exercise: ChoiceExercise;
  isCorrect: boolean;
  isLast: boolean;
}

interface ChoiceFeedbackSheetProps {
  visible: boolean;
  // Guardado à parte do exercício atual, para o painel não mudar enquanto
  // desce e o próximo exercício já aparece
  feedback: ChoiceFeedback | null;
  onContinue: () => void;
}

// Painel que sobe depois de "Verificar": diz se o aluno acertou e, no erro,
// mostra a resposta certa
export function ChoiceFeedbackSheet({
  visible,
  feedback,
  onContinue,
}: ChoiceFeedbackSheetProps) {
  const insets = useSafeAreaInsets();
  const successPlayer = useAudioPlayer(successSound);
  const isCorrect = feedback?.isCorrect ?? false;

  useEffect(() => {
    if (!visible || !isCorrect) {
      return;
    }

    successPlayer
      .seekTo(0)
      .then(() => successPlayer.play())
      .catch(() => undefined);
  }, [visible, isCorrect, successPlayer]);

  if (!feedback) {
    return null;
  }

  const answers = feedback.exercise.alternatives
    .map((alternative, position) => ({ alternative, position }))
    .filter(({ alternative }) => alternative.isCorrect);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onContinue}
    >
      <View className="flex-1 justify-end">
        <View
          accessibilityLiveRegion="polite"
          className={`gap-4 rounded-t-3xl border-t-2 px-5 pt-5 ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
          style={{ paddingBottom: insets.bottom + 16 }}
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
              <Text className="font-poppins-semibold text-sm text-red-700">
                {answers.length > 1 ? 'Respostas certas:' : 'Resposta certa:'}
              </Text>
              {answers.map(({ alternative, position }) => (
                <View
                  key={alternative.id}
                  className="flex-row items-center gap-3"
                >
                  <Text className="flex-1 font-poppins-medium text-base text-gray-900">
                    {alternative.title.trim() ||
                      `Alternativa ${getLetter(position)}`}
                  </Text>
                  {isAudio(alternative.file) ? (
                    <AudioButton url={alternative.file.url} />
                  ) : null}
                </View>
              ))}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            className={`h-14 items-center justify-center rounded-2xl ${isCorrect ? 'bg-green-600 active:bg-green-700' : 'bg-red-500 active:bg-red-600'}`}
          >
            <Text className="font-poppins-semibold text-base text-white">
              {feedback.isLast ? 'Ver resultado' : 'Continuar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
