import { Text } from 'react-native';

import { colors } from '@/constants/theme';
import type { VocabularyCategory } from '@/services/vocabulary';

// Primeira categoria do item, em letra pequena e maiúscula, na cor do Dato
export function CategoryLabel({
  category,
}: {
  category: VocabularyCategory | undefined;
}) {
  if (!category) {
    return null;
  }

  return (
    <Text
      style={{ color: category.color ?? colors.green }}
      className="font-poppins-bold text-[11px] uppercase tracking-widest"
    >
      {category.title}
    </Text>
  );
}
