import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { markNotificationRead } from '@/services/notifications';
import {
  openNotificationLink,
  parseNotificationLink,
} from '@/utils/notifications';

export interface PushResponseHandlers {
  // Total novo de não lidas, depois de marcar a tocada como lida
  onUnreadChange: (unread: number) => void;
  // Chegou um push com o app aberto
  onReceived: () => void;
}

// Trata o toque no push, com o app aberto, em segundo plano ou fechado: marca
// a notificação como lida e abre o destino dela (ou o detalhe, sem destino).
// Cada toque é tratado uma vez só.
export function usePushResponse({
  onUnreadChange,
  onReceived,
}: PushResponseHandlers) {
  const router = useRouter();
  const { token } = useAuth();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (
      !response ||
      !token ||
      response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      return;
    }

    // Limpa antes de navegar: a volta a esta tela não repete o toque
    Notifications.clearLastNotificationResponse();

    const data = response.notification.request.content.data ?? {};
    const notificationId =
      typeof data.notificationId === 'string' ? data.notificationId : null;
    if (!notificationId) {
      return;
    }

    markNotificationRead(token, notificationId)
      .then(onUnreadChange)
      .catch(() => {});

    const link = parseNotificationLink(data.link);
    if (link) {
      openNotificationLink(router, link);
    } else {
      router.push({
        pathname: '/notifications/[id]',
        params: { id: notificationId },
      });
    }
  }, [response, token, router, onUnreadChange]);

  useEffect(() => {
    const subscription =
      Notifications.addNotificationReceivedListener(onReceived);
    return () => subscription.remove();
  }, [onReceived]);
}
