import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export interface VocabularyCategory {
  id: string;
  title: string;
  // Hexadecimal; null quando a categoria não tem cor no Dato
  color: string | null;
}

export interface VocabularyItem {
  id: string;
  term: string;
  meaning: string;
  pronunciation: string | null;
  // Exemplo, tradução e áudios vêm null nos itens exclusivos do Premium
  example: string | null;
  exampleTranslation: string | null;
  termAudioUrl: string | null;
  exampleAudioUrl: string | null;
  categoryIds: string[];
  isLocked: boolean;
  isSaved: boolean;
}

export interface VocabularyList {
  categories: VocabularyCategory[];
  items: VocabularyItem[];
}

export function getVocabulary(token: string) {
  return api<VocabularyList>(API_ROUTES.vocabulary, { token });
}

// saved: true salva o item; false tira dos salvos
export function setVocabularySaved(token: string, id: string, saved: boolean) {
  return api<{ saved: boolean }>(API_ROUTES.vocabularySave(id), {
    method: saved ? 'PUT' : 'DELETE',
    token,
  });
}
