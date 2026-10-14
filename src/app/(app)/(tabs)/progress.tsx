import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { AchievementList } from '@/components/progress/AchievementList';
import { ActivityChart } from '@/components/progress/ActivityChart';
import { StreakSummary } from '@/components/progress/StreakSummary';
import { StudyDays } from '@/components/progress/StudyDays';
import { StatCard } from '@/components/StatCard';
import { TabTopBar } from '@/components/TabTopBar';
import { colors } from '@/constants/theme';
import { useProgress } from '@/hooks/useProgress';
import type { Course } from '@/services/courses';
import { formatLessons, getCourseProgress } from '@/utils/course';
import { formatStreak, formatStudyTime } from '@/utils/format';

function Section({
  title,
  detail,
  children,
}: {
  title: string;
  // Texto curto à direita do título
  detail?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-poppins-bold text-xl text-gray-900">{title}</Text>
        {detail ? (
          <Text className="font-poppins-medium text-sm text-gray-500">
            {detail}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CourseProgress({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const { percentage, isCompleted } = getCourseProgress(course);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, ${percentage}% concluído`}
      onPress={onPress}
      className="gap-2 rounded-xl border border-gray-100 bg-white p-4 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-2">
        <Text
          numberOfLines={2}
          className="flex-1 font-poppins-semibold text-base text-gray-900"
        >
          {course.title}
        </Text>
        {isCompleted ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.green} />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        )}
      </View>
      <ProgressBar percentage={percentage} />
      <Text className="font-poppins text-xs text-gray-500">
        {course.completedLessons} de {formatLessons(course.totalLessons)} ·{' '}
        {percentage}%
      </Text>
    </Pressable>
  );
}

// Números do aluno, o hábito de estudo, as conquistas e o andamento de
// cada curso
export default function ProgressScreen() {
  const router = useRouter();
  const { progress, courses, error, refreshing, refresh } = useProgress();
  // Cursos sem aulas ainda não têm o que medir
  const coursesWithLessons = courses?.filter(
    (course) => course.totalLessons > 0
  );
  // O último dia do gráfico é hoje, no fuso do aparelho
  const today = progress?.activity[progress.activity.length - 1]?.date ?? '';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow gap-6 px-5 pb-8 pt-3"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <TabTopBar />

        <View>
          <Text className="font-poppins-bold text-3xl text-gray-900">
            Progresso
          </Text>
          <Text className="mt-1 font-poppins text-base text-gray-600">
            Acompanhe o quanto você já avançou.
          </Text>
        </View>

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {progress ? (
          <>
            <View className="gap-3">
              <View className="flex-row gap-3">
                <StatCard
                  value={`${progress.stats.completedModules}/${progress.stats.totalModules}`}
                  label="Módulos Completos"
                  icon="book"
                  iconColor={colors.blue}
                  iconBgClassName="bg-blue-100"
                />
                <StatCard
                  value={formatStudyTime(progress.stats.studyMinutes)}
                  label="Horas Estudadas"
                  icon="time"
                  iconColor={colors.green}
                  iconBgClassName="bg-green-100"
                />
              </View>
              <View className="flex-row gap-3">
                <StatCard
                  value={`${progress.stats.completedLessons}/${progress.stats.totalLessons}`}
                  label="Lições Completadas"
                  icon="ribbon"
                  iconColor={colors.purple}
                  iconBgClassName="bg-purple-100"
                />
                <StatCard
                  value={formatStreak(progress.stats.currentStreak)}
                  label="Sequência Atual"
                  icon="trending-up"
                  iconColor={colors.orange}
                  iconBgClassName="bg-orange-100"
                />
              </View>
            </View>

            <Section title="Dias de estudo">
              <StudyDays
                days={progress.week.days}
                activeDays={progress.week.activeDays}
                today={today}
              />
            </Section>

            <Section title="Últimos 7 dias">
              <ActivityChart activity={progress.activity} />
            </Section>

            <Section title="Sequência">
              <StreakSummary
                current={progress.streak.current}
                best={progress.streak.best}
              />
            </Section>

            {progress.achievements.total > 0 ? (
              <Section
                title="Conquistas"
                detail={`${progress.achievements.unlocked} de ${progress.achievements.total}`}
              >
                <AchievementList achievements={progress.achievements.items} />
              </Section>
            ) : null}
          </>
        ) : null}

        {coursesWithLessons?.length ? (
          <Section title="Meus cursos">
            {coursesWithLessons.map((course) => (
              <CourseProgress
                key={course.id}
                course={course}
                onPress={() =>
                  router.push({
                    pathname: '/course/[courseSlug]',
                    params: { courseSlug: course.slug },
                  })
                }
              />
            ))}
          </Section>
        ) : null}

        {!progress && !courses && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
