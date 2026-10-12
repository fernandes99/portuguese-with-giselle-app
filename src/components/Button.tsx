import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'link';
  // lg: botão principal das telas de entrada
  size?: 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  // Com ela, o botão desabilitado fica cinza e ainda responde ao toque, para
  // a tela explicar o que falta
  onDisabledPress?: () => void;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onDisabledPress,
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

  const isMuted = disabled && !loading && onDisabledPress !== undefined;
  const sizeClassName = size === 'lg' ? 'h-14 rounded-2xl' : 'h-12 rounded-lg';

  if (isMuted) {
    return (
      <Pressable
        accessibilityRole="button"
        // Sem accessibilityState.disabled: no Android ele desliga o toque
        // na área do botão, e só o texto continuaria respondendo
        accessibilityHint="Indisponível no momento"
        onPress={onDisabledPress}
        className={`flex-row items-center justify-center gap-2 bg-gray-200 ${sizeClassName}`}
      >
        <Text className="font-poppins-semibold text-base text-gray-600">
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 bg-green-600 ${sizeClassName} active:bg-green-700 ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading && <ActivityIndicator color={colors.white} />}
      <Text className="font-poppins-semibold text-base text-white">
        {label}
      </Text>
    </Pressable>
  );
}
