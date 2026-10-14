import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useNotificationsUnread } from '@/contexts/NotificationsContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  getNotification,
  markNotificationRead,
  type NotificationItem,
} from '@/services/notifications';

// Uma notificação, para a tela de detalhe. Abrir a tela marca como lida.
export function useNotification(id: string) {
  const { token } = useAuth();
  const { setUnread } = useNotificationsUnread();

  const [notification, setNotification] = useState<NotificationItem | null>(
    null
  );
  const [error, setError] = useState('');
  // A notificação não é da conta ou foi excluída pela professora
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setError('');
    try {
      const item = await getNotification(token, id);
      setNotification(item);

      // Falha ao marcar não atrapalha a leitura: fica não lida
      if (item.readAt === null) {
        markNotificationRead(token, id)
          .then((unread) => {
            setUnread(unread);
            setNotification({ ...item, readAt: new Date().toISOString() });
          })
          .catch(() => {});
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        return;
      }
      setError(getErrorMessage(err, 'Erro ao carregar a notificação.'));
    }
  }, [token, id, setUnread]);

  useEffect(() => {
    load();
  }, [load]);

  return { notification, error, notFound, reload: load };
}
