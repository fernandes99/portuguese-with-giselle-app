import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';

interface ActivityResultProps {
  correct: number;
  total: number;
  // O que está sendo contado quando não são perguntas, ex.: "lacunas"
  unit?: string;
  onRetry: () => void;
}

// Placar no fim de uma atividade feita passo a passo
export function ActivityResult({
  correct,
  total,
  unit,
  onRetry,
}: ActivityResultProps) {
  const isAllCorrect = correct === total;

  return (
    <View className="items-center gap-3 rounded-xl bg-gray-50 p-5">
      <Ionicons
        name={isAllCorrect ? 'trophy' : 'ribbon-outline'}
        size={36}
        color={isAllCorrect ? colors.green : colors.gray}
      />
      <Text className="text-center font-poppins-bold text-lg text-gray-900">
        Você acertou {correct} de {total}
        {unit ? ` ${unit}` : ''}
      </Text>
      <Text className="text-center font-poppins text-sm text-gray-600">
        {isAllCorrect
          ? 'Parabéns! Atividade concluída.'
          : 'Acerte tudo para concluir a atividade.'}
      </Text>
      <Button variant="link" label="Tentar de novo" onPress={onRetry} />
    </View>
  );
}
