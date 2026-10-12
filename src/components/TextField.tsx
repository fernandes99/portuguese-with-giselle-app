import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

// Campo com ícone opcional. Em campos de senha, mostra o botão "Mostrar".
export function TextField({
  label,
  icon,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View className="gap-2">
      <Text className="font-poppins-semibold text-sm text-gray-900">
        {label}
      </Text>
      <View
        className={`h-14 flex-row items-center gap-3 rounded-2xl border bg-white px-4 ${focused ? 'border-green-500' : 'border-gray-200'}`}
      >
        {icon && <Ionicons name={icon} size={20} color={colors.gray} />}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !visible}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          // Sem line-height e sem padding próprio: com a Poppins eles empurram
          // o texto digitado para fora do centro do campo
          textAlignVertical="center"
          style={{ includeFontPadding: false }}
          className="h-full flex-1 py-0 font-poppins text-[16px] text-gray-900"
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible((value) => !value)}
            hitSlop={12}
          >
            <Text className="font-poppins-semibold text-xs text-gray-700">
              {visible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
