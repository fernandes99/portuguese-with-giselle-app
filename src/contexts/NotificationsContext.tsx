import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { usePushRegistration, usePushResponse } from '@/lib/push';
import { getUnreadNotifications } from '@/services/notifications';

interface NotificationsValue {
  // Notificações que o aluno ainda não leu: o número do sino
  unread: number;
  refreshUnread: () => Promise<void>;
  // Para as rotas que já devolvem o total novo (marcar como lida)
  setUnread: (unread: number) => void;
  // O aluno negou a permissão de notificações: a tela de notificações avisa
  pushDenied: boolean;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

// Número do sino e o push. O número é buscado quando a área logada abre,
// quando o app volta ao primeiro plano e quando chega um push; o sino busca
// de novo quando a aba dele ganha foco. O push é registrado aqui, porque
// esta parte só existe com a sessão aberta.
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setUnread(await getUnreadNotifications(token));
    } catch {
      // Falha aqui não é mostrada: o número fica como estava
    }
  }, [token]);

  const { permission } = usePushRegistration();
  usePushResponse({ onUnreadChange: setUnread, onReceived: refreshUnread });

  useEffect(() => {
    refreshUnread();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshUnread();
      }
    });
    return () => subscription.remove();
  }, [refreshUnread]);

  const value = useMemo(
    () => ({
      unread,
      refreshUnread,
      setUnread,
      pushDenied: permission === 'denied',
    }),
    [unread, refreshUnread, permission]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsUnread() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotificationsUnread must be used inside NotificationsProvider'
    );
  }
  return context;
}
