import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import { SimulationCard } from '@/components/simulations/SimulationCard';
import { SimulationFilters } from '@/components/simulations/SimulationFilters';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getSimulations } from '@/services/simulations';
import {
  getRemainingTodayLabel,
  getSimulationCategories,
  getVisibleSimulations,
} from '@/utils/simulations';

// Cenários das simulações, em grade, com o filtro por categoria. Recarrega ao
// voltar de uma simulação, para "Feita" e o que resta hoje aparecerem
// atualizados.
export default function SimulationsScreen() {
  const router = useRouter();
  const {
    data: list,
    error,
    refreshing,
    refresh,
  } = useApiQuery(getSimulations, 'Não foi possível carregar as simulações.');
  // A categoria escolhida, só enquanto a tela está aberta; null é "Todas"
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const simulations = list?.simulations ?? [];
  const categories = getSimulationCategories(simulations);
  const visible = getVisibleSimulations(simulations, categoryId);
  // A categoria escolhida sumiu ao recarregar: o filtro volta para "Todas"
  const selectedId = categories.some((category) => category.id === categoryId)
    ? categoryId
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Simulações" />
      <ScrollView
        contentContainerClassName="flex-grow gap-4 px-5 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <View className="gap-2">
          <Text className="font-poppins text-base text-gray-600">
            Converse em situações do dia a dia e cumpra os objetivos.
          </Text>
          {list ? (
            <View className="self-start rounded-full bg-green-100 px-3 py-1">
              <Text className="font-poppins-medium text-sm text-green-800">
                {getRemainingTodayLabel(list.remainingToday, list.limitPerDay)}
              </Text>
            </View>
          ) : null}
        </View>

        {categories.length >= 2 ? (
          <SimulationFilters
            categories={categories}
            selectedId={selectedId}
            onSelect={setCategoryId}
          />
        ) : null}

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        <View className="-mx-1.5 flex-row flex-wrap">
          {visible.map((simulation) => (
            <View key={simulation.id} className="w-1/2 p-1.5">
              <SimulationCard
                simulation={simulation}
                onPress={() =>
                  simulation.isLocked
                    ? router.push('/plans')
                    : router.push({
                        pathname: '/practice/simulations/[id]',
                        params: { id: simulation.id },
                      })
                }
              />
            </View>
          ))}
        </View>

        {list?.simulations.length === 0 ? (
          <EmptyState title="Nenhuma simulação por aqui ainda." />
        ) : null}

        {!list && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
