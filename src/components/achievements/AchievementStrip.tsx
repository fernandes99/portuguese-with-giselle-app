import { Pressable, ScrollView, Text } from 'react-native';

import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import type { Achievement } from '@/services/progress';

// Faixa de medalhas do Progresso, que rola para o lado. Encosta nas bordas da
// tela: a margem negativa desfaz o espaçamento da página.
export function AchievementStrip({
  achievements,
  onSelect,
}: {
  achievements: Achievement[];
  onSelect: (achievement: Achievement) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-5"
      contentContainerClassName="gap-2 px-5"
    >
      {achievements.map((achievement) => (
        <Pressable
          key={achievement.code}
          accessibilityRole="button"
          accessibilityLabel={`${achievement.title}, ${achievement.unlockedAt ? 'desbloqueada' : 'não desbloqueada'}`}
          onPress={() => onSelect(achievement)}
          className="w-24 items-center gap-2 active:opacity-70"
        >
          <AchievementBadge achievement={achievement} size={76} />
          <Text
            numberOfLines={2}
            className={`text-center font-poppins-semibold text-xs ${achievement.unlockedAt ? 'text-gray-900' : 'text-gray-500'}`}
          >
            {achievement.title}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
