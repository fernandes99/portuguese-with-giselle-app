import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { StudyDay } from '@/services/progress';
import { formatActiveDays, getWeekday } from '@/utils/progress';

interface StudyDaysProps {
  days: StudyDay[];
  activeDays: number;
  // Dia de hoje (AAAA-MM-DD), que fica em destaque
  today: string;
}

// A semana, de segunda a domingo, com os dias em que o aluno estudou
export function StudyDays({ days, activeDays, today }: StudyDaysProps) {
  return (
    <View className="gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <View className="flex-row justify-between">
        {days.map((day) => {
          const weekday = getWeekday(day.date);
          const isToday = day.date === today;

          return (
            <View
              key={day.date}
              accessible
              accessibilityLabel={`${weekday.full}, ${day.studied ? 'estudou' : 'sem estudo'}`}
              className="items-center gap-2"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${day.studied ? 'bg-green-600' : 'bg-gray-100'}`}
              >
                {day.studied ? (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                ) : null}
              </View>
              <Text
                className={
                  isToday
                    ? 'font-poppins-bold text-xs text-gray-900'
                    : 'font-poppins text-xs text-gray-500'
                }
              >
                {weekday.short}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center justify-center gap-2">
        <Ionicons
          name="calendar-outline"
          size={18}
          color={activeDays > 0 ? colors.green : colors.gray}
        />
        <Text className="font-poppins-medium text-sm text-gray-700">
          {formatActiveDays(activeDays)}
        </Text>
      </View>
    </View>
  );
}
