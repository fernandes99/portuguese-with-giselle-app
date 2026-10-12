import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Novas tentativas depois de o navegador fechar
const RETRY_DELAYS_MS = [3000, 8000];

// Recarrega a tela depois que o aluno volta de uma página do Calendly. O
// aviso do Calendly ao backend pode atrasar, então recarrega na hora e mais
// duas vezes. No Android o navegador pode "fechar" para o app antes de o
// aluno terminar; por isso recarrega também quando o app volta à frente.
export function useRefreshAfterBrowser(refresh: () => void) {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = useCallback(() => {
    for (const timer of timers.current) {
      clearTimeout(timer);
    }
    timers.current = [];
  }, []);

  const refreshSoon = useCallback(() => {
    clear();
    refresh();
    timers.current = RETRY_DELAYS_MS.map((delay) => setTimeout(refresh, delay));
  }, [clear, refresh]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshSoon();
      }
    });

    return () => {
      subscription.remove();
      clear();
    };
  }, [refreshSoon, clear]);

  return refreshSoon;
}
