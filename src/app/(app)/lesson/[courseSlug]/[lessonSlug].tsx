import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CourseOutlineSheet } from '@/components/lesson/CourseOutlineSheet';
import { CourseProgressHeader } from '@/components/lesson/CourseProgressHeader';
import { DurationBadge } from '@/components/lesson/DurationBadge';
import { LessonMedia } from '@/components/lesson/LessonMedia';
import { LessonTabs } from '@/components/lesson/LessonTabs';
import { colors } from '@/constants/theme';
import { useLesson } from '@/hooks/useLesson';
import { getErrorMessage } from '@/lib/api';

export default function LessonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseSlug, lessonSlug } = useLocalSearchParams<{
    courseSlug: string;
    lessonSlug: string;
  }>();

  const { data, error, locked, reload, setCompleted } = useLesson(
    courseSlug,
    lessonSlug
  );
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  function openLesson(slug: string) {
    setIsOutlineOpen(false);
    if (slug === lessonSlug) {
      return;
    }

    // replace: voltar sai da aula em vez de percorrer as aulas visitadas
    router.replace({
      pathname: '/lesson/[courseSlug]/[lessonSlug]',
      params: { courseSlug, lessonSlug: slug },
    });
  }

  async function handleToggleCompleted() {
    if (!data || isSaving) {
      return;
    }

    const completed = !data.lesson.isCompleted;
    setActionError('');
    setIsSaving(true);
    try {
      await setCompleted(completed);
      // Como no site, concluir a aula já leva para a próxima
      if (completed && data.nextLesson) {
        openLesson(data.nextLesson.slug);
      }
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'Error completing lesson. Please try again.')
      );
    } finally {
      setIsSaving(false);
    }
  }

  const header = (
    <View className="flex-row items-center gap-2 px-3 py-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.back()}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
      >
        <Ionicons name="chevron-back" size={24} color={colors.gray} />
      </Pressable>
      <Text
        numberOfLines={1}
        className="flex-1 font-poppins-medium text-sm text-gray-600"
      >
        {data ? data.course.title : 'My courses'}
      </Text>
    </View>
  );

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        {header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          {locked ? (
            <>
              <Ionicons name="lock-closed" size={40} color={colors.gray} />
              <Text className="text-center font-poppins-bold text-xl text-gray-900">
                Students Only Content
              </Text>
              <Text className="text-center font-poppins text-base text-gray-600">
                This lesson is available only for enrolled students.
              </Text>
            </>
          ) : error ? (
            <>
              <Text className="text-center font-poppins text-base text-red-700">
                {error}
              </Text>
              <Button variant="link" label="Try again" onPress={reload} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.green} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { course, lesson } = data;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      {header}

      <ScrollView
        contentContainerClassName="gap-5 px-4 pt-2"
        // Espaço para a barra do curso, que fica por cima do conteúdo
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <LessonMedia key={lesson.id} lesson={lesson} />

        <View className="gap-3 rounded-xl border border-gray-100 bg-white p-5">
          <Text className="font-poppins-semibold text-2xl text-gray-900">
            {lesson.title}
          </Text>
          {lesson.description ? (
            <Text className="font-poppins text-base text-gray-600">
              {lesson.description}
            </Text>
          ) : null}
          {lesson.duration ? <DurationBadge minutes={lesson.duration} /> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isSaving }}
            onPress={handleToggleCompleted}
            disabled={isSaving}
            className={`mt-2 flex-row items-center gap-1.5 self-start rounded-lg px-3 py-2 ${lesson.isCompleted ? 'bg-green-100' : 'bg-blue-600'} ${isSaving ? 'opacity-60' : ''}`}
          >
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color={lesson.isCompleted ? colors.darkGreen : colors.white}
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={lesson.isCompleted ? colors.darkGreen : colors.white}
              />
            )}
            <Text
              className={`font-poppins-medium text-sm ${lesson.isCompleted ? 'text-green-700' : 'text-white'}`}
            >
              {lesson.isCompleted ? 'Lesson Completed' : 'Complete Lesson'}
            </Text>
          </Pressable>

          {actionError ? (
            <Text className="font-poppins text-sm text-red-700">
              {actionError}
            </Text>
          ) : null}
        </View>

        <LessonTabs
          key={lesson.id}
          lesson={lesson}
          prevLesson={data.prevLesson}
          nextLesson={data.nextLesson}
          onOpenLesson={(target) => openLesson(target.slug)}
        />
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 px-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open lessons panel"
          onPress={() => setIsOutlineOpen(true)}
          className="flex-row items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-lg"
        >
          <View className="flex-1">
            <CourseProgressHeader course={course} />
          </View>
          <Ionicons name="chevron-up" size={20} color={colors.placeholder} />
        </Pressable>
      </View>

      <CourseOutlineSheet
        visible={isOutlineOpen}
        course={course}
        currentLessonId={lesson.id}
        onClose={() => setIsOutlineOpen(false)}
        onSelectLesson={(target) => openLesson(target.slug)}
      />
    </SafeAreaView>
  );
}
