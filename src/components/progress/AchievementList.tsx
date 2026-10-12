import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

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
        className={`h-10 w-10 items-center justify-center rounded-full ${isUnlocked ? 'bg-orange-100' : 'bg-gray-100'}`}
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

// Todas as conquistas: as desbloqueadas em destaque, as outras apagadas
export function AchievementList({
  achievements,
}: {
  achievements: Achievement[];
}) {
  return (
    <View className="rounded-xl border border-gray-100 bg-white px-4">
      {achievements.map((achievement, index) => (
        <View
          key={achievement.code}
          className={index > 0 ? 'border-t border-gray-100' : ''}
        >
          <AchievementRow achievement={achievement} />
        </View>
      ))}
    </View>
  );
}
