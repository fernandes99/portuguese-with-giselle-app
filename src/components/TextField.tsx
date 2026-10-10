import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-poppins-medium text-sm text-gray-700">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.placeholder}
        className="h-12 rounded-lg border border-gray-200 bg-white px-4 font-poppins text-base text-gray-900 focus:border-green-500"
        {...props}
      />
    </View>
  );
}
