import { useCallback } from 'react';

import { useApiQuery } from '@/hooks/useApiQuery';
import { getRanking, type RankingPeriod } from '@/services/ranking';

// Ranking do período escolhido. Ao trocar o período, `ranking` fica nulo até
// a lista nova chegar, para a tela não mostrar a do outro período.
export function useRanking(period: RankingPeriod) {
  const fetcher = useCallback(
    (token: string) => getRanking(token, period),
    [period]
  );
  const { data, error, refreshing, refresh } = useApiQuery(
    fetcher,
    'Erro ao carregar o ranking.'
  );

  return {
    ranking: data?.period === period ? data : null,
    error,
    refreshing,
    refresh,
  };
}
