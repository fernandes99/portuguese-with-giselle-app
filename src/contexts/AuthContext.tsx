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
import {
  clearPushToken,
  clearSession,
  loadPushToken,
  loadSession,
  saveSession,
} from '@/lib/storage';
import { me, type Session, type User } from '@/services/auth';
import { deletePushToken } from '@/services/notifications';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  // Relê a conta no backend, depois de algo que muda a role (uma assinatura)
  refreshUser: () => Promise<void>;
  // Troca campos do usuário da sessão (o nome, depois da edição pelo Perfil)
  updateUser: (changes: Partial<User>) => Promise<void>;
  // Marca as boas-vindas como respondidas, com o nome gravado, e o app troca
  // para as abas
  completeOnboarding: (name: string | null) => Promise<void>;
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

  const sessionToken = session?.token ?? null;
  const signOut = useCallback(async () => {
    // O aparelho para de receber os avisos desta conta. Sem rede, sai mesmo
    // assim; o token muda de dono quando outra conta entrar no aparelho.
    const pushToken = await loadPushToken();
    if (pushToken && sessionToken) {
      await deletePushToken(sessionToken, pushToken).catch(() => {});
    }
    await clearPushToken().catch(() => {});
    await clearSession();
    await signOutFromGoogle();
    setSession(null);
    setStatus('unauthenticated');
  }, [sessionToken]);

  const token = sessionToken;
  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const fresh = await me(token);
      await saveSession(fresh);
      setSession(fresh);
    } catch {
      // Sem rede: a conta fica como estava e é relida na próxima abertura.
      // O 401 já derruba o login pelo api.
    }
  }, [token]);

  // Também na sessão guardada: sem rede na próxima abertura, o app não volta
  // para as boas-vindas nem mostra o nome antigo
  const updateUser = useCallback(
    async (changes: Partial<User>) => {
      if (!session) {
        return;
      }

      const next = { ...session, user: { ...session.user, ...changes } };
      await saveSession(next);
      setSession(next);
    },
    [session]
  );

  const completeOnboarding = useCallback(
    (name: string | null) => updateUser({ name, onboardingCompleted: true }),
    [updateUser]
  );

  const value = useMemo(
    () => ({
      status,
      user: session?.user ?? null,
      token: session?.token ?? null,
      signIn,
      signOut,
      refreshUser,
      updateUser,
      completeOnboarding,
    }),
    [
      status,
      session,
      signIn,
      signOut,
      refreshUser,
      updateUser,
      completeOnboarding,
    ]
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
