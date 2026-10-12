import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError, setUnauthorizedHandler } from '@/lib/api';
import { signOutFromGoogle } from '@/lib/google';
import { clearSession, loadSession, saveSession } from '@/lib/storage';
import { me, type Session, type User } from '@/services/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);

  // Qualquer chamada recusada por sessão inválida derruba o login, em
  // qualquer tela, e o app volta para a tela de entrada.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
      setStatus('unauthenticated');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    async function restore() {
      const stored = await loadSession();
      if (!stored) {
        setStatus('unauthenticated');
        return;
      }

      try {
        const fresh = await me(stored.token);
        await saveSession(fresh);
        setSession(fresh);
        setStatus('authenticated');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
          setStatus('unauthenticated');
          return;
        }

        // Sem rede ou servidor fora do ar: mantém a sessão guardada
        setSession(stored);
        setStatus('authenticated');
      }
    }

    restore();
  }, []);

  const signIn = useCallback(async (next: Session) => {
    await saveSession(next);
    setSession(next);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    await signOutFromGoogle();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({
      status,
      user: session?.user ?? null,
      token: session?.token ?? null,
      signIn,
      signOut,
    }),
    [status, session, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
