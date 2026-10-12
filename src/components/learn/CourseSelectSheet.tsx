import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { Course } from '@/services/courses';
import { formatLessons, getCourseProgress } from '@/utils/course';

interface CourseSelectSheetProps {
  visible: boolean;
  courses: Course[];
  selectedSlug: string;
  onClose: () => void;
  onSelect: (course: Course) => void;
}

// Painel que sobe da barra inferior para trocar o curso da aba Aprender
export function CourseSelectSheet({
  visible,
  courses,
  selectedSlug,
  onClose,
  onSelect,
}: CourseSelectSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar a lista de cursos"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="max-h-[75%] rounded-t-2xl bg-white px-4 pt-4"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-base text-gray-900">
              Cursos
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar a lista de cursos"
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={22} color={colors.gray} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-3 pb-6">
            {courses.map((course) => {
              const isSelected = course.slug === selectedSlug;
              const { percentage } = getCourseProgress(course);

              return (
                <Pressable
                  key={course.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(course)}
                  className={`gap-2 rounded-2xl border p-4 active:opacity-70 ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                >
                  <View className="flex-row items-center gap-3">
                    <Text
                      numberOfLines={2}
                      className="flex-1 font-poppins-semibold text-base text-gray-900"
                    >
                      {course.title}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.green}
                      />
                    ) : null}
                  </View>
                  <ProgressBar percentage={percentage} />
                  <Text className="font-poppins text-xs text-gray-500">
                    {course.completedLessons} de{' '}
                    {formatLessons(course.totalLessons)}{' '}
                    {course.completedLessons === 1 ? 'concluída' : 'concluídas'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
