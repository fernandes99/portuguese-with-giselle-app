import * as SecureStore from 'expo-secure-store';

import type { Session } from '@/services/auth';

const SESSION_KEY = 'pwg.session';

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  return SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  return SecureStore.deleteItemAsync(SESSION_KEY);
}

const WELCOME_KEY = 'pwg.welcomeSeen';

// A introdução aparece só na primeira abertura do app neste aparelho
export async function hasSeenWelcome(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(WELCOME_KEY)) === '1';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  return SecureStore.setItemAsync(WELCOME_KEY, '1');
}

const PUSH_ASKED_KEY = 'pwg.pushPermissionAsked';

// O pedido de permissão de notificações aparece uma vez por aparelho. A marca
// não é apagada ao sair da conta.
export async function hasAskedPushPermission(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(PUSH_ASKED_KEY)) === '1';
  } catch {
    return false;
  }
}

export function markPushPermissionAsked() {
  return SecureStore.setItemAsync(PUSH_ASKED_KEY, '1');
}

const PUSH_TOKEN_KEY = 'pwg.pushToken';

// Último token de push mandado ao backend, para apagá-lo ao sair da conta
export async function loadPushToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function savePushTokenLocally(token: string) {
  return SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export function clearPushToken() {
  return SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}

const CHAT_AUTOPLAY_KEY = 'pwg.chatAutoplay';

// A Gisa lê as respostas em voz alta sozinha; ligado até o aluno desligar
// na folha de configurações do chat
export async function getChatAutoplay(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(CHAT_AUTOPLAY_KEY)) !== '0';
  } catch {
    return true;
  }
}

export function setChatAutoplay(enabled: boolean) {
  return SecureStore.setItemAsync(CHAT_AUTOPLAY_KEY, enabled ? '1' : '0');
}
