import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Simulation } from '@/services/simulations';
import { SIMULATION_LEVEL_TITLES } from '@/utils/simulations';

// Apresentação de um cenário antes de começar: a cena e as tarefas
export function SimulationIntro({ simulation }: { simulation: Simulation }) {
  return (
    <ScrollView contentContainerClassName="flex-grow gap-6 px-5 pb-8 pt-4">
      <View className="items-center gap-3">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <Text style={{ includeFontPadding: false }} className="text-5xl">
            {simulation.emoji}
          </Text>
        </View>
        <View className="items-center gap-1">
          <Text className="text-center font-poppins-bold text-2xl text-gray-900">
            {simulation.title}
          </Text>
          <Text className="font-poppins-medium text-sm text-gray-500">
            {SIMULATION_LEVEL_TITLES[simulation.level]}
          </Text>
        </View>
        <Text className="text-center font-poppins text-base text-gray-700">
          {simulation.description}
        </Text>
      </View>

      <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="font-poppins-semibold text-base text-gray-900">
          Suas tarefas
        </Text>
        {simulation.tasks.map((task) => (
          <View key={task} className="flex-row items-start gap-3">
            <Ionicons name="ellipse-outline" size={20} color={colors.gray} />
            <Text className="flex-1 font-poppins text-sm text-gray-700">
              {task}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
