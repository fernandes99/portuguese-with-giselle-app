import type { CourseOutline } from '@/services/lesson';

// Onde a aula fica no curso: módulo, número dentro do módulo e duração
export function findLessonPosition(course: CourseOutline, lessonSlug: string) {
  for (const module of course.modules) {
    const index = module.lessons.findIndex(
      (lesson) => lesson.slug === lessonSlug
    );

    if (index !== -1) {
      return {
        moduleTitle: module.title.trim(),
        number: index + 1,
        duration: module.lessons[index].duration,
      };
    }
  }

  return null;
}

// 4 -> "AULA 04"
export function formatLessonNumber(number: number) {
  return `AULA ${String(number).padStart(2, '0')}`;
}
