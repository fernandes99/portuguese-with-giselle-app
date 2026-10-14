import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PushPlatform } from '@/services/notifications';

// Canal do Android para onde o backend manda o push (`channelId`)
const CHANNEL_ID = 'default';

export const PUSH_PLATFORM: PushPlatform =
  Platform.OS === 'ios' ? 'ios' : 'android';

export type PushPermission = 'granted' | 'denied' | 'undetermined';

// Com o app aberto, o push aparece como banner, com som. O número no ícone
// do app não é usado.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// No Android 13 ou mais novo, o canal precisa existir antes do pedido de
// permissão
export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Notificações',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function getPushPermission(): Promise<PushPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestPushPermission(): Promise<PushPermission> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

// Token de push da Expo deste aparelho, ou null onde não há push (simulador
// do iOS, emulador sem os serviços do Google). Emulador Android com Google
// Play recebe push, então só o simulador do iOS fica de fora antes de tentar.
export async function getDevicePushToken(): Promise<string | null> {
  if (!Device.isDevice && Platform.OS === 'ios') {
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('Push token unavailable:', error);
    }
    return null;
  }
}
