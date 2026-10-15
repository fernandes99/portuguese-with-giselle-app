import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

interface InterestChipProps {
  title: string;
  emoji?: string | null;
  selected: boolean;
  onPress: () => void;
}

// Tema de conversa; vários ficam lado a lado e quebram linha. O emoji fica
// sempre; o check, só quando o tema selecionado não tem emoji.
export function InterestChip({
  title,
  emoji,
  selected,
  onPress,
}: InterestChipProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full border px-4 py-2.5 ${
        selected
          ? 'border-green-600 bg-green-50'
          : 'border-gray-200 bg-white active:bg-gray-50'
      }`}
    >
      {emoji ? (
        <Text className="text-base" importantForAccessibility="no">
          {emoji}
        </Text>
      ) : selected ? (
        <Ionicons name="checkmark" size={16} color={colors.darkGreen} />
      ) : null}
      <Text
        className={`font-poppins-medium text-sm ${
          selected ? 'text-green-700' : 'text-gray-700'
        }`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
