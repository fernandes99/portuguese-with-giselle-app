import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { colors } from '@/constants/theme';
import type { Simulation } from '@/services/simulations';
import { formatTasks, SIMULATION_LEVEL_TITLES } from '@/utils/simulations';

// Um cenário na lista de simulações. O trancado leva a etiqueta Premium no
// lugar do nível; quem chama decide para onde o toque leva.
export function SimulationCard({
  simulation,
  onPress,
}: {
  simulation: Simulation;
  onPress: () => void;
}) {
  const level = SIMULATION_LEVEL_TITLES[simulation.level];
  const tasks = formatTasks(simulation.tasks.length);
  const label = simulation.isLocked
    ? `${simulation.title}, exclusivo do plano Premium`
    : [simulation.title, level, tasks, simulation.isCompleted ? 'feita' : null]
        .filter(Boolean)
        .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        simulation.isLocked ? 'Abre a tela do plano Premium' : undefined
      }
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <Text style={{ includeFontPadding: false }} className="text-2xl">
          {simulation.emoji}
        </Text>
      </View>

      <View className="flex-1 gap-1">
        <Text
          numberOfLines={2}
          className="font-poppins-semibold text-base text-gray-900"
        >
          {simulation.title}
        </Text>
        <Text numberOfLines={2} className="font-poppins text-sm text-gray-600">
          {simulation.description}
        </Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
          {simulation.isLocked ? (
            <PremiumBadge />
          ) : (
            <Text className="font-poppins-medium text-xs text-gray-500">
              {level}
            </Text>
          )}
          <Text className="font-poppins text-xs text-gray-400">·</Text>
          <Text className="font-poppins text-xs text-gray-500">{tasks}</Text>
          {simulation.isCompleted ? (
            <View className="flex-row items-center gap-1">
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.green}
              />
              <Text className="font-poppins-medium text-xs text-green-700">
                Feita
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </Pressable>
  );
}
