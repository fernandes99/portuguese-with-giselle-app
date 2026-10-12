import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';

// Carrega um recurso autenticado e o recarrega sempre que a tela volta ao
// foco. `fetcher` precisa ter identidade estável (função de módulo ou
// useCallback), senão a tela recarrega a cada render.
export function useApiQuery<T>(
  fetcher: (token: string) => Promise<T>,
  fallbackError: string
) {
  const { token, signOut } = useAuth();

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setData(await fetcher(token));
      setError('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setError(getErrorMessage(err, fallbackError));
    }
  }, [token, signOut, fetcher, fallbackError]);

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

  // reload: recarrega sem o indicador de puxar para atualizar
  return { data, error, refreshing, refresh, reload: load };
}
