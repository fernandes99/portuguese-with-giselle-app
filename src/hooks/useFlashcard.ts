import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import { type Flashcard, getFlashcard } from '@/services/flashcards';

// Carrega um conjunto de flashcards uma vez por abertura da tela. Não
// recarrega no foco: a sessão de estudo guarda o próprio andamento.
export function useFlashcard(slug: string) {
  const { token, signOut } = useAuth();

  const [data, setData] = useState<Flashcard | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    setError('');
    try {
      setData(await getFlashcard(token, slug));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setError(
        getErrorMessage(err, 'Erro ao carregar o flashcard. Tente novamente.')
      );
    }
  }, [token, slug, signOut]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, reload: load };
}
