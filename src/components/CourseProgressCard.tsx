import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type { DashboardCourse } from '@/services/dashboard';

interface CourseProgressCardProps {
  course: DashboardCourse;
  actionLabel: string;
  onPress: () => void;
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-lg bg-green-50 px-3 py-2">
      <Text className="font-poppins text-xs text-gray-600">{label}</Text>
      <Text className="font-poppins-semibold text-lg text-gray-900">
        {value}
      </Text>
    </View>
  );
}

export function CourseProgressCard({
  course,
  actionLabel,
  onPress,
}: CourseProgressCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {course.imageUrl ? (
        <Image
          // Parâmetros do imgix (DatoCMS) para não baixar a imagem original
          source={{ uri: `${course.imageUrl}?w=800&auto=compress` }}
          accessibilityLabel={course.title}
          resizeMode="cover"
          className="h-44 w-full bg-gray-100"
        />
      ) : (
        <View className="h-44 w-full items-center justify-center bg-green-50">
          <Ionicons name="book-outline" size={40} color={colors.green} />
        </View>
      )}

      <View className="gap-4 p-4">
        <View>
          <Text
            numberOfLines={2}
            className="font-poppins-bold text-lg text-gray-900"
          >
            {course.title}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-1 font-poppins text-sm text-gray-600"
          >
            {course.lesson.title}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Counter
            label="Módulos"
            value={`${course.completedModules}/${course.totalModules}`}
          />
          <Counter
            label="Aula"
            value={`${course.lesson.number}/${course.lesson.total}`}
          />
        </View>

        <Button label={actionLabel} onPress={onPress} />
      </View>
    </View>
  );
}
