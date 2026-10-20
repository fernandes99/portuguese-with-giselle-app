import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import { SimulationIntro } from '@/components/simulations/SimulationIntro';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getCachedSimulation, getSimulations } from '@/services/simulations';

// Um cenário das simulações. Abre na hora com o cenário da lista; sem ele
// (link direto ou o app reaberto aqui), espera a lista carregar de novo.
export default function SimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // `simulation` vem null quando o cenário saiu da lista (despublicado)
  const fetchSimulation = useCallback(
    async (token: string) => ({
      simulation:
        (await getSimulations(token)).simulations.find(
          (item) => item.id === id
        ) ?? null,
    }),
    [id]
  );
  const { data, error, refresh } = useApiQuery(
    fetchSimulation,
    'Não foi possível carregar a simulação.'
  );
  const simulation = data ? data.simulation : getCachedSimulation(id);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title={simulation?.title ?? 'Simulação'} />

      {simulation ? (
        <SimulationIntro simulation={simulation} />
      ) : error ? (
        <View className="m-5 gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="font-poppins text-sm text-red-700">{error}</Text>
          <Button variant="link" label="Tentar de novo" onPress={refresh} />
        </View>
      ) : data ? (
        <View className="p-5">
          <EmptyState title="Esta simulação não está mais disponível." />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      )}
    </SafeAreaView>
  );
}
