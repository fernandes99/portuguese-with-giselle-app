import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'link';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === 'link') {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={isDisabled}
        className={`items-center py-2 ${isDisabled ? 'opacity-50' : ''}`}
      >
        <Text className="font-poppins text-sm text-gray-600">{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-lg bg-green-600 active:bg-green-700 ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading && <ActivityIndicator color={colors.white} />}
      <Text className="font-poppins-semibold text-base text-white">
        {label}
      </Text>
    </Pressable>
  );
}
