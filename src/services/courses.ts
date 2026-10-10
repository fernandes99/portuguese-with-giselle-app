import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';
import type { CourseOutline, LessonLink } from '@/services/lesson';

export interface Course extends CourseOutline {
  description: string | null;
  // O aluno já abriu ou concluiu alguma aula do curso
  isStarted: boolean;
  // Primeira aula ainda não concluída; null se o curso não tem aulas
  nextLesson: LessonLink | null;
}

export async function getCourses(token: string) {
  const { courses } = await api<{ courses: Course[] }>(API_ROUTES.courses, {
    token,
  });
  return courses;
}

export function getCourse(token: string, courseSlug: string) {
  return api<Course>(API_ROUTES.course(courseSlug), { token });
}
