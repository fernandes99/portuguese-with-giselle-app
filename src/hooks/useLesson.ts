import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  getLesson,
  type LessonDetail,
  setLessonCompleted,
} from '@/services/lesson';

export function useLesson(courseSlug: string, lessonSlug: string) {
  const { token, signOut } = useAuth();

  const [data, setData] = useState<LessonDetail | null>(null);
  const [error, setError] = useState('');
  // 403: aula exclusiva para alunos pagantes
  const [locked, setLocked] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    setError('');
    try {
      setData(await getLesson(token, courseSlug, lessonSlug));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setLocked(true);
        return;
      }
      setError(getErrorMessage(err, 'Error loading lesson. Please try again.'));
    }
  }, [token, courseSlug, lessonSlug, signOut]);

  useEffect(() => {
    load();
  }, [load]);

  // Marca ou desmarca a aula atual como concluída e atualiza a lista do curso
  const setCompleted = useCallback(
    async (completed: boolean) => {
      if (!token || !data) {
        return;
      }

      const lessonId = data.lesson.id;
      await setLessonCompleted(token, lessonId, completed);

      setData((current) => {
        if (!current || current.lesson.id !== lessonId) {
          return current;
        }

        const modules = current.course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, isCompleted: completed }
              : lesson
          ),
        }));

        return {
          ...current,
          lesson: { ...current.lesson, isCompleted: completed },
          course: {
            ...current.course,
            modules,
            completedLessons: modules
              .flatMap((module) => module.lessons)
              .filter((lesson) => lesson.isCompleted).length,
          },
        };
      });
    },
    [token, data]
  );

  return { data, error, locked, reload: load, setCompleted };
}
