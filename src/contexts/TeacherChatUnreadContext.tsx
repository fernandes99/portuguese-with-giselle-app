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
import { getTeacherChatEntry } from '@/services/teacherChat';

interface TeacherChatUnreadValue {
  // Se o botão do chat aparece para esta conta
  available: boolean;
  // O aluno fechou o botão; ele volta quando o app abre de novo
  dismissed: boolean;
  dismiss: () => void;
  // Mensagens da professora que o aluno ainda não leu
  unread: number;
  refreshUnread: () => Promise<void>;
  // A conversa foi aberta: o contador zera sem esperar o backend
  clearUnread: () => void;
}

const TeacherChatUnreadContext = createContext<TeacherChatUnreadValue | null>(
  null
);

// Estado do botão do chat com a professora: se ele aparece e quantas
// mensagens não lidas há. Sem notificação, é esse contador que avisa o aluno
// da resposta. É buscado quando a área logada abre e quando o app volta ao
// primeiro plano; o botão busca de novo quando as abas ganham foco.
export function TeacherChatUnreadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);
  const [available, setAvailable] = useState(false);
  // Fica só em memória: fechar o app e abrir de novo traz o botão de volta
  const [dismissed, setDismissed] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const entry = await getTeacherChatEntry(token);
      setUnread(entry.unread);
      setAvailable(entry.available);
    } catch {
      // Falha aqui não é mostrada: o botão fica como estava
    }
  }, [token]);

  const clearUnread = useCallback(() => setUnread(0), []);
  const dismiss = useCallback(() => setDismissed(true), []);

  useEffect(() => {
    refreshUnread();

    let wasInBackground = false;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        wasInBackground = true;
      }
      if (state === 'active') {
        // Voltar do segundo plano também conta como abrir o app de novo
        if (wasInBackground) {
          wasInBackground = false;
          setDismissed(false);
        }
        refreshUnread();
      }
    });
    return () => subscription.remove();
  }, [refreshUnread]);

  const value = useMemo(
    () => ({
      available,
      dismissed,
      unread,
      refreshUnread,
      clearUnread,
      dismiss,
    }),
    [available, dismissed, unread, refreshUnread, clearUnread, dismiss]
  );

  return (
    <TeacherChatUnreadContext.Provider value={value}>
      {children}
    </TeacherChatUnreadContext.Provider>
  );
}

export function useTeacherChatUnread() {
  const context = useContext(TeacherChatUnreadContext);
  if (!context) {
    throw new Error(
      'useTeacherChatUnread must be used inside TeacherChatUnreadProvider'
    );
  }
  return context;
}
