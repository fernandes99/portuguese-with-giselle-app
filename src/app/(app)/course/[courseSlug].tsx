import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ModuleSection } from '@/components/course/ModuleSection';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getCourse } from '@/services/courses';
import {
  formatCourseMeta,
  formatLessons,
  getCourseProgress,
} from '@/utils/course';

export default function CourseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseSlug } = useLocalSearchParams<{ courseSlug: string }>();

  const fetchCourse = useCallback(
    (token: string) => getCourse(token, courseSlug),
    [courseSlug]
  );
  const {
    data: course,
    error,
    refresh,
  } = useApiQuery(fetchCourse, 'Erro ao carregar o curso.');

  const [openIds, setOpenIds] = useState<Set<string> | null>(null);
  const nextLessonSlug = course?.nextLesson?.slug ?? null;

  // Na primeira carga, abre o módulo da aula em que o aluno deve continuar
  useEffect(() => {
    if (!course || openIds) {
      return;
    }

    const current = course.modules.find((module) =>
      module.lessons.some((lesson) => lesson.slug === nextLessonSlug)
    );
    setOpenIds(new Set(current ? [current.id] : []));
  }, [course, openIds, nextLessonSlug]);

  function toggle(moduleId: string) {
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function openLesson(lessonSlug: string) {
    router.push({
      pathname: '/lesson/[courseSlug]/[lessonSlug]',
      params: { courseSlug, lessonSlug },
    });
  }

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={() => router.back()}
      hitSlop={8}
      className="absolute left-4 h-10 w-10 items-center justify-center rounded-full bg-white/90"
      style={{ top: insets.top + 8 }}
    >
      <Ionicons name="chevron-back" size={24} color={colors.gray} />
    </Pressable>
  );

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        {error ? (
          <>
            <Text className="text-center font-poppins text-base text-red-700">
              {error}
            </Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colors.green} />
        )}
        {backButton}
      </View>
    );
  }

  const { percentage, isCompleted } = getCourseProgress(course);
  const { nextLesson } = course;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        // Espaço para o botão fixo no rodapé
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {course.imageUrl ? (
          <Image
            source={{ uri: `${course.imageUrl}?w=1000&auto=compress` }}
            resizeMode="cover"
            className="h-56 w-full bg-gray-100"
          />
        ) : (
          <View className="h-56 w-full items-center justify-center bg-green-50">
            <Ionicons name="book-outline" size={48} color={colors.green} />
          </View>
        )}

        <View className="gap-5 px-5 pt-5">
          <View className="gap-2">
            <Text className="font-poppins-bold text-2xl text-gray-900">
              {course.title}
            </Text>
            {course.description ? (
              <Text className="font-poppins text-base text-gray-600">
                {course.description}
              </Text>
            ) : null}
            <Text className="font-poppins text-sm text-gray-500">
              {formatCourseMeta(course)}
            </Text>
          </View>

          <View className="gap-2 rounded-2xl border border-gray-100 bg-white p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-poppins-semibold text-sm text-gray-900">
                Seu progresso
              </Text>
              <Text className="font-poppins-bold text-sm text-green-700">
                {percentage}%
              </Text>
            </View>
            <ProgressBar percentage={percentage} />
            <Text className="font-poppins text-xs text-gray-500">
              {course.completedLessons} de {formatLessons(course.totalLessons)}{' '}
              {course.completedLessons === 1 ? 'concluída' : 'concluídas'}
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-poppins-bold text-xl text-gray-900">
              Conteúdo do curso
            </Text>
            {course.modules.map((module, index) => (
              <ModuleSection
                key={module.id}
                module={module}
                index={index}
                isOpen={openIds?.has(module.id) ?? false}
                nextLessonSlug={isCompleted ? null : nextLessonSlug}
                onToggle={() => toggle(module.id)}
                onOpenLesson={(lesson) => openLesson(lesson.slug)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {backButton}

      {nextLesson ? (
        <View
          className="absolute inset-x-0 bottom-0 border-t border-gray-100 bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            label={
              isCompleted
                ? 'Rever curso'
                : course.isStarted
                  ? 'Continuar'
                  : 'Começar curso'
            }
            onPress={() => openLesson(nextLesson.slug)}
          />
        </View>
      ) : null}
    </View>
  );
}
