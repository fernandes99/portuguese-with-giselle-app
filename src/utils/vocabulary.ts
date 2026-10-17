import type { VocabularyItem } from '@/services/vocabulary';

export const VOCABULARY_FILTER_ALL = 'all';

// VOCABULARY_FILTER_ALL ou o id de uma categoria
export type VocabularyFilter = string;

// Minúsculas e sem acento, para "irmao" encontrar "irmão"
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Itens que atendem à busca (palavra, significado ou exemplo), à categoria e,
// com onlySaved, aos salvos. Os três filtros valem juntos.
export function filterVocabulary(
  items: VocabularyItem[],
  query: string,
  filter: VocabularyFilter,
  onlySaved: boolean,
  savedIds: Set<string>
) {
  const normalizedQuery = normalize(query.trim());

  return items.filter((item) => {
    if (onlySaved && !savedIds.has(item.id)) {
      return false;
    }
    if (
      filter !== VOCABULARY_FILTER_ALL &&
      !item.categoryIds.includes(filter)
    ) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return [item.term, item.meaning, item.example ?? ''].some((text) =>
      normalize(text).includes(normalizedQuery)
    );
  });
}
