import type { Href, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import type { NotificationLink } from '@/services/notifications';

// Abre o destino de uma notificação. O caminho da tela vem do backend como
// texto, por isso a conversão: as rotas tipadas só conhecem caminhos escritos
// no código.
export function openNotificationLink(
  router: ReturnType<typeof useRouter>,
  link: NotificationLink
) {
  if (link.type === 'url') {
    return WebBrowser.openBrowserAsync(link.url);
  }

  router.push(link.path as Href);
}

// O link que vem no push: confere o formato antes de usar
export function parseNotificationLink(value: unknown): NotificationLink | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const link = value as Record<string, unknown>;
  if (typeof link.label !== 'string') {
    return null;
  }
  if (link.type === 'screen' && typeof link.path === 'string') {
    return { type: 'screen', path: link.path, label: link.label };
  }
  if (link.type === 'url' && typeof link.url === 'string') {
    return { type: 'url', url: link.url, label: link.label };
  }
  return null;
}

// Rótulo do sino para o leitor de tela
export function getBellLabel(unread: number) {
  if (unread === 0) {
    return 'Notificações';
  }
  return `Notificações, ${unread} ${unread === 1 ? 'não lida' : 'não lidas'}`;
}
