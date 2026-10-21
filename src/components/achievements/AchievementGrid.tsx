import { Pressable, Text, View } from 'react-native';

import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import type { Achievement } from '@/services/progress';

// Grade de 3 colunas da página de conquistas. Nas trancadas, embaixo do nome,
// o andamento numa barrinha com "2/7".
export function AchievementGrid({
  achievements,
  onSelect,
}: {
  achievements: Achievement[];
  onSelect: (achievement: Achievement) => void;
}) {
  return (
    <View className="-mx-1 flex-row flex-wrap">
      {achievements.map((achievement) => (
        <View key={achievement.code} className="w-1/3 p-1">
          <GridCell achievement={achievement} onPress={onSelect} />
        </View>
      ))}
    </View>
  );
}

function GridCell({
  achievement,
  onPress,
}: {
  achievement: Achievement;
  onPress: (achievement: Achievement) => void;
}) {
  const isUnlocked = achievement.unlockedAt !== null;
  const percentage = achievement.target
    ? Math.round((achievement.current / achievement.target) * 100)
    : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isUnlocked
          ? `${achievement.title}, desbloqueada`
          : `${achievement.title}, ${achievement.current} de ${achievement.target}`
      }
      onPress={() => onPress(achievement)}
      className="items-center gap-2 rounded-3xl py-2 active:bg-surface"
    >
      <AchievementBadge achievement={achievement} size={84} />
      <Text
        numberOfLines={2}
        className={`px-1 text-center font-poppins-semibold text-xs ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}
      >
        {achievement.title}
      </Text>
      {isUnlocked ? null : (
        <View className="w-16 flex-row items-center gap-1.5">
          <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-green-600"
              style={{ width: `${percentage}%` }}
            />
          </View>
          <Text className="font-poppins-medium text-[10px] text-gray-500">
            {achievement.current}/{achievement.target}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
