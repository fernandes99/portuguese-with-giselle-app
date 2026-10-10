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
import { CourseProgressCard } from '@/components/CourseProgressCard';
import { StatCard } from '@/components/StatCard';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardCourse } from '@/services/dashboard';
import { formatStreak, formatStudyTime, getFirstName } from '@/utils/format';

const GREETING = {
  started: {
    title: 'Pronto para continuar?',
    text: 'Você está mais perto da fluência a cada aula.',
    action: 'Continuar',
  },
  notStarted: {
    title: 'Pronto para começar?',
    text: 'Sua jornada rumo à fluência começa com a primeira aula.',
    action: 'Começar',
  },
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, error, refreshing, refresh } = useDashboard();

  function openLesson(course: DashboardCourse | null) {
    if (!course) {
      return;
    }

    router.push({
      pathname: '/lesson/[courseSlug]/[lessonSlug]',
      params: { courseSlug: course.slug, lessonSlug: course.lesson.slug },
    });
  }

  const firstName = getFirstName(user?.name);
  const greeting = data?.hasStarted ? GREETING.started : GREETING.notStarted;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow gap-6 px-5 pb-8 pt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <Text className="font-poppins-medium text-base text-gray-600">
          {firstName ? `Olá, ${firstName}!` : 'Olá!'}
        </Text>

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {data ? (
          <>
            <View className="-mt-4">
              <Text className="font-poppins-bold text-3xl text-gray-900">
                {greeting.title}
              </Text>
              <Text className="mt-1 font-poppins text-base text-gray-600">
                {greeting.text}
              </Text>
            </View>

            {data.course ? (
              <CourseProgressCard
                course={data.course}
                actionLabel={greeting.action}
                onPress={() => openLesson(data.course)}
              />
            ) : null}

            <View className="gap-3">
              <Text className="font-poppins-bold text-xl text-gray-900">
                Meu progresso
              </Text>
              <View className="flex-row gap-3">
                <StatCard
                  value={`${data.stats.completedModules}/${data.stats.totalModules}`}
                  label="Módulos Completos"
                  icon="book"
                  iconColor={colors.blue}
                  iconBgClassName="bg-blue-100"
                />
                <StatCard
                  value={formatStudyTime(data.stats.studyMinutes)}
                  label="Horas Estudadas"
                  icon="time"
                  iconColor={colors.green}
                  iconBgClassName="bg-green-100"
                />
              </View>
              <View className="flex-row gap-3">
                <StatCard
                  value={`${data.stats.completedLessons}/${data.stats.totalLessons}`}
                  label="Lições Completadas"
                  icon="ribbon"
                  iconColor={colors.purple}
                  iconBgClassName="bg-purple-100"
                />
                <StatCard
                  value={formatStreak(data.stats.currentStreak)}
                  label="Sequência Atual"
                  icon="trending-up"
                  iconColor={colors.orange}
                  iconBgClassName="bg-orange-100"
                />
              </View>
            </View>
          </>
        ) : null}

        {!data && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
