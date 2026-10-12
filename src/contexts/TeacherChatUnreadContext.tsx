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
import { getTeacherChatUnread } from '@/services/teacherChat';

interface TeacherChatUnreadValue {
  // Mensagens da professora que o aluno ainda não leu
  unread: number;
  refreshUnread: () => Promise<void>;
  // A conversa foi aberta: o contador zera sem esperar o backend
  clearUnread: () => void;
}

const TeacherChatUnreadContext = createContext<TeacherChatUnreadValue | null>(
  null
);

// Sem notificação, é este contador que avisa o aluno da resposta. Ele é
// buscado quando a área logada abre e quando o app volta ao primeiro plano;
// o Perfil busca de novo ao ganhar foco.
export function TeacherChatUnreadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useAuth();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setUnread(await getTeacherChatUnread(token));
    } catch {
      // Falha aqui não é mostrada: o contador fica como estava
    }
  }, [token]);

  const clearUnread = useCallback(() => setUnread(0), []);

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
    () => ({ unread, refreshUnread, clearUnread }),
    [unread, refreshUnread, clearUnread]
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
