import type { Course } from '@/services/courses';
import type { CourseOutline, OutlineLesson } from '@/services/lesson';
import { getCourseProgress } from '@/utils/course';

export type LessonStatus = 'completed' | 'current' | 'locked';

export interface PathLesson extends OutlineLesson {
  status: LessonStatus;
  // Posição da aula no curso, começando em 1
  number: number;
}

export interface PathModule {
  id: string;
  title: string;
  completedLessons: number;
  lessons: PathLesson[];
}

// Curso que a aba Aprender abre: o que está em andamento; sem ele, o
// recomendado pelo backend (o do nível do aluno); sem nenhum dos dois, o
// primeiro da lista.
export function getDefaultCourse(courses: Course[]) {
  return (
    courses.find(
      (course) => course.isStarted && !getCourseProgress(course).isCompleted
    ) ??
    courses.find((course) => course.recommended) ??
    courses[0] ??
    null
  );
}

export interface PathTransition {
  completedId: string;
  // null quando a aula concluída é a última do curso
  unlockedId: string | null;
}

// Aulas que a aba Aprender anima quando o aluno volta de uma aula recém
// concluída. Só vale quando ela era a aula atual do caminho: está concluída
// e a seguinte passou a ser a atual. Feita fora de ordem, não há o que animar.
export function getPathTransition(
  path: PathModule[],
  completedId: string
): PathTransition | null {
  const lessons = path.flatMap((module) => module.lessons);
  const index = lessons.findIndex((lesson) => lesson.id === completedId);

  if (index === -1 || lessons[index].status !== 'completed') {
    return null;
  }

  const next = lessons[index + 1];
  if (!next) {
    return { completedId, unlockedId: null };
  }

  return next.status === 'current'
    ? { completedId, unlockedId: next.id }
    : null;
}

// Caminho do curso em sequência estrita: a aula atual é a primeira não
// concluída, e tudo depois dela fica trancado, mesmo o que o aluno concluiu
// fora de ordem. O bloqueio vale só para a aba Aprender.
export function getLearnPath(course: CourseOutline): PathModule[] {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const firstPending = lessons.findIndex((lesson) => !lesson.isCompleted);
  // Curso todo concluído: nenhuma aula atual e nenhuma trancada
  const currentIndex = firstPending === -1 ? lessons.length : firstPending;

  let position = 0;

  return course.modules.map((module) => ({
    id: module.id,
    title: module.title.trim(),
    completedLessons: module.lessons.filter((lesson) => lesson.isCompleted)
      .length,
    lessons: module.lessons.map((lesson) => {
      const index = position;
      position += 1;

      let status: LessonStatus = 'locked';
      if (index < currentIndex) {
        status = 'completed';
      } else if (index === currentIndex) {
        status = 'current';
      }

      return { ...lesson, status, number: index + 1 };
    }),
  }));
}
