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
