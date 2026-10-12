import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import {
  getHistory,
  type HistoryEntity,
  type HistoryEntry,
} from '@/services/history';

// Histórico de estudo do aluno, em páginas. Trocar o filtro recomeça a lista.
export function useHistory(type: HistoryEntity | null) {
  const { token } = useAuth();

  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Muda a cada troca de filtro: a resposta de um filtro antigo é descartada
  const request = useRef(0);

  const load = useCallback(
    async (nextPage: number) => {
      if (!token) {
        return;
      }

      const current = request.current;
      setError('');
      try {
        const history = await getHistory(token, type, nextPage);
        if (request.current !== current) {
          return;
        }

        setEntries((previous) =>
          nextPage === 1
            ? history.entries
            : [
                ...(previous ?? []),
                // Um registro novo pode empurrar um já carregado para a página seguinte
                ...history.entries.filter(
                  (entry) => !previous?.some((item) => item.id === entry.id)
                ),
              ]
        );
        setTotal(history.total);
        setPage(nextPage);
      } catch (err) {
        if (request.current === current) {
          setError(getErrorMessage(err, 'Erro ao carregar o histórico.'));
        }
      }
    },
    [token, type]
  );

  useEffect(() => {
    request.current += 1;
    setEntries(null);
    setTotal(0);
    setPage(0);
    load(1);
  }, [load]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    await load(page + 1);
    setIsLoadingMore(false);
  }, [load, page]);

  return {
    entries,
    total,
    error,
    hasMore: entries !== null && entries.length < total,
    isLoadingMore,
    loadMore,
    reload: () => load(1),
  };
}
