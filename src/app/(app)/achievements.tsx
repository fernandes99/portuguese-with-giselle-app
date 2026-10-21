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
import { ProgressBar } from '@/components/ProgressBar';
import { AchievementList } from '@/components/progress/AchievementList';
import { colors } from '@/constants/theme';
import { useAchievements } from '@/hooks/useProgress';

// Todas as conquistas do aluno, aberta pelo "Ver todas" do Progresso: as
// desbloqueadas, com a data, e as que faltam, apagadas e com o cadeado
export default function AchievementsScreen() {
  const { achievements, error, refreshing, refresh } = useAchievements();
  const unlocked =
    achievements?.items.filter((item) => item.unlockedAt !== null) ?? [];
  const locked =
    achievements?.items.filter((item) => item.unlockedAt === null) ?? [];
  const percentage = achievements?.total
    ? Math.round((achievements.unlocked / achievements.total) * 100)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LessonHeader title="Conquistas" filled />

      <ScrollView
        contentContainerClassName="flex-grow gap-6 px-5 pb-8 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {achievements ? (
          <>
            <View className="gap-3">
              <Text className="font-poppins-bold text-xl text-gray-900">
                {achievements.unlocked} de {achievements.total} desbloqueadas
              </Text>
              <ProgressBar percentage={percentage} />
            </View>

            {unlocked.length > 0 ? (
              <View className="gap-3">
                <Text className="font-poppins-bold text-lg text-gray-900">
                  Desbloqueadas
                </Text>
                <AchievementList achievements={unlocked} />
              </View>
            ) : null}

            {locked.length > 0 ? (
              <View className="gap-3">
                <Text className="font-poppins-bold text-lg text-gray-900">
                  Para desbloquear
                </Text>
                <AchievementList achievements={locked} />
              </View>
            ) : null}
          </>
        ) : !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
