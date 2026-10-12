import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useTeacherChatUnread } from '@/contexts/TeacherChatUnreadContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  getTeacherChat,
  sendTeacherChatMessage,
  type TeacherChatMessage,
} from '@/services/teacherChat';

// De quanto em quanto tempo a tela busca mensagens novas
const REFRESH_INTERVAL_MS = 30000;
// Usado até o backend dizer o limite
const DEFAULT_MAX_LENGTH = 2000;

// Mensagem escrita no aparelho que o backend ainda não gravou
export interface PendingMessage {
  localId: string;
  content: string;
  status: 'sending' | 'failed';
}

// Junta páginas da conversa sem repetir mensagem, em ordem crescente
function mergeMessages(
  current: TeacherChatMessage[],
  incoming: TeacherChatMessage[]
) {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
  );
}

// Conversa do aluno com a professora. As mensagens vêm sempre do backend; no
// aparelho ficam só as que ainda estão em envio ou que falharam. `enabled`
// é falso para quem não é assinante: nada é buscado.
export function useTeacherChat(enabled: boolean) {
  const { token, signOut } = useAuth();
  const { clearUnread } = useTeacherChatUnread();

  // null enquanto a primeira carga não termina
  const [messages, setMessages] = useState<TeacherChatMessage[] | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [maxLength, setMaxLength] = useState(DEFAULT_MAX_LENGTH);
  // Erro da primeira carga; as buscas periódicas falham em silêncio
  const [error, setError] = useState('');
  // O backend recusou por a conta não ser de assinante
  const [isBlocked, setIsBlocked] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const hasLoaded = useRef(false);
  const nextLocalId = useRef(1);

  // Devolve true quando o erro já foi tratado (sessão ou bloqueio)
  const handleAccessError = useCallback(
    async (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return true;
      }
      if (err instanceof ApiError && err.status === 403) {
        setIsBlocked(true);
        return true;
      }
      return false;
    },
    [signOut]
  );

  const load = useCallback(async () => {
    if (!token || !enabled) {
      return;
    }

    try {
      const page = await getTeacherChat(token);

      setMessages((current) => mergeMessages(current ?? [], page.messages));
      setMaxLength(page.maxLength);
      setError('');
      // Só a primeira carga sabe se há mensagens antes das que estão na tela
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setHasMore(page.hasMore);
      }
      // Abrir a conversa a marca como lida no backend
      clearUnread();
    } catch (err) {
      if (await handleAccessError(err)) {
        return;
      }
      if (!hasLoaded.current) {
        setError(getErrorMessage(err, 'Erro ao carregar as mensagens.'));
      }
    }
  }, [token, enabled, clearUnread, handleAccessError]);

  // Com a tela em foco e o app em primeiro plano: busca na hora, a cada 30
  // segundos e quando o app volta do segundo plano
  useFocusEffect(
    useCallback(() => {
      load();

      const interval = setInterval(() => {
        if (AppState.currentState === 'active') {
          load();
        }
      }, REFRESH_INTERVAL_MS);

      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          load();
        }
      });

      return () => {
        clearInterval(interval);
        subscription.remove();
      };
    }, [load])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const loadOlder = useCallback(async () => {
    const oldest = messages?.[0];
    if (!token || !oldest || isLoadingOlder) {
      return;
    }

    setIsLoadingOlder(true);
    try {
      const page = await getTeacherChat(token, oldest.id);
      setMessages((current) => mergeMessages(current ?? [], page.messages));
      setHasMore(page.hasMore);
    } catch (err) {
      await handleAccessError(err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [token, messages, isLoadingOlder, handleAccessError]);

  const deliver = useCallback(
    async (message: PendingMessage) => {
      if (!token) {
        return;
      }

      try {
        const saved = await sendTeacherChatMessage(token, message.content);

        setPending((current) =>
          current.filter((item) => item.localId !== message.localId)
        );
        setMessages((current) => mergeMessages(current ?? [], [saved]));
      } catch (err) {
        await handleAccessError(err);
        setPending((current) =>
          current.map((item) =>
            item.localId === message.localId
              ? { ...item, status: 'failed' }
              : item
          )
        );
      }
    },
    [token, handleAccessError]
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content) {
        return;
      }

      const message: PendingMessage = {
        localId: `local-${nextLocalId.current++}`,
        content,
        status: 'sending',
      };
      setPending((current) => [...current, message]);
      deliver(message);
    },
    [deliver]
  );

  const retry = useCallback(
    (localId: string) => {
      const message = pending.find((item) => item.localId === localId);
      if (message?.status !== 'failed') {
        return;
      }

      const retried: PendingMessage = { ...message, status: 'sending' };
      setPending((current) =>
        current.map((item) => (item.localId === localId ? retried : item))
      );
      deliver(retried);
    },
    [pending, deliver]
  );

  return {
    messages,
    pending,
    hasMore,
    maxLength,
    error,
    isBlocked,
    refreshing,
    isLoadingOlder,
    refresh,
    loadOlder,
    send,
    retry,
  };
}
