import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Achievement } from '@/services/progress';
import { formatUnlockedDate } from '@/utils/progress';

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const isUnlocked = achievement.unlockedAt !== null;
  const date = achievement.unlockedAt
    ? formatUnlockedDate(achievement.unlockedAt)
    : '';

  return (
    <View
      accessible
      accessibilityLabel={`${achievement.title}, ${isUnlocked ? 'desbloqueada' : 'não desbloqueada'}`}
      className="flex-row items-center gap-3 py-3"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full bg-white ${isUnlocked ? '' : 'opacity-60'}`}
      >
        <Ionicons
          name={isUnlocked ? 'trophy' : 'lock-closed'}
          size={18}
          color={isUnlocked ? colors.orange : colors.placeholder}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-poppins-semibold text-sm ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}
        >
          {achievement.title}
        </Text>
        <Text
          className={`font-poppins text-xs ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}
        >
          {achievement.description}
        </Text>
        {date ? (
          <Text className="mt-0.5 font-poppins text-xs text-green-700">
            Conquistada em {date}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// Última linha da lista resumida: o texto e a seta
function SeeAllRow({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver todas as conquistas"
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
    >
      <Text className="flex-1 font-poppins-semibold text-sm text-green-700">
        Ver todas as conquistas
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </Pressable>
  );
}

// Conquistas: as desbloqueadas em destaque, as outras apagadas. Com
// `onSeeAll`, a lista é um resumo e termina no link para a página inteira.
export function AchievementList({
  achievements,
  onSeeAll,
}: {
  achievements: Achievement[];
  onSeeAll?: () => void;
}) {
  return (
    <View className="rounded-3xl bg-surface px-4 py-1">
      {achievements.map((achievement) => (
        <AchievementRow key={achievement.code} achievement={achievement} />
      ))}
      {onSeeAll ? <SeeAllRow onPress={onSeeAll} /> : null}
    </View>
  );
}
