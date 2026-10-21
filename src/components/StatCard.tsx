import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';

// Cada número tem a sua cor: o fundo num tom claro e o ícone no tom forte
const TONES = {
  blue: { className: 'bg-blue-100', icon: colors.blue },
  green: { className: 'bg-green-100', icon: colors.green },
  purple: { className: 'bg-purple-100', icon: colors.purple },
  orange: { className: 'bg-orange-100', icon: colors.orange },
} as const;

interface StatCardProps {
  value: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tone: keyof typeof TONES;
}

// Número do aluno num cartão colorido, com o ícone sólido num círculo branco
export function StatCard({ value, label, icon, tone }: StatCardProps) {
  const { className, icon: iconColor } = TONES[tone];

  return (
    <View className={`flex-1 rounded-3xl p-4 ${className}`}>
      <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="font-poppins-bold text-2xl text-gray-900">{value}</Text>
      <Text className="mt-1 font-poppins text-sm text-gray-600">{label}</Text>
    </View>
  );
}
