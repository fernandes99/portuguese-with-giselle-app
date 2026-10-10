import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { Course } from '@/services/courses';
import {
  formatCourseMeta,
  formatLessons,
  getCourseProgress,
} from '@/utils/course';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

function getBadge(course: Course, isCompleted: boolean) {
  if (course.totalLessons === 0) {
    return { label: 'Em breve', className: 'bg-gray-900/70' };
  }
  if (isCompleted) {
    return { label: 'Concluído', className: 'bg-green-600' };
  }
  if (course.isStarted) {
    return { label: 'Em andamento', className: 'bg-blue-600' };
  }
  return null;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const { percentage, isCompleted } = getCourseProgress(course);
  const badge = getBadge(course, isCompleted);
  const isEmpty = course.totalLessons === 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={course.title}
      accessibilityState={{ disabled: isEmpty }}
      onPress={onPress}
      disabled={isEmpty}
      className={`overflow-hidden rounded-2xl border border-gray-100 bg-white active:opacity-90 ${isEmpty ? 'opacity-60' : ''}`}
    >
      <View>
        {course.imageUrl ? (
          <Image
            source={{ uri: `${course.imageUrl}?w=800&auto=compress` }}
            resizeMode="cover"
            className="h-40 w-full bg-gray-100"
          />
        ) : (
          <View className="h-40 w-full items-center justify-center bg-green-50">
            <Ionicons name="book-outline" size={40} color={colors.green} />
          </View>
        )}
        {badge ? (
          <View
            className={`absolute left-3 top-3 rounded-full px-3 py-1 ${badge.className}`}
          >
            <Text className="font-poppins-medium text-xs text-white">
              {badge.label}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="gap-2 p-4">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={2}
            className="flex-1 font-poppins-bold text-lg text-gray-900"
          >
            {course.title}
          </Text>
          {isEmpty ? null : (
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          )}
        </View>

        {course.description ? (
          <Text
            numberOfLines={2}
            className="font-poppins text-sm text-gray-600"
          >
            {course.description}
          </Text>
        ) : null}

        {isEmpty ? null : (
          <Text className="font-poppins text-xs text-gray-500">
            {formatCourseMeta(course)}
          </Text>
        )}

        {course.isStarted && !isEmpty ? (
          <View className="mt-1 gap-1.5">
            <ProgressBar percentage={percentage} />
            <Text className="font-poppins text-xs text-gray-500">
              {course.completedLessons} de {formatLessons(course.totalLessons)}{' '}
              · {percentage}%
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
