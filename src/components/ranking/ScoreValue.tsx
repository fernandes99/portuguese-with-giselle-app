import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatScore } from '@/utils/ranking';

// O score com a estrela azul, a marca dele em todo o ranking
export function ScoreValue({
  score,
  size = 'sm',
}: {
  score: number;
  size?: 'sm' | 'md';
}) {
  const isMedium = size === 'md';

  return (
    <View
      accessible
      accessibilityLabel={`${formatScore(score)} pontos`}
      className="flex-row items-center gap-1"
    >
      <Ionicons name="star" size={isMedium ? 16 : 14} color={colors.blue} />
      <Text
        className={`font-poppins-bold text-blue-600 ${isMedium ? 'text-base' : 'text-sm'}`}
      >
        {formatScore(score)}
      </Text>
    </View>
  );
}
