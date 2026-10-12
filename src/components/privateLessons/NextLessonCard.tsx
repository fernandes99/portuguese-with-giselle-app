import { Text, View } from 'react-native';

import { LessonActions } from '@/components/privateLessons/LessonActions';
import type { PrivateLesson } from '@/services/privateLessons';
import {
  formatLessonDate,
  formatLessonTime,
  isLessonNow,
} from '@/utils/privateLessons';

interface NextLessonCardProps {
  lesson: PrivateLesson;
  changeNoticeHours: number;
  contactEmail: string;
  onChanged: () => void;
}

// A próxima aula particular do aluno, com as ações dela
export function NextLessonCard({
  lesson,
  changeNoticeHours,
  contactEmail,
  onChanged,
}: NextLessonCardProps) {
  const date = formatLessonDate(lesson.startTime);
  const time = formatLessonTime(lesson);

  return (
    <View className="gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <View
        accessible
        accessibilityLabel={`Próxima aula: ${date}, ${time}, ${lesson.title}`}
        className="gap-1"
      >
        <View className="flex-row items-center gap-2">
          <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
            Próxima aula
          </Text>
          {isLessonNow(lesson) ? (
            <View className="rounded-full bg-green-600 px-2 py-0.5">
              <Text className="font-poppins-semibold text-xs text-white">
                Agora
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="font-poppins-bold text-xl text-gray-900">{date}</Text>
        <Text className="font-poppins-medium text-base text-gray-700">
          {time}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">
          {lesson.title}
        </Text>
      </View>

      <LessonActions
        lesson={lesson}
        changeNoticeHours={changeNoticeHours}
        contactEmail={contactEmail}
        onChanged={onChanged}
      />
    </View>
  );
}
