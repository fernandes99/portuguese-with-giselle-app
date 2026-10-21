import { Pressable, ScrollView, Text } from 'react-native';

import type { SimulationCategory } from '@/services/simulations';

// Pílulas do filtro da lista: "Todas" e uma por categoria. Rola de lado,
// encostando nas bordas da tela.
export function SimulationFilters({
  categories,
  selectedId,
  onSelect,
}: {
  categories: SimulationCategory[];
  // null é "Todas"
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const options = [
    { id: null, title: 'Todas' },
    ...categories.map(({ id, title }) => ({ id, title })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // O ScrollView cresce por padrão: numa lista curta, a faixa esticava até
      // o fim da tela, com as pílulas junto
      className="-mx-5 grow-0"
      contentContainerClassName="items-start gap-2 px-5"
    >
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id ?? 'all'}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            className={
              selected
                ? 'rounded-full border border-green-600 bg-green-600 px-4 py-2'
                : 'rounded-full border border-gray-200 bg-white px-4 py-2 active:bg-gray-50'
            }
          >
            <Text
              className={
                selected
                  ? 'font-poppins-semibold text-xs text-white'
                  : 'font-poppins-semibold text-xs text-gray-700'
              }
            >
              {option.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
