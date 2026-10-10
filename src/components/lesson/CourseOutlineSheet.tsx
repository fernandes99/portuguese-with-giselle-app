import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CourseProgressHeader } from '@/components/lesson/CourseProgressHeader';
import { colors } from '@/constants/theme';
import type { CourseOutline, OutlineLesson } from '@/services/lesson';

interface CourseOutlineSheetProps {
  visible: boolean;
  course: CourseOutline;
  currentLessonId: string;
  onClose: () => void;
  onSelectLesson: (lesson: OutlineLesson) => void;
}

function LessonIcon({
  isCurrent,
  isCompleted,
}: {
  isCurrent: boolean;
  isCompleted: boolean;
}) {
  if (isCurrent) {
    return <Ionicons name="play-circle" size={22} color={colors.blue} />;
  }
  if (isCompleted) {
    return <Ionicons name="checkmark-circle" size={22} color={colors.green} />;
  }
  return <Ionicons name="play-circle" size={22} color={colors.lightGray} />;
}

function getLessonClassNames(isCurrent: boolean, isCompleted: boolean) {
  if (isCurrent) return { row: 'bg-blue-50', title: 'text-blue-700' };
  if (isCompleted) return { row: '', title: 'text-green-700' };
  return { row: '', title: 'text-gray-600' };
}

// Painel que sobe da barra inferior com todos os módulos e aulas do curso
export function CourseOutlineSheet({
  visible,
  course,
  currentLessonId,
  onClose,
  onSelectLesson,
}: CourseOutlineSheetProps) {
  const insets = useSafeAreaInsets();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Ao abrir, só o módulo da aula atual começa expandido
  useEffect(() => {
    if (!visible) {
      return;
    }

    const currentModule = course.modules.find((module) =>
      module.lessons.some((lesson) => lesson.id === currentLessonId)
    );
    setOpenIds(new Set(currentModule ? [currentModule.id] : []));
  }, [visible, course.modules, currentLessonId]);

  function toggle(moduleId: string) {
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

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
          accessibilityLabel="Close lessons panel"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="h-[85%] rounded-t-2xl bg-white px-4 pt-4"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-base text-gray-900">
              Lessons
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close lessons panel"
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={22} color={colors.gray} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-2 pb-6">
            <View className="mb-3">
              <CourseProgressHeader course={course} />
            </View>

            {course.modules.map((module) => {
              const isOpen = openIds.has(module.id);

              return (
                <View key={module.id}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    onPress={() => toggle(module.id)}
                    className="flex-row items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5"
                  >
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={colors.gray}
                    />
                    <Text
                      numberOfLines={1}
                      className="flex-1 font-poppins-medium text-sm text-gray-800"
                    >
                      {module.title.trim()}
                    </Text>
                    <Ionicons name="time" size={12} color={colors.gray} />
                    <Text className="font-poppins text-xs text-gray-600">
                      {module.duration} min
                    </Text>
                  </Pressable>

                  {isOpen ? (
                    <View className="gap-1 py-2">
                      {module.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId;
                        const classNames = getLessonClassNames(
                          isCurrent,
                          lesson.isCompleted
                        );

                        return (
                          <Pressable
                            key={lesson.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isCurrent }}
                            onPress={() => onSelectLesson(lesson)}
                            className={`flex-row items-center gap-3 rounded-lg px-3 py-2 active:bg-gray-50 ${classNames.row}`}
                          >
                            <LessonIcon
                              isCurrent={isCurrent}
                              isCompleted={lesson.isCompleted}
                            />
                            <View className="flex-1">
                              <Text
                                numberOfLines={1}
                                className={`font-poppins text-sm ${classNames.title}`}
                              >
                                {lesson.title}
                              </Text>
                              <Text className="font-poppins-medium text-xs text-gray-500">
                                {lesson.duration} min
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
