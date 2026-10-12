import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { LessonMedia } from '@/components/lesson/LessonMedia';
import { colors } from '@/constants/theme';
import type { Lesson } from '@/services/lesson';

// A aula tem vídeo ou, no lugar dele, uma apresentação
export function hasLessonMedia(lesson: Lesson) {
  return Boolean(lesson.videoId || lesson.canvaUrl);
}

// Primeira parte da aula guiada: o vídeo, quando a aula tem, e a apresentação
export function IntroStep({
  lesson,
  onPlay,
}: {
  lesson: Lesson;
  // O aluno tocou no play; é o que libera o "Continuar" desta parte
  onPlay: () => void;
}) {
  return (
    <View className="gap-5">
      {/* O vídeo é opcional: sem ele, a parte fica só com a apresentação */}
      {hasLessonMedia(lesson) ? (
        <View className="overflow-hidden rounded-2xl">
          <LessonMedia lesson={lesson} onPlay={onPlay} />
        </View>
      ) : null}

      <View className="gap-2">
        {lesson.duration > 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="time-outline" size={16} color={colors.gray} />
            <Text className="font-poppins-medium text-xs text-gray-600">
              {lesson.duration} {lesson.duration === 1 ? 'minuto' : 'minutos'}
            </Text>
          </View>
        ) : null}
        <Text className="font-poppins-semibold text-3xl leading-10 text-gray-900">
          {lesson.title}
        </Text>
        {lesson.description ? (
          <Text className="font-poppins text-base leading-6 text-gray-600">
            {lesson.description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
