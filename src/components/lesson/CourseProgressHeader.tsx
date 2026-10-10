import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { CourseOutline } from '@/services/lesson';

// Título do curso, total de aulas e barra de progresso. Aparece na barra
// fixa da aula e no topo da lista de aulas.
export function CourseProgressHeader({ course }: { course: CourseOutline }) {
  const percentage =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;

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
        <Text className="font-poppins text-xs text-gray-400">
          {course.totalLessons} aulas
        </Text>
      </View>

      <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <View
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${percentage}%` }}
        />
      </View>

      <Text className="text-right font-poppins text-xs text-gray-400">
        {percentage}%
      </Text>
    </View>
  );
}
