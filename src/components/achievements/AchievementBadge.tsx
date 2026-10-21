import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';

import { ACHIEVEMENT_IMAGES } from '@/constants/achievements';
import { colors } from '@/constants/theme';
import type { Achievement } from '@/services/progress';

// Medalha de uma conquista: colorida quando desbloqueada, cinza e com um
// cadeado no canto quando não. Sem medalha cadastrada, um troféu num círculo.
export function AchievementBadge({
  achievement,
  size,
}: {
  achievement: Achievement;
  size: number;
}) {
  const isUnlocked = achievement.unlockedAt !== null;
  const images = ACHIEVEMENT_IMAGES[achievement.code];
  const lockSize = Math.round(size * 0.3);

  return (
    <View style={{ width: size, height: size }}>
      {images ? (
        <Image
          source={isUnlocked ? images.image : images.locked}
          resizeMode="contain"
          style={{ width: size, height: size }}
        />
      ) : (
        <View
          className={`flex-1 items-center justify-center rounded-full ${isUnlocked ? 'bg-orange-100' : 'bg-surface'}`}
        >
          <Ionicons
            name="trophy"
            size={Math.round(size * 0.45)}
            color={isUnlocked ? colors.orange : colors.placeholder}
          />
        </View>
      )}

      {isUnlocked ? null : (
        <View
          className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-white bg-gray-500"
          style={{ width: lockSize, height: lockSize }}
        >
          <Ionicons
            name="lock-closed"
            size={Math.round(lockSize * 0.5)}
            color={colors.white}
          />
        </View>
      )}
    </View>
  );
}
