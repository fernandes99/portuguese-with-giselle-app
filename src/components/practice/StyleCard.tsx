import { Pressable, Text, View } from 'react-native';

import { RadioMark } from '@/components/preferences/ChoiceCard';
import type { ChatStyleOption } from '@/services/preferences';

// Opção de estilo da Gisa: emoji, título, descrição e como ela se apresenta
export function StyleCard({
  option,
  selected,
  onPress,
}: {
  option: ChatStyleOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${option.title}. ${option.description}`}
      onPress={onPress}
      className={`gap-3 rounded-2xl border p-4 ${
        selected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-2xl" importantForAccessibility="no">
          {option.emoji}
        </Text>
        <View className="flex-1 gap-0.5">
          <Text className="font-poppins-semibold text-base text-gray-900">
            {option.title}
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            {option.description}
          </Text>
        </View>
        <RadioMark selected={selected} />
      </View>
      <View
        className={`rounded-xl px-3 py-2 ${selected ? 'bg-white' : 'bg-gray-50'}`}
      >
        <Text className="font-poppins text-sm italic text-gray-700">
          “{option.example}”
        </Text>
      </View>
    </Pressable>
  );
}
