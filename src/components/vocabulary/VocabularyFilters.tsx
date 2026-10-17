import { Pressable, ScrollView, Text } from 'react-native';

import type { VocabularyFilter } from '@/utils/vocabulary';

interface VocabularyFiltersProps {
  options: { id: VocabularyFilter; title: string }[];
  active: VocabularyFilter;
  onChange: (filter: VocabularyFilter) => void;
}

// Linha de filtros que rola para o lado: "Todas", "Salvos" e as categorias
export function VocabularyFilters({
  options,
  active,
  onChange,
}: VocabularyFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-2 px-5"
    >
      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.id)}
            className={`rounded-full border px-4 py-2 ${
              isActive
                ? 'border-green-600 bg-green-600'
                : 'border-gray-200 bg-white active:bg-gray-50'
            }`}
          >
            <Text
              className={`font-poppins-semibold text-sm ${
                isActive ? 'text-white' : 'text-gray-700'
              }`}
            >
              {option.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
