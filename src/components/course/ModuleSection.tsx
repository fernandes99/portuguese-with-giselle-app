import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { OutlineLesson, OutlineModule } from '@/services/lesson';
import { formatLessons } from '@/utils/course';

interface ModuleSectionProps {
  module: OutlineModule;
  index: number;
  isOpen: boolean;
  // Aula em que o aluno deve continuar, destacada na lista
  nextLessonSlug: string | null;
  onToggle: () => void;
  onOpenLesson: (lesson: OutlineLesson) => void;
}

function LessonIcon({
  isCompleted,
  isNext,
}: {
  isCompleted: boolean;
  isNext: boolean;
}) {
  if (isCompleted) {
    return <Ionicons name="checkmark-circle" size={24} color={colors.green} />;
  }
  if (isNext) {
    return <Ionicons name="play-circle" size={24} color={colors.green} />;
  }
  return (
    <Ionicons name="play-circle-outline" size={24} color={colors.placeholder} />
  );
}

export function ModuleSection({
  module,
  index,
  isOpen,
  nextLessonSlug,
  onToggle,
  onOpenLesson,
}: ModuleSectionProps) {
  const total = module.lessons.length;
  const completed = module.lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const isEmpty = total === 0;
  const isCompleted = !isEmpty && completed === total;

  const summary = isEmpty
    ? 'Em breve'
    : [
        `${completed}/${formatLessons(total)}`,
        module.duration > 0 ? `${module.duration} min` : null,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled: isEmpty }}
        onPress={onToggle}
        disabled={isEmpty}
        className={`flex-row items-center gap-3 p-4 active:bg-gray-50 ${isEmpty ? 'opacity-60' : ''}`}
      >
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${isCompleted ? 'bg-green-600' : 'bg-green-100'}`}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color={colors.white} />
          ) : (
            <Text className="font-poppins-bold text-base text-green-700">
              {index + 1}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={2}
            className="font-poppins-semibold text-base text-gray-900"
          >
            {module.title.trim()}
          </Text>
          <Text className="font-poppins text-xs text-gray-500">{summary}</Text>
        </View>

        {isEmpty ? null : (
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.gray}
          />
        )}
      </Pressable>

      {isOpen
        ? module.lessons.map((lesson) => {
            const isNext = lesson.slug === nextLessonSlug;

            return (
              <Pressable
                key={lesson.id}
                accessibilityRole="button"
                onPress={() => onOpenLesson(lesson)}
                className={`flex-row items-center gap-3 border-t border-gray-100 px-4 py-3 active:bg-gray-50 ${isNext ? 'bg-green-50' : ''}`}
              >
                <LessonIcon isCompleted={lesson.isCompleted} isNext={isNext} />
                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className={`font-poppins text-sm ${lesson.isCompleted ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    {lesson.title}
                  </Text>
                  {lesson.duration > 0 ? (
                    <Text className="font-poppins text-xs text-gray-500">
                      {lesson.duration} min
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.placeholder}
                />
              </Pressable>
            );
          })
        : null}
    </View>
  );
}
