import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <View className="items-center rounded-lg border border-gray-100 bg-gray-50 p-6">
      <Ionicons
        name="document-text-outline"
        size={32}
        color={colors.placeholder}
      />
      <Text className="mt-2 text-center font-poppins-medium text-base text-gray-600">
        {title}
      </Text>
      {text ? (
        <Text className="mt-1 text-center font-poppins text-sm text-gray-500">
          {text}
        </Text>
      ) : null}
    </View>
  );
}
