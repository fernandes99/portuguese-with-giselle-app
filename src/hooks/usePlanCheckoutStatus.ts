import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';
import { getPlanCheckoutStatus, type PlanTier } from '@/services/plans';

const INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10;

// checking: consultando; paid: confirmada; unconfirmed: as tentativas
// acabaram sem confirmação; failed: a sessão expirou ou não existe
export type PlanCheckoutState = 'checking' | 'paid' | 'unconfirmed' | 'failed';

// Confere uma assinatura até ela constar como paga. A confirmação do Stripe
// pode atrasar, então a consulta se repete por alguns segundos. Para quando
// a tela sai de foco.
export function usePlanCheckoutStatus(sessionId: string) {
  const { token, signOut } = useAuth();

  const [state, setState] = useState<PlanCheckoutState>('checking');
  // Nível da conta depois da compra confirmada
  const [tier, setTier] = useState<PlanTier | null>(null);
  // Muda a cada "Conferir de novo", para recomeçar as tentativas
  const [round, setRound] = useState(0);

  useFocusEffect(
    // biome-ignore lint/correctness/useExhaustiveDependencies: round muda a cada "Conferir de novo", para as tentativas recomeçarem
    useCallback(() => {
      if (!token || !sessionId) {
        return;
      }

      let active = true;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let attempts = 0;

      const check = async () => {
        attempts += 1;

        try {
          const result = await getPlanCheckoutStatus(token, sessionId);
          if (!active) {
            return;
          }

          if (result.status === 'paid') {
            setTier(result.tier);
            setState('paid');
            return;
          }
          if (result.status === 'expired') {
            setState('failed');
            return;
          }
        } catch (err) {
          if (!active) {
            return;
          }
          if (err instanceof ApiError && err.status === 401) {
            await signOut();
            return;
          }
          if (err instanceof ApiError && err.status === 404) {
            setState('failed');
            return;
          }
          // Falha de rede ou do servidor: tenta de novo até o limite
        }

        if (attempts >= MAX_ATTEMPTS) {
          setState('unconfirmed');
          return;
        }
        timer = setTimeout(check, INTERVAL_MS);
      };

      setState((current) => (current === 'paid' ? current : 'checking'));
      check();

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [token, sessionId, signOut, round])
  );

  const retry = useCallback(() => setRound((value) => value + 1), []);

  return { state, tier, retry };
}
