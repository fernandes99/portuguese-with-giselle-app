import { Text, View } from 'react-native';

// Data que abre cada dia da conversa
export function DaySeparator({ label }: { label: string }) {
  return (
    <View className="items-center py-1">
      <Text className="rounded-full bg-gray-200 px-3 py-1 font-poppins-medium text-[11px] text-gray-600">
        {label}
      </Text>
    </View>
  );
}
