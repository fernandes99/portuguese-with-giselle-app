import { t } from '@/lib/i18n';
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

export function formatModules(count: number) {
  return t('common.modules', { count });
}

export function formatLessons(count: number) {
  return t('common.lessons', { count });
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
