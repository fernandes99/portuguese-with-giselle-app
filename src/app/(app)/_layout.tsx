import { Stack } from 'expo-router';
import { View } from 'react-native';

import { AchievementToast } from '@/components/AchievementToast';
import { colors } from '@/constants/theme';

export default function AppLayout() {
  return (
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
  );
}
