import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AchievementToast } from '@/components/AchievementToast';
import { colors } from '@/constants/theme';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { TeacherChatUnreadProvider } from '@/contexts/TeacherChatUnreadContext';

export default function AppLayout() {
  return (
    <TeacherChatUnreadProvider>
      <NotificationsProvider>
        <View className="flex-1">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
          {/* Por cima de qualquer tela da área logada */}
          <AchievementToast />
        </View>
      </NotificationsProvider>
    </TeacherChatUnreadProvider>
  );
}
