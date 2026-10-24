import { Pressable, Text, View } from 'react-native';

import type { RankingPeriod } from '@/services/ranking';

const OPTIONS: { value: RankingPeriod; label: string }[] = [
  { value: 'month', label: 'Este mês' },
  { value: 'total', label: 'Total' },
];

export function PeriodSelector({
  period,
  onChange,
}: {
  period: RankingPeriod;
  onChange: (period: RankingPeriod) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === period;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-full border py-2 ${
              isActive ? 'border-gray-200 bg-white' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm ${
                isActive
                  ? 'font-poppins-semibold text-gray-900'
                  : 'font-poppins text-gray-600'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
