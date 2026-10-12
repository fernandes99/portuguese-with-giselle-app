import { Text, View } from 'react-native';

import { LessonActions } from '@/components/privateLessons/LessonActions';
import type {
  PrivateLesson,
  PrivateLessonStatus,
} from '@/services/privateLessons';
import { formatLessonDate, formatLessonTime } from '@/utils/privateLessons';

const STATUS: Record<
  PrivateLessonStatus,
  { label: string; badgeClassName: string; textClassName: string }
> = {
  scheduled: {
    label: 'Agendada',
    badgeClassName: 'bg-green-100',
    textClassName: 'text-green-800',
  },
  completed: {
    label: 'Realizada',
    badgeClassName: 'bg-gray-100',
    textClassName: 'text-gray-700',
  },
  canceled: {
    label: 'Cancelada',
    badgeClassName: 'bg-red-50',
    textClassName: 'text-red-700',
  },
};

interface BookingRowProps {
  lesson: PrivateLesson;
  changeNoticeHours: number;
  contactEmail: string;
  onChanged: () => void;
}

// Um agendamento na lista: quando é, a situação e, se ainda vai acontecer,
// as ações
export function BookingRow({
  lesson,
  changeNoticeHours,
  contactEmail,
  onChanged,
}: BookingRowProps) {
  const status = STATUS[lesson.status];
  const date = formatLessonDate(lesson.startTime);
  const time = formatLessonTime(lesson);

  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <View
        accessible
        accessibilityLabel={`${date}, ${time}, ${lesson.title}, ${status.label}`}
        className="flex-row items-start gap-3"
      >
        <View className="flex-1 gap-0.5">
          <Text className="font-poppins-semibold text-base text-gray-900">
            {date}
          </Text>
          <Text className="font-poppins text-sm text-gray-700">{time}</Text>
          <Text className="font-poppins text-sm text-gray-500">
            {lesson.title}
          </Text>
          {lesson.status === 'canceled' ? (
            <Text className="mt-1 font-poppins text-xs text-gray-500">
              {lesson.creditReturned
                ? 'Aula devolvida ao seu saldo.'
                : 'Cancelada fora do prazo.'}
            </Text>
          ) : null}
        </View>
        <View className={`rounded-full px-3 py-1 ${status.badgeClassName}`}>
          <Text
            className={`font-poppins-semibold text-xs ${status.textClassName}`}
          >
            {status.label}
          </Text>
        </View>
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
