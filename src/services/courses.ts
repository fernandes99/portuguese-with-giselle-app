import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';
import type { CourseOutline, LessonLink } from '@/services/lesson';
import type { PortugueseLevel } from '@/services/preferences';

export interface Course extends CourseOutline {
  description: string | null;
  // Nível mínimo para fazer o curso; null quando o curso não tem
  pathLevel: PortugueseLevel | null;
  // O curso do nível do aluno, que a aba Início abre primeiro; no máximo um
  recommended: boolean;
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
