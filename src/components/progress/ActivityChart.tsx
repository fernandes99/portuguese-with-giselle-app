import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { DayActivity } from '@/services/progress';
import { formatDayActivity, getChartBars, getWeekday } from '@/utils/progress';

// Altura da maior barra
const CHART_HEIGHT = 140;

// De cima para baixo na barra; a legenda mostra na ordem inversa
const SERIES = [
  { key: 'practices', label: 'Práticas', color: colors.green },
  { key: 'activities', label: 'Exercícios', color: colors.purple },
  { key: 'lessons', label: 'Aulas', color: colors.blue },
] as const;

// O que o aluno fez em cada um dos últimos 7 dias, em barras empilhadas
export function ActivityChart({ activity }: { activity: DayActivity[] }) {
  const bars = getChartBars(activity, CHART_HEIGHT);
  const isEmpty = bars.every((bar) => bar.total === 0);
  const today = activity[activity.length - 1]?.date;

  return (
    <View className="gap-4 rounded-3xl bg-surface p-4">
      {isEmpty ? (
        <View
          className="items-center justify-center"
          style={{ height: CHART_HEIGHT }}
        >
          <Text className="text-center font-poppins text-sm text-gray-500">
            Nenhuma atividade nos últimos 7 dias
          </Text>
        </View>
      ) : (
        <View className="flex-row gap-2">
          {bars.map((bar) => {
            const weekday = getWeekday(bar.date);

            return (
              <View
                key={bar.date}
                accessible
                accessibilityLabel={`${weekday.full}: ${formatDayActivity(bar)}`}
                className="flex-1 items-center gap-1.5"
              >
                {/* O total fica colado no topo da barra */}
                <View
                  className="w-full items-center justify-end gap-1"
                  style={{ height: CHART_HEIGHT + 20 }}
                >
                  {bar.total > 0 ? (
                    <>
                      <Text className="font-poppins-medium text-xs text-gray-700">
                        {bar.total}
                      </Text>
                      <View
                        className="w-full max-w-[28px] overflow-hidden rounded-md"
                        style={{ height: bar.height }}
                      >
                        {SERIES.map((series) =>
                          bar[series.key] > 0 ? (
                            <View
                              key={series.key}
                              style={{
                                flex: bar[series.key],
                                backgroundColor: series.color,
                              }}
                            />
                          ) : null
                        )}
                      </View>
                    </>
                  ) : (
                    <View className="h-0.5 w-full max-w-[28px] rounded-full bg-gray-300" />
                  )}
                </View>
                <Text
                  className={
                    bar.date === today
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
      )}

      {isEmpty ? null : (
        <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1">
          {[...SERIES].reverse().map((series) => (
            <View key={series.key} className="flex-row items-center gap-1.5">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <Text className="font-poppins text-xs text-gray-600">
                {series.label} ·{' '}
                {bars.reduce((sum, bar) => sum + bar[series.key], 0)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
