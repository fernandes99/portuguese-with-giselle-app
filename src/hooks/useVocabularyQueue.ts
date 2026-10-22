import { useCallback, useState } from 'react';

import type { VocabularyQuestion } from '@/services/lesson';
import {
  createQueue,
  shuffleOptions,
  type VocabularyQueue,
} from '@/utils/vocabularyActivity';

// Guarda a fila da atividade de vocabulário. As regras ficam em
// utils/vocabularyActivity; aqui só o estado e a vez (turn), que muda a cada
// pergunta mostrada, para a mesma pergunta que volta começar do zero.
export function useVocabularyQueue(questions: VocabularyQuestion[]) {
  const [queue, setQueue] = useState<VocabularyQueue>(() =>
    createQueue(questions)
  );
  const [turn, setTurn] = useState(0);

  const apply = useCallback(
    (update: (current: VocabularyQueue) => VocabularyQueue) => {
      setQueue(update);
      setTurn((current) => current + 1);
    },
    []
  );

  const restart = useCallback(() => {
    setQueue(
      createQueue(questions.map((question) => shuffleOptions(question)))
    );
    setTurn((current) => current + 1);
  }, [questions]);

  return {
    queue,
    current: queue.pending[0] as VocabularyQuestion | undefined,
    turn,
    apply,
    restart,
  };
}
