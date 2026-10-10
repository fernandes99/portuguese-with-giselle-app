import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function DurationBadge({ minutes }: { minutes: number }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start rounded-full bg-gray-100 px-3 py-1">
      <Ionicons name="time-outline" size={14} color={colors.gray} />
      <Text className="font-poppins-medium text-xs text-gray-600">
        {minutes} min
      </Text>
    </View>
  );
}
