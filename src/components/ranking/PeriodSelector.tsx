import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { RankingPeriod } from '@/services/ranking';
import { formatPeriod } from '@/utils/ranking';

const OPTIONS: { value: RankingPeriod; label: string }[] = [
  { value: 'month', label: 'Este mês' },
  { value: 'total', label: 'Total' },
];

// O seletor em pílula e, embaixo, o período que a lista cobre. As datas só
// aparecem com a lista carregada; até lá, a linha fica vazia.
export function PeriodSelector({
  period,
  onChange,
  periodStart,
  periodEnd,
  isLoaded,
}: {
  period: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
  periodStart: string | null;
  periodEnd: string | null;
  isLoaded: boolean;
}) {
  return (
    <View className="items-center gap-4">
      <View
        accessibilityRole="tablist"
        className="flex-row rounded-full border border-gray-200 bg-white p-1"
      >
        {OPTIONS.map((option) => {
          const isActive = option.value === period;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(option.value)}
              className={`rounded-full px-6 py-2 ${isActive ? 'bg-green-600' : ''}`}
            >
              <Text
                className={`text-sm ${
                  isActive
                    ? 'font-poppins-semibold text-white'
                    : 'font-poppins text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="h-5 flex-row items-center gap-2">
        {isLoaded ? (
          <>
            <Ionicons name="calendar-outline" size={16} color={colors.gray} />
            <Text className="font-poppins text-sm text-gray-500">
              {formatPeriod(periodStart, periodEnd)}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
