import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type { Simulation } from '@/services/simulations';
import { SIMULATION_LEVEL_TITLES } from '@/utils/simulations';

// Apresentação de um cenário antes de começar: a cena, as tarefas e o botão
// de começar. No limite do dia, o botão dá lugar ao aviso.
export function SimulationIntro({
  simulation,
  isStarting,
  limitMessage,
  error,
  onStart,
}: {
  simulation: Simulation;
  isStarting: boolean;
  // O aluno fez as simulações de hoje; null quando ainda pode começar
  limitMessage: string | null;
  // Falha ao começar, acima do botão
  error: string | null;
  onStart: () => void;
}) {
  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="flex-grow gap-6 px-5 pb-6 pt-4">
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

      <View className="gap-3 border-t border-gray-200 bg-white px-5 py-4">
        {limitMessage ? (
          <View className="gap-1">
            <Text className="text-center font-poppins-medium text-sm text-gray-900">
              {limitMessage}
            </Text>
            <Text className="text-center font-poppins text-xs text-gray-500">
              Os limites voltam à meia-noite (horário de Brasília).
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <Text
                accessibilityLiveRegion="polite"
                className="text-center font-poppins text-sm text-red-700"
              >
                {error}
              </Text>
            ) : null}
            <Button
              label={isStarting ? 'Preparando...' : 'Começar'}
              loading={isStarting}
              onPress={onStart}
            />
          </>
        )}
      </View>
    </View>
  );
}
