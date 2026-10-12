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
import { CourseCard } from '@/components/course/CourseCard';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getCourses } from '@/services/courses';

export default function CoursesScreen() {
  const router = useRouter();
  const {
    data: courses,
    error,
    refreshing,
    refresh,
  } = useApiQuery(getCourses, 'Erro ao carregar os cursos.');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Cursos" />
      <ScrollView
        contentContainerClassName="flex-grow gap-5 px-5 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <Text className="font-poppins text-base text-gray-600">
          Escolha um curso e continue de onde parou.
        </Text>

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {courses?.map((course) => (
          <CourseCard
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

        {courses?.length === 0 ? (
          <Text className="text-center font-poppins text-base text-gray-600">
            Nenhum curso disponível no momento.
          </Text>
        ) : null}

        {!courses && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
