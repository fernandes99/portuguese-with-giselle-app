import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { CourseOutline } from '@/services/lesson';
import { formatLessons, getCourseProgress } from '@/utils/course';

// Título do curso, total de aulas e barra de progresso, no topo da lista
// de aulas.
export function CourseProgressHeader({ course }: { course: CourseOutline }) {
  const { percentage } = getCourseProgress(course);

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Ionicons name="book" size={16} color={colors.gray} />
        <Text
          numberOfLines={1}
          className="flex-1 font-poppins-semibold text-base text-gray-900"
        >
          {course.title}
        </Text>
        <Text className="font-poppins text-xs text-gray-500">
          {formatLessons(course.totalLessons)}
        </Text>
      </View>

      <ProgressBar percentage={percentage} />

      <Text className="text-right font-poppins text-xs text-gray-500">
        {percentage}%
      </Text>
    </View>
  );
}
