import { useRouter } from 'expo-router';
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
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getSimulations } from '@/services/simulations';
import { getRemainingTodayLabel } from '@/utils/simulations';

// Cenários das simulações. Recarrega ao voltar de uma simulação, para "Feita"
// e o que resta hoje aparecerem atualizados.
export default function SimulationsScreen() {
  const router = useRouter();
  const {
    data: list,
    error,
    refreshing,
    refresh,
  } = useApiQuery(getSimulations, 'Não foi possível carregar as simulações.');

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
        <View className="gap-1">
          <Text className="font-poppins text-base text-gray-600">
            Converse em situações do dia a dia e cumpra as tarefas.
          </Text>
          {list ? (
            <Text className="font-poppins-medium text-sm text-gray-900">
              {getRemainingTodayLabel(list.remainingToday, list.limitPerDay)}
            </Text>
          ) : null}
        </View>

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {list?.simulations.map((simulation) => (
          <SimulationCard
            key={simulation.id}
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
        ))}

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
