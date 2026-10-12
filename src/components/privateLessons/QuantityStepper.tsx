import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { formatLessons } from '@/utils/privateLessons';

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      className={`h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white active:bg-gray-50 ${disabled ? 'opacity-40' : ''}`}
    >
      <Ionicons name={icon} size={22} color={colors.green} />
    </Pressable>
  );
}

// Quantidade de aulas da compra, entre 1 e `max`
export function QuantityStepper({
  quantity,
  max,
  onChange,
}: {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-center gap-6">
      <StepButton
        icon="remove"
        label="Diminuir quantidade"
        disabled={quantity <= 1}
        onPress={() => onChange(quantity - 1)}
      />
      <Text
        accessibilityLiveRegion="polite"
        accessibilityLabel={formatLessons(quantity)}
        className="min-w-16 text-center font-poppins-bold text-5xl text-gray-900"
      >
        {quantity}
      </Text>
      <StepButton
        icon="add"
        label="Aumentar quantidade"
        disabled={quantity >= max}
        onPress={() => onChange(quantity + 1)}
      />
    </View>
  );
}
