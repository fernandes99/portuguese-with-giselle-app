import type {
  CardSide,
  CardStatus,
  FlashcardCard,
  FlashcardSummary,
} from '@/services/flashcards';

export function formatCards(count: number) {
  return `${count} ${count === 1 ? 'card' : 'cards'}`;
}

// Quanto do conjunto o aluno já marcou como aprendido
export function getFlashcardProgress(flashcard: FlashcardSummary) {
  const percentage =
    flashcard.totalCards > 0
      ? Math.round((flashcard.learnedCards / flashcard.totalCards) * 100)
      : 0;

  return {
    percentage,
    isStarted: flashcard.learnedCards + flashcard.learningCards > 0,
    isCompleted:
      flashcard.totalCards > 0 &&
      flashcard.learnedCards === flashcard.totalCards,
  };
}

// Cards que entram numa rodada de estudo: os que o aluno ainda não aprendeu
export function getCardsToStudy(
  cards: FlashcardCard[],
  statuses: Record<string, CardStatus>
) {
  return cards.filter((card) => statuses[card.id] !== 'learned');
}

export function countByStatus(
  cards: FlashcardCard[],
  statuses: Record<string, CardStatus>,
  status: CardStatus
) {
  return cards.filter((card) => statuses[card.id] === status).length;
}

// Tamanho da letra do card: textos longos diminuem para caber
export function getCardFontSize(text: string) {
  if (text.length <= 24) {
    return 32;
  }
  if (text.length <= 80) {
    return 24;
  }
  return 18;
}

// O que o leitor de tela fala sobre o lado visível do card
export function getSideLabel(side: CardSide) {
  return side.text || 'Imagem';
}
