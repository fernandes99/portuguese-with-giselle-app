import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';
import type { Achievement } from '@/services/progress';
import { formatUnlockedDate } from '@/utils/progress';

// Detalhe de uma conquista, aberto ao tocar na medalha: a medalha grande, o
// nome, a descrição e a data em que saiu ou o andamento até ela
export function AchievementSheet({
  achievement,
  onClose,
}: {
  // null com a folha fechada
  achievement: Achievement | null;
  onClose: () => void;
}) {
  const bottomInset = useModalBottomInset();
  // A última aberta continua na folha enquanto ela desce ao fechar
  const shown = useRef<Achievement | null>(null);
  if (achievement) {
    shown.current = achievement;
  }

  return (
    <Modal
      visible={achievement !== null}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar a conquista"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="rounded-t-3xl bg-white px-5 pt-4"
          style={{ paddingBottom: bottomInset + 24 }}
        >
          <View className="items-end">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar a conquista"
              onPress={onClose}
              hitSlop={12}
              className="h-9 w-9 items-center justify-center rounded-full bg-surface active:bg-surface-pressed"
            >
              <Ionicons name="close" size={20} color={colors.gray} />
            </Pressable>
          </View>

          {shown.current ? (
            <AchievementDetail achievement={shown.current} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function AchievementDetail({ achievement }: { achievement: Achievement }) {
  const date = achievement.unlockedAt
    ? formatUnlockedDate(achievement.unlockedAt)
    : '';
  const percentage = achievement.target
    ? Math.round((achievement.current / achievement.target) * 100)
    : 0;

  return (
    <View className="items-center gap-4">
      <AchievementBadge achievement={achievement} size={140} />

      <View className="items-center gap-1">
        <Text
          accessibilityRole="header"
          className="text-center font-poppins-bold text-2xl text-gray-900"
        >
          {achievement.title}
        </Text>
        <Text className="text-center font-poppins text-base text-gray-600">
          {achievement.description}
        </Text>
      </View>

      {achievement.unlockedAt ? (
        <View className="flex-row items-center gap-2 rounded-full bg-green-100 px-4 py-2">
          <Ionicons name="checkmark-circle" size={18} color={colors.green} />
          <Text className="font-poppins-semibold text-sm text-green-800">
            {date ? `Conquistada em ${date}` : 'Conquistada'}
          </Text>
        </View>
      ) : (
        <View className="w-full gap-2 rounded-3xl bg-surface p-4">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text className="font-poppins-semibold text-sm text-gray-900">
              Ainda não desbloqueada
            </Text>
            <Text className="font-poppins-semibold text-sm text-gray-500">
              {achievement.current} de {achievement.target}
            </Text>
          </View>
          <ProgressBar percentage={percentage} onGray />
        </View>
      )}
    </View>
  );
}
