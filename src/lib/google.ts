import Constants, { ExecutionEnvironment } from 'expo-constants';

import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

// O Expo Go não tem o módulo nativo do Google Sign-In
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export class GoogleUnavailableError extends Error {
  constructor() {
    super(
      'O login com Google não funciona no Expo Go. Use email e senha ou um development build.'
    );
    this.name = 'GoogleUnavailableError';
  }
}

let configured = false;

// O import é sob demanda porque só carregar o módulo já quebra no Expo Go.
async function loadGoogleSignIn() {
  if (isExpoGo) {
    throw new GoogleUnavailableError();
  }

  const module = await import('@react-native-google-signin/google-signin');

  if (!configured) {
    // O webClientId define a audiência do ID token, que o backend valida
    // contra o GOOGLE_CLIENT_ID do site.
    module.GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    });
    configured = true;
  }

  return module;
}

// Devolve o ID token do Google, ou null se o usuário cancelou.
export async function getGoogleIdToken(): Promise<string | null> {
  const { GoogleSignin, isSuccessResponse } = await loadGoogleSignIn();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  if (!response.data.idToken) {
    throw new Error('Google sign-in returned no ID token');
  }

  return response.data.idToken;
}

export async function signOutFromGoogle() {
  try {
    const { GoogleSignin } = await loadGoogleSignIn();
    await GoogleSignin.signOut();
  } catch {
    // Sair do app não pode falhar por causa do Google
  }
}
