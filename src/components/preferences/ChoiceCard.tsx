import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

interface ChoiceCardProps {
  title: string;
  description?: string | null;
  icon?: ComponentProps<typeof Ionicons>['name'];
  // Emoji à esquerda (a bandeira do idioma), no lugar do ícone
  emoji?: string | null;
  selected: boolean;
  onPress: () => void;
}

// Círculo de marcado à direita das opções de resposta única
export function RadioMark({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
        selected ? 'border-green-600 bg-green-600' : 'border-gray-300'
      }`}
    >
      {selected ? (
        <Ionicons name="checkmark" size={14} color={colors.white} />
      ) : null}
    </View>
  );
}

// Opção de resposta única, com o círculo de marcado à direita
export function ChoiceCard({
  title,
  description,
  icon,
  emoji,
  selected,
  onPress,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
        selected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      {emoji ? (
        <Text className="text-2xl" importantForAccessibility="no">
          {emoji}
        </Text>
      ) : icon ? (
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${
            selected ? 'bg-green-600' : 'bg-green-100'
          }`}
        >
          <Ionicons
            name={icon}
            size={20}
            color={selected ? colors.white : colors.green}
          />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text className="font-poppins-semibold text-base text-gray-900">
          {title}
        </Text>
        {description ? (
          <Text className="font-poppins text-sm text-gray-600">
            {description}
          </Text>
        ) : null}
      </View>
      <RadioMark selected={selected} />
    </Pressable>
  );
}
