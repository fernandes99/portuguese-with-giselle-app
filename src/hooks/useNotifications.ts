import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsUnread } from '@/contexts/NotificationsContext';
import { getErrorMessage } from '@/lib/api';
import {
  getNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from '@/services/notifications';

// Lista de notificações em páginas. Recarregar volta à primeira página.
export function useNotifications() {
  const { token } = useAuth();
  const { setUnread } = useNotificationsUnread();

  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  // Muda a cada recarga: a página de uma carga antiga é descartada
  const request = useRef(0);

  const loadFirstPage = useCallback(async () => {
    if (!token) {
      return;
    }

    request.current += 1;
    const current = request.current;
    setError('');
    try {
      const page = await getNotifications(token);
      if (request.current !== current) {
        return;
      }
      setItems(page.notifications);
      setNextCursor(page.nextCursor);
      setUnread(page.unread);
    } catch (err) {
      if (request.current === current) {
        setError(getErrorMessage(err, 'Erro ao carregar as notificações.'));
      }
    }
  }, [token, setUnread]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadFirstPage();
    setRefreshing(false);
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!token || !nextCursor || isLoadingMore) {
      return;
    }

    const current = request.current;
    setIsLoadingMore(true);
    try {
      const page = await getNotifications(token, nextCursor);
      if (request.current !== current) {
        return;
      }
      setItems((previous) => [
        ...(previous ?? []),
        // Uma notificação agrupada pode ter subido para uma página já carregada
        ...page.notifications.filter(
          (item) => !previous?.some((loaded) => loaded.id === item.id)
        ),
      ]);
      setNextCursor(page.nextCursor);
      setUnread(page.unread);
    } catch (err) {
      if (request.current === current) {
        setError(getErrorMessage(err, 'Erro ao carregar as notificações.'));
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [token, nextCursor, isLoadingMore, setUnread]);

  // Marca todas como lidas sem recarregar a lista
  const markAllRead = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsMarkingAll(true);
    setError('');
    try {
      setUnread(await markAllNotificationsRead(token));
      const now = new Date().toISOString();
      setItems(
        (previous) =>
          previous?.map((item) =>
            item.readAt ? item : { ...item, readAt: now }
          ) ?? null
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível marcar como lidas.'));
    } finally {
      setIsMarkingAll(false);
    }
  }, [token, setUnread]);

  return {
    items,
    error,
    hasMore: nextCursor !== null,
    refreshing,
    isLoadingMore,
    isMarkingAll,
    refresh,
    reload: loadFirstPage,
    loadMore,
    markAllRead,
  };
}
