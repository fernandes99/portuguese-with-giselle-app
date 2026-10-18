import { File } from 'expo-file-system';

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

// Resultado da prática de pronúncia (contrato no README de .specs/vocabulary/)
export type PronunciationResult = 'correct' | 'incorrect' | 'not_understood';

export interface PronunciationWord {
  // Como está no termo, sem a pontuação
  expected: string;
  // A palavra que saiu no lugar; null quando faltou
  heard: string | null;
  status: 'ok' | 'wrong' | 'missing';
}

export interface PronunciationEvaluation {
  result: PronunciationResult;
  // O que a transcrição ouviu, como veio
  heard: string;
  words: PronunciationWord[];
  remainingToday: number;
}

// Manda a gravação (m4a do expo-audio) para avaliar a pronúncia do termo.
// O fetch do Expo não aceita o formato { uri, name, type } do React Native no
// FormData; o File do expo-file-system funciona como um Blob.
export function evaluatePronunciation(token: string, id: string, uri: string) {
  const formData = new FormData();
  formData.append('audio', new File(uri), 'attempt.m4a');

  return api<PronunciationEvaluation>(API_ROUTES.vocabularyPronunciation(id), {
    method: 'POST',
    formData,
    token,
  });
}
