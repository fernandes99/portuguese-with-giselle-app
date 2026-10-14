import { Pressable, Text, View } from 'react-native';

import type { NotificationItem } from '@/services/notifications';
import { formatTimeAgo } from '@/utils/date';

interface NotificationRowProps {
  notification: NotificationItem;
  onPress: () => void;
}

// Um item da lista de notificações. A não lida tem fundo verde-claro, um
// ponto verde e o título em negrito.
export function NotificationRow({
  notification,
  onPress,
}: NotificationRowProps) {
  const isUnread = notification.readAt === null;
  const time = formatTimeAgo(notification.receivedAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? 'Não lida. ' : ''}${notification.title}. ${notification.body}. ${time}`}
      accessibilityHint="Abre a notificação"
      onPress={onPress}
      className={`flex-row gap-3 border-b border-gray-100 px-5 py-4 ${isUnread ? 'bg-green-50 active:bg-green-100' : 'bg-white active:bg-gray-50'}`}
    >
      <View className="w-2 pt-2">
        {isUnread ? (
          <View className="h-2 w-2 rounded-full bg-green-600" />
        ) : null}
      </View>

      <View className="flex-1 gap-1">
        <Text
          numberOfLines={2}
          className={`text-base text-gray-900 ${isUnread ? 'font-poppins-bold' : 'font-poppins-medium'}`}
        >
          {notification.title}
        </Text>
        <Text
          numberOfLines={2}
          className="font-poppins text-sm leading-5 text-gray-600"
        >
          {notification.body}
        </Text>
        <Text className="font-poppins text-xs text-gray-500">{time}</Text>
      </View>
    </Pressable>
  );
}
