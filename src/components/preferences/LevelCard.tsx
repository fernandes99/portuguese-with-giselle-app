import { Pressable, Text, View } from 'react-native';

import { RadioMark } from '@/components/preferences/ChoiceCard';

interface LevelCardProps {
  // Código do nível (A0 a C2), mostrado no selo
  code: string;
  description: string | null;
  selected: boolean;
  onPress: () => void;
}

// Nível de português: o selo com o código e a frase que o descreve
export function LevelCard({
  code,
  description,
  selected,
  onPress,
}: LevelCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={description ? `${code}. ${description}` : code}
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-4 ${
        selected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-xl ${
          selected ? 'bg-green-600' : 'bg-green-100'
        }`}
      >
        <Text
          className={`font-poppins-semibold text-base ${
            selected ? 'text-white' : 'text-green-700'
          }`}
        >
          {code}
        </Text>
      </View>
      <Text className="flex-1 font-poppins-medium text-[15px] leading-6 text-gray-900">
        {description}
      </Text>
      <RadioMark selected={selected} />
    </Pressable>
  );
}
