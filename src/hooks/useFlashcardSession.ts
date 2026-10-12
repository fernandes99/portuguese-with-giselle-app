import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  type CardStatus,
  type Flashcard,
  type FlashcardCard,
  saveCardProgress,
} from '@/services/flashcards';
import { countByStatus, getCardsToStudy } from '@/utils/flashcards';

interface Round {
  // Muda a cada rodada, para os cards da rodada nova não reaproveitarem
  // o estado dos da anterior
  number: number;
  cards: FlashcardCard[];
}

// Sessão de estudo de um conjunto. Uma rodada passa uma vez por cada card;
// a primeira traz os que o aluno ainda não aprendeu, como no site.
export function useFlashcardSession(flashcard: Flashcard) {
  const { token } = useAuth();

  const [statuses, setStatuses] = useState<Record<string, CardStatus>>(() =>
    Object.fromEntries(flashcard.cards.map((card) => [card.id, card.status]))
  );
  const [round, setRound] = useState<Round>(() => ({
    number: 1,
    cards: flashcard.cards.filter((card) => card.status !== 'learned'),
  }));
  const [position, setPosition] = useState(0);
  // Alguma resposta não chegou ao backend
  const [hasSaveError, setHasSaveError] = useState(false);
  // A posição já respondida, para um toque repetido não pular um card
  const answered = useRef(0);

  // `index` é a posição do card respondido na rodada
  const answer = useCallback(
    (index: number, learned: boolean) => {
      if (index !== answered.current) {
        return;
      }

      const card = round.cards[index];
      if (!card) {
        return;
      }

      answered.current = index + 1;
      setPosition(index + 1);
      setStatuses((current) => ({
        ...current,
        [card.id]: learned ? 'learned' : 'learning',
      }));

      if (!token) {
        return;
      }

      // O aluno não espera o backend: a falha só vira um aviso na tela
      saveCardProgress(token, flashcard.slug, card.id, learned).catch((err) => {
        console.error('Flashcard progress error:', err);
        setHasSaveError(true);
      });
    },
    [round, token, flashcard.slug]
  );

  function startRound(cards: FlashcardCard[]) {
    answered.current = 0;
    setPosition(0);
    setRound((current) => ({ number: current.number + 1, cards }));
  }

  const remaining = getCardsToStudy(flashcard.cards, statuses);

  return {
    round,
    position,
    isFinished: position >= round.cards.length,
    learnedCount: countByStatus(flashcard.cards, statuses, 'learned'),
    learningCount: countByStatus(flashcard.cards, statuses, 'learning'),
    // Cards que o aluno ainda não aprendeu, em todo o conjunto
    remainingCount: remaining.length,
    hasSaveError,
    answer,
    studyRemaining: () => startRound(remaining),
    studyAll: () => startRound(flashcard.cards),
  };
}
