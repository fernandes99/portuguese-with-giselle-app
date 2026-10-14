import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Para onde a notificação leva: uma tela do app (caminho do Expo Router) ou
// uma URL, aberta no navegador. O backend já traduz o destino para o app.
export type NotificationLink =
  | { type: 'screen'; path: string; label: string }
  | { type: 'url'; url: string; label: string };

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  // Instantes em ISO
  receivedAt: string;
  readAt: string | null;
  // null: o destino não tem tela no app
  link: NotificationLink | null;
}

export interface NotificationsPage {
  // Da mais nova para a mais antiga
  notifications: NotificationItem[];
  // Para pedir a próxima página; null na última
  nextCursor: string | null;
  // Total de não lidas da conta
  unread: number;
}

export function getNotifications(token: string, cursor?: string | null) {
  const path = cursor
    ? `${API_ROUTES.notifications}?cursor=${encodeURIComponent(cursor)}`
    : API_ROUTES.notifications;

  return api<NotificationsPage>(path, { token });
}

export async function getUnreadNotifications(token: string) {
  const { unread } = await api<{ unread: number }>(
    API_ROUTES.notificationsUnread,
    { token }
  );
  return unread;
}

export async function getNotification(token: string, id: string) {
  const { notification } = await api<{ notification: NotificationItem }>(
    API_ROUTES.notification(id),
    { token }
  );
  return notification;
}

// Devolve o novo total de não lidas
export async function markNotificationRead(token: string, id: string) {
  const { unread } = await api<{ unread: number }>(
    API_ROUTES.notificationRead(id),
    { method: 'POST', token }
  );
  return unread;
}

export async function markAllNotificationsRead(token: string) {
  const { unread } = await api<{ unread: number }>(
    API_ROUTES.notificationsReadAll,
    { method: 'POST', token }
  );
  return unread;
}

export type PushPlatform = 'android' | 'ios';

// Liga o aparelho à conta: o backend passa a mandar o push para ele
export function savePushToken(
  token: string,
  pushToken: string,
  platform: PushPlatform
) {
  return api<{ ok: true }>(API_ROUTES.pushTokens, {
    method: 'POST',
    body: { token: pushToken, platform },
    token,
  });
}

// Ao sair da conta, o aparelho para de receber os avisos dela
export function deletePushToken(token: string, pushToken: string) {
  return api<{ ok: true }>(API_ROUTES.pushTokens, {
    method: 'DELETE',
    body: { token: pushToken },
    token,
  });
}
