import * as Notifications from 'expo-notifications';

import { usePushRegistration } from '@/hooks/usePushRegistration';
import { usePushResponse } from '@/hooks/usePushResponse';

import type { PushApi } from './push';

// O push de verdade. Só é carregado por `push.ts`, quando o app instalado
// tem o módulo nativo; nenhum outro arquivo importa o expo-notifications
// direto.
const pushApi: PushApi = {
  usePushRegistration,
  usePushResponse,
  clearLastPushResponse: () => {
    Notifications.clearLastNotificationResponse();
  },
};

export default pushApi;
