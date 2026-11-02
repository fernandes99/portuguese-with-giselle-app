import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { percentage } = getCourseProgress(course);

  return (
    <View className="gap-3">
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            canSwitch
              ? t('entry.learn.switchCourse', { title: course.title })
              : course.title
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
        {t('entry.learn.courseProgress', {
          count: course.completedLessons,
          lessons: formatLessons(course.totalLessons),
        })}
      </Text>
    </View>
  );
}
