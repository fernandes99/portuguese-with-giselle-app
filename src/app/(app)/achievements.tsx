import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { AchievementSheet } from '@/components/achievements/AchievementSheet';
import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import { useAchievements } from '@/hooks/useProgress';
import type { Achievement } from '@/services/progress';
import { formatUnlockedDate } from '@/utils/progress';

// Topo da página: a última medalha conquistada em destaque e quantas o aluno
// já tem, com a barra
function Highlight({
  latest,
  unlocked,
  total,
  onSelect,
}: {
  // A desbloqueada mais recente; null se ainda não há nenhuma
  latest: Achievement | null;
  unlocked: number;
  total: number;
  onSelect: (achievement: Achievement) => void;
}) {
  const percentage = total ? Math.round((unlocked / total) * 100) : 0;
  const date = latest?.unlockedAt ? formatUnlockedDate(latest.unlockedAt) : '';

  return (
    <View className="gap-4 rounded-3xl bg-surface p-5">
      {latest ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Última conquista: ${latest.title}`}
          onPress={() => onSelect(latest)}
          className="flex-row items-center gap-4 active:opacity-70"
        >
          <AchievementBadge achievement={latest} size={96} />
          <View className="flex-1 gap-0.5">
            <Text className="font-poppins-semibold text-xs uppercase tracking-wider text-blue-700">
              Última conquista
            </Text>
            <Text className="font-poppins-bold text-xl text-gray-900">
              {latest.title}
            </Text>
            {date ? (
              <Text className="font-poppins text-sm text-gray-500">
                Em {date}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ) : (
        <View className="gap-1">
          <Text className="font-poppins-bold text-xl text-gray-900">
            Nenhuma conquista ainda
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            Toque numa medalha para ver como desbloquear.
          </Text>
        </View>
      )}

      <View className="gap-2">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-poppins-semibold text-sm text-gray-900">
            {unlocked} de {total} desbloqueadas
          </Text>
          <Text className="font-poppins-semibold text-sm text-blue-700">
            {percentage}%
          </Text>
        </View>
        <ProgressBar percentage={percentage} onGray />
      </View>
    </View>
  );
}

// Todas as conquistas do aluno, aberta pelo "Ver todas" do Progresso: a
// última em destaque e as medalhas em grade, as desbloqueadas antes das que
// faltam. Tocar numa medalha abre o detalhe.
export default function AchievementsScreen() {
  const { achievements, error, refreshing, refresh } = useAchievements();
  const [selected, setSelected] = useState<Achievement | null>(null);
  const unlocked =
    achievements?.items.filter((item) => item.unlockedAt !== null) ?? [];
  const locked =
    achievements?.items.filter((item) => item.unlockedAt === null) ?? [];

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
            <Highlight
              latest={unlocked[0] ?? null}
              unlocked={achievements.unlocked}
              total={achievements.total}
              onSelect={setSelected}
            />

            {unlocked.length > 0 ? (
              <View className="gap-2">
                <Text className="font-poppins-bold text-lg text-gray-900">
                  Desbloqueadas
                </Text>
                <AchievementGrid
                  achievements={unlocked}
                  onSelect={setSelected}
                />
              </View>
            ) : null}

            {locked.length > 0 ? (
              <View className="gap-2">
                <Text className="font-poppins-bold text-lg text-gray-900">
                  Para desbloquear
                </Text>
                <AchievementGrid achievements={locked} onSelect={setSelected} />
              </View>
            ) : null}
          </>
        ) : !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>

      <AchievementSheet
        achievement={selected}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}
