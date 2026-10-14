import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { Course } from '@/services/courses';
import { formatLessons, getCourseProgress } from '@/utils/course';

interface LearnHeaderProps {
  course: Course;
  // Sem outro curso para escolher, o título não abre o seletor
  canSwitch: boolean;
  onSwitch: () => void;
}

// Topo da aba Aprender: curso selecionado e o progresso nele
export function LearnHeader({ course, canSwitch, onSwitch }: LearnHeaderProps) {
  const { percentage } = getCourseProgress(course);

  return (
    <View className="gap-3">
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            canSwitch ? `${course.title}, trocar de curso` : course.title
          }
          disabled={!canSwitch}
          onPress={onSwitch}
          hitSlop={8}
          className="flex-1 flex-row items-center gap-2 active:opacity-70"
        >
          <Text
            numberOfLines={2}
            className="shrink font-poppins-bold text-2xl text-gray-900"
          >
            {course.title}
          </Text>
          {canSwitch ? (
            <Ionicons name="chevron-down" size={22} color={colors.gray} />
          ) : null}
        </Pressable>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <ProgressBar percentage={percentage} />
        </View>
        <Text className="font-poppins-bold text-sm text-green-700">
          {percentage}%
        </Text>
      </View>

      <Text className="font-poppins text-xs text-gray-500">
        {course.completedLessons} de {formatLessons(course.totalLessons)}{' '}
        {course.completedLessons === 1 ? 'concluída' : 'concluídas'}
      </Text>
    </View>
  );
}
