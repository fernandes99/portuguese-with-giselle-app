import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { PracticeCorrection } from '@/services/practice';

// Fica sob a mensagem do aluno: a frase corrigida e a explicação, ou só um
// "Muito bem!" quando não há erros
export function CorrectionCard({
  correction,
}: {
  correction: PracticeCorrection;
}) {
  if (!correction.hasErrors) {
    return (
      <View className="flex-row items-center gap-1.5 self-end">
        <Ionicons name="checkmark-circle" size={16} color={colors.green} />
        <Text className="font-poppins-medium text-xs text-green-700">
          Muito bem!
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-1.5 rounded-2xl border border-gray-200 bg-white p-3">
      <Text className="font-poppins-semibold text-[11px] tracking-widest text-gray-500">
        CORREÇÃO
      </Text>
      <Text className="font-poppins-semibold text-[15px] leading-6 text-green-700">
        {correction.corrected}
      </Text>
      {correction.explanation ? (
        <Text className="font-poppins text-sm leading-5 text-gray-600">
          {correction.explanation}
        </Text>
      ) : null}
    </View>
  );
}
