import streakMascot from '@assets/streak-mascot.png';
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { DayActivity, StudyDay } from '@/services/progress';
import { formatStreak } from '@/utils/format';
import { getWeekday } from '@/utils/progress';

interface StreakCardProps {
  current: number;
  best: number;
  // A semana, de segunda a domingo
  days: StudyDay[];
  // Últimos 7 dias: cobrem a semana até hoje e trazem as práticas no chat,
  // que não contam como dia de estudo
  activity: DayActivity[];
  // Dia de hoje (AAAA-MM-DD), que fica em destaque
  today: string;
}

// Círculo de um dia da semana: estudou (aula, exercício ou card) fica laranja
// com o check; hoje sem estudo, laranja com o número; só praticou no chat,
// laranja um pouco mais forte; os outros, laranja claro, mais apagados nos
// que ainda não chegaram
function DayMark({
  date,
  studied,
  practiced,
  isToday,
  isFuture,
}: {
  date: string;
  studied: boolean;
  practiced: boolean;
  isToday: boolean;
  isFuture: boolean;
}) {
  const weekday = getWeekday(date);
  const day = Number(date.slice(8));
  const status = studied ? 'estudou' : practiced ? 'praticou' : 'sem estudo';

  let circle: string;
  let number: string;
  if (isToday) {
    circle = 'bg-orange-500';
    number = 'text-white';
  } else if (practiced) {
    circle = 'bg-orange-200';
    number = 'text-orange-800';
  } else {
    circle = isFuture ? 'bg-orange-100 opacity-60' : 'bg-orange-100';
    number = 'text-orange-700';
  }

  return (
    <View
      accessible
      accessibilityLabel={`${weekday.full}, ${status}`}
      className="items-center gap-1.5"
    >
      <Text
        className={
          isToday
            ? 'font-poppins-bold text-xs text-gray-900'
            : 'font-poppins text-xs text-gray-500'
        }
      >
        {weekday.short}
      </Text>
      {studied ? (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-orange-500">
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </View>
      ) : (
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${circle}`}
        >
          <Text className={`font-poppins-semibold text-sm ${number}`}>
            {day}
          </Text>
        </View>
      )}
    </View>
  );
}

// Topo do Progresso, numa caixa pêssego: a chama, a sequência de agora, a
// maior que o aluno já fez, o mascote da chama e a semana de estudo
export function StreakCard({
  current,
  best,
  days,
  activity,
  today,
}: StreakCardProps) {
  const practicedDates = new Set(
    activity
      .filter((day) => day.lessons + day.activities + day.practices > 0)
      .map((day) => day.date)
  );

  return (
    <View className="gap-4 rounded-3xl bg-orange-50 p-4">
      <View
        accessible
        accessibilityLabel={`Sequência atual: ${formatStreak(current)}. Melhor sequência: ${formatStreak(best)}`}
        className="flex-row items-center gap-3"
      >
        <View className="h-14 w-14 items-center justify-center rounded-full bg-orange-100">
          <Ionicons name="flame" size={30} color={colors.orange} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="font-poppins-bold text-3xl leading-10 text-gray-900">
              {current}
            </Text>
            <Text className="font-poppins-semibold text-base text-gray-900">
              {current === 1 ? 'dia seguido' : 'dias seguidos'}
            </Text>
          </View>
          <Text className="font-poppins text-sm text-gray-500">
            Melhor sequência: {formatStreak(best)}
          </Text>
        </View>
        <Image
          source={streakMascot}
          className="h-16 w-16"
          resizeMode="contain"
        />
      </View>

      <View className="flex-row justify-between">
        {days.map((day) => (
          <DayMark
            key={day.date}
            date={day.date}
            studied={day.studied}
            practiced={practicedDates.has(day.date)}
            isToday={day.date === today}
            isFuture={day.date > today}
          />
        ))}
      </View>
    </View>
  );
}
