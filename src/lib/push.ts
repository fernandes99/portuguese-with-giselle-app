import { requireOptionalNativeModule } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { PushResponseHandlers } from '@/hooks/usePushResponse';
import type { PushPermission } from '@/lib/pushNotifications';

export interface PushApi {
  // Pede a permissão e registra o token; null quando não há push
  usePushRegistration: () => { permission: PushPermission | null };
  // Trata o toque no push e a chegada com o app aberto
  usePushResponse: (handlers: PushResponseHandlers) => void;
  clearLastPushResponse: () => void;
}

// Módulos nativos que o expo-notifications carrega ao ser importado
const NATIVE_MODULES = [
  'ExpoPushTokenManager',
  'ExpoNotificationsEmitter',
  ...(Platform.OS === 'android' ? ['ExpoTopicSubscriptionModule'] : []),
];

// O app instalado tem o push: um build feito depois da entrada do
// expo-notifications. No Expo Go ou num build anterior a ele, o import do
// pacote quebra o app, então o push fica desligado e o resto das
// notificações (sino, lista, detalhe) funciona igual.
function hasNativePush() {
  if (Platform.OS === 'web') {
    return false;
  }
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return false;
  }
  return NATIVE_MODULES.every(
    (name) => requireOptionalNativeModule(name) !== null
  );
}

export const PUSH_AVAILABLE = hasNativePush();

const disabledPush: PushApi = {
  usePushRegistration: () => ({ permission: null }),
  usePushResponse: () => {},
  clearLastPushResponse: () => {},
};

// O valor não muda enquanto o app roda, então a escolha das funções (e dos
// hooks) é a mesma em todo render
const push: PushApi = PUSH_AVAILABLE
  ? // require, e não import: o pacote só pode ser carregado com o módulo nativo
    require('./pushEnabled').default
  : disabledPush;

export const { usePushRegistration, usePushResponse, clearLastPushResponse } =
  push;
