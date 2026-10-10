import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  value: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBgClassName: string;
}

export function StatCard({
  value,
  label,
  icon,
  iconColor,
  iconBgClassName,
}: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl border border-gray-100 bg-white p-4">
      <View
        className={`mb-3 h-10 w-10 items-center justify-center rounded-lg ${iconBgClassName}`}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="font-poppins-bold text-2xl text-gray-900">{value}</Text>
      <Text className="mt-1 font-poppins text-sm text-gray-500">{label}</Text>
    </View>
  );
}
