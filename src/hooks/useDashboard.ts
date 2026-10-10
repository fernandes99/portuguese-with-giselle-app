import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import { type Dashboard, getDashboard } from '@/services/dashboard';

export function useDashboard() {
  const { token, signOut } = useAuth();

  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setData(await getDashboard(token));
      setError('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setError(getErrorMessage(err, 'Erro ao carregar o dashboard.'));
    }
  }, [token, signOut]);

  // Recarrega sempre que a aba volta ao foco, para refletir aulas concluídas
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { data, error, refreshing, refresh };
}
