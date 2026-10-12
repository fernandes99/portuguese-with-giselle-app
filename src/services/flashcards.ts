import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// new: ainda sem resposta; learning: "ainda aprendendo"; learned: "aprendi"
export type CardStatus = 'new' | 'learning' | 'learned';

// Um lado do card. Com imagem, ela aparece no lugar do texto.
export interface CardSide {
  text: string;
  imageUrl: string | null;
}

export interface FlashcardCard {
  id: string;
  front: CardSide;
  back: CardSide;
  status: CardStatus;
}

// Um conjunto de cards, sem os cards
export interface FlashcardSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  totalCards: number;
  learnedCards: number;
  learningCards: number;
}

export interface Flashcard extends FlashcardSummary {
  // Lado que aparece primeiro: frente (true) ou verso (false)
  isShowFront: boolean;
  cards: FlashcardCard[];
}

export async function getFlashcards(token: string) {
  const { flashcards } = await api<{ flashcards: FlashcardSummary[] }>(
    API_ROUTES.flashcards,
    { token }
  );
  return flashcards;
}

export function getFlashcard(token: string, slug: string) {
  return api<Flashcard>(API_ROUTES.flashcard(slug), { token });
}

// learned: true para "aprendi", false para "ainda aprendendo"
export function saveCardProgress(
  token: string,
  slug: string,
  cardId: string,
  learned: boolean
) {
  return api<{ status: CardStatus }>(
    API_ROUTES.flashcardCardProgress(slug, cardId),
    { method: 'POST', body: { learned }, token }
  );
}
