import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useNotificationsUnread } from '@/contexts/NotificationsContext';
import { getBellLabel } from '@/utils/notifications';
import { formatUnread } from '@/utils/teacherChat';

// Sino do canto superior direito das abas, com o número de não lidas. Abre
// a tela de notificações.
export function NotificationBell() {
  const router = useRouter();
  const { unread, refreshUnread } = useNotificationsUnread();

  // A aba que mostra o sino ganhou foco
  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={getBellLabel(unread)}
      onPress={() => router.push('/notifications')}
      hitSlop={4}
      className="h-11 w-11 items-center justify-center rounded-full active:bg-gray-100"
    >
      <Ionicons name="notifications-outline" size={26} color={colors.gray} />
      {unread > 0 ? (
        <View
          // O número já está no rótulo do botão
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          className="absolute right-0.5 top-0.5 h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-red-500 px-1"
        >
          <Text
            style={{ includeFontPadding: false }}
            className="font-poppins-bold text-[10px] text-white"
          >
            {formatUnread(unread)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
