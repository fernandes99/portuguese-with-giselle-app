import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { CategoryLabel } from '@/components/vocabulary/CategoryLabel';
import { colors } from '@/constants/theme';
import type { VocabularyCategory, VocabularyItem } from '@/services/vocabulary';

interface VocabularyRowProps {
  item: VocabularyItem;
  category: VocabularyCategory | undefined;
  isSaved: boolean;
  // Item liberado abre o detalhe; exclusivo leva aos planos (quem chama decide)
  onPress: () => void;
  onToggleSaved: () => void;
}

// Um item da lista. O exclusivo do Premium aparece esmaecido, com a etiqueta
// no lugar do marcador de salvo.
export function VocabularyRow({
  item,
  category,
  isSaved,
  onPress,
  onToggleSaved,
}: VocabularyRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        item.isLocked ? `${item.term}, exclusivo do plano Premium` : item.term
      }
      accessibilityHint={
        item.isLocked ? 'Abre a tela do plano Premium' : 'Abre os detalhes'
      }
      onPress={onPress}
      className="flex-row items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View className={`flex-1 gap-1 ${item.isLocked ? 'opacity-50' : ''}`}>
        <CategoryLabel category={category} />
        <Text className="font-poppins-bold text-lg text-gray-900">
          {item.term}
        </Text>
        <Text numberOfLines={2} className="font-poppins text-sm text-gray-600">
          {item.meaning}
        </Text>
      </View>

      {item.isLocked ? (
        <PremiumBadge />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Tirar dos salvos' : 'Salvar'}
          onPress={onToggleSaved}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.green : colors.gray}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
