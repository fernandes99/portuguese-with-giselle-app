import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import {
  getDevicePushToken,
  getPushPermission,
  PUSH_PLATFORM,
  type PushPermission,
  requestPushPermission,
  setupNotificationChannel,
} from '@/lib/pushNotifications';
import {
  hasAskedPushPermission,
  markPushPermissionAsked,
  savePushTokenLocally,
} from '@/lib/storage';
import { savePushToken } from '@/services/notifications';

// Pede a permissão de notificações uma vez por aparelho, na primeira entrada
// na área logada, e manda o token de push ao backend a cada abertura do app.
// Devolve a permissão atual, para a tela de notificações avisar quando ela
// foi negada.
export function usePushRegistration() {
  const { token } = useAuth();
  const [permission, setPermission] = useState<PushPermission | null>(null);
  // A última permissão lida, para saber quando ela passou a ser concedida
  const lastPermission = useRef<PushPermission | null>(null);

  const updatePermission = useCallback((status: PushPermission) => {
    const previous = lastPermission.current;
    lastPermission.current = status;
    setPermission(status);
    return previous;
  }, []);

  const register = useCallback(async () => {
    if (!token) {
      return;
    }

    const pushToken = await getDevicePushToken();
    if (!pushToken) {
      return;
    }

    try {
      await savePushToken(token, pushToken, PUSH_PLATFORM);
      await savePushTokenLocally(pushToken);
    } catch {
      // Sem rede: tenta de novo na próxima abertura
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      await setupNotificationChannel();

      let status = await getPushPermission();
      if (status === 'undetermined' && !(await hasAskedPushPermission())) {
        await markPushPermissionAsked();
        status = await requestPushPermission();
      }
      if (cancelled) {
        return;
      }

      updatePermission(status);
      if (status === 'granted') {
        await register();
      }
    }

    start().catch(() => {});

    // O sistema trocou o token do aparelho
    const tokenSubscription = Notifications.addPushTokenListener(() => {
      register();
    });

    // O aluno pode ter ligado as notificações nos ajustes e voltado ao app
    const appStateSubscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state !== 'active') {
          return;
        }
        getPushPermission()
          .then((status) => {
            const previous = updatePermission(status);
            if (status === 'granted' && previous !== 'granted') {
              register();
            }
          })
          .catch(() => {});
      }
    );

    return () => {
      cancelled = true;
      tokenSubscription.remove();
      appStateSubscription.remove();
    };
  }, [register, updatePermission]);

  return { permission };
}
