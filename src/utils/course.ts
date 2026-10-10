import type { CourseOutline } from '@/services/lesson';
import { formatStudyTime } from '@/utils/format';

export function getCourseProgress(course: CourseOutline) {
  const percentage =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;

  return {
    percentage,
    isCompleted:
      course.totalLessons > 0 &&
      course.completedLessons === course.totalLessons,
  };
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function formatModules(count: number) {
  return plural(count, 'módulo', 'módulos');
}

export function formatLessons(count: number) {
  return plural(count, 'aula', 'aulas');
}

// "10 módulos · 30 aulas · 2h24". A duração some quando o CMS não a informa.
export function formatCourseMeta(course: CourseOutline) {
  const minutes = course.modules.reduce(
    (acc, module) => acc + module.duration,
    0
  );

  return [
    formatModules(course.modules.length),
    formatLessons(course.totalLessons),
    minutes > 0 ? formatStudyTime(minutes) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
