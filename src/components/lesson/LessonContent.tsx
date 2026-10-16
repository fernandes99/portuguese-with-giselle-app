import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { HtmlContent } from '@/components/lesson/HtmlContent';
import { TranscriptionButton } from '@/components/lesson/TranscriptionButton';
import { colors } from '@/constants/theme';
import type { Lesson, LessonLink } from '@/services/lesson';
import { formatLessonNumber } from '@/utils/lesson';

interface LessonContentProps {
  lesson: Lesson;
  moduleTitle: string | null;
  nextLesson: LessonLink | null;
  // Número e duração da próxima aula, para o cartão "A seguir"
  nextLessonInfo: { number: number; duration: number } | null;
  isSaving: boolean;
  error: string;
  onToggleCompleted: () => void;
  onOpenNextLesson: () => void;
}

// Aba "Conteúdo": resumo da aula, o texto, a transcrição, o botão de concluir
// e a próxima aula
export function LessonContent({
  lesson,
  moduleTitle,
  nextLesson,
  nextLessonInfo,
  isSaving,
  error,
  onToggleCompleted,
  onOpenNextLesson,
}: LessonContentProps) {
  const nextLabel = nextLessonInfo
    ? [
        formatLessonNumber(nextLessonInfo.number),
        nextLessonInfo.duration > 0 ? `${nextLessonInfo.duration} MIN` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <View className="gap-5">
      <View className="gap-3">
        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
          {lesson.duration > 0 ? (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={16} color={colors.gray} />
              <Text className="font-poppins-medium text-xs text-gray-600">
                {lesson.duration} {lesson.duration === 1 ? 'minuto' : 'minutos'}
              </Text>
            </View>
          ) : null}
          {moduleTitle ? (
            <View className="flex-shrink flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-green-500" />
              <Text
                numberOfLines={1}
                className="flex-shrink font-poppins-medium text-xs text-gray-600"
              >
                {moduleTitle}
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="font-poppins-semibold text-2xl text-gray-900">
          {lesson.title}
        </Text>
        {lesson.description ? (
          <Text className="font-poppins text-base text-gray-600">
            {lesson.description}
          </Text>
        ) : null}
      </View>

      {lesson.content ? <HtmlContent html={lesson.content} /> : null}

      {lesson.hasTranscription ? (
        <TranscriptionButton lessonId={lesson.id} />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSaving }}
        onPress={onToggleCompleted}
        disabled={isSaving}
        className={`h-14 flex-row items-center justify-center gap-2 rounded-xl ${lesson.isCompleted ? 'border border-green-600 bg-green-50' : 'bg-green-600 active:bg-green-700'} ${isSaving ? 'opacity-60' : ''}`}
      >
        {isSaving ? (
          <ActivityIndicator
            color={lesson.isCompleted ? colors.darkGreen : colors.white}
          />
        ) : (
          <Ionicons
            name={lesson.isCompleted ? 'checkmark-circle' : 'checkmark'}
            size={22}
            color={lesson.isCompleted ? colors.darkGreen : colors.white}
          />
        )}
        <Text
          className={`font-poppins-semibold text-base ${lesson.isCompleted ? 'text-green-700' : 'text-white'}`}
        >
          {lesson.isCompleted ? 'Aula concluída' : 'Marcar como concluída'}
        </Text>
      </Pressable>

      {error ? (
        <Text className="font-poppins text-sm text-red-700">{error}</Text>
      ) : null}

      {nextLesson ? (
        <View className="gap-3 border-t border-gray-200 pt-5">
          <Text className="font-poppins-semibold text-lg text-gray-900">
            A seguir
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Próxima aula: ${nextLesson.title}`}
            onPress={onOpenNextLesson}
            className="flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 active:bg-gray-50"
          >
            <View className="h-12 w-12 items-center justify-center rounded-lg bg-green-50">
              <Ionicons name="play" size={20} color={colors.green} />
            </View>
            <View className="flex-1">
              {nextLabel ? (
                <Text className="font-poppins-medium text-xs tracking-widest text-gray-500">
                  {nextLabel}
                </Text>
              ) : null}
              <Text
                numberOfLines={2}
                className="font-poppins-semibold text-sm text-gray-900"
              >
                {nextLesson.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
