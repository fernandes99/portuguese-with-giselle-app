import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatStreak } from '@/utils/format';

function StreakBlock({
  icon,
  label,
  days,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  days: number;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
        <Ionicons name={icon} size={20} color={colors.orange} />
      </View>
      <View className="flex-1">
        <Text className="font-poppins-bold text-lg text-gray-900">
          {formatStreak(days)}
        </Text>
        <Text className="font-poppins text-xs text-gray-500">{label}</Text>
      </View>
    </View>
  );
}

// Dias seguidos: a sequência de agora e a maior que o aluno já fez
export function StreakSummary({
  current,
  best,
}: {
  current: number;
  best: number;
}) {
  return (
    <View className="flex-row gap-3">
      <StreakBlock icon="flame" label="Sequência atual" days={current} />
      <StreakBlock icon="trophy" label="Melhor sequência" days={best} />
    </View>
  );
}
