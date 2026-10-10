import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/constants/config';

let configured = false;

function configure() {
  if (configured) {
    return;
  }

  // O webClientId define a audiência do ID token, que o backend valida
  // contra o GOOGLE_CLIENT_ID do site.
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
  });
  configured = true;
}

// Devolve o ID token do Google, ou null se o usuário cancelou.
export async function getGoogleIdToken(): Promise<string | null> {
  configure();

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
    configure();
    await GoogleSignin.signOut();
  } catch {
    // Sair do app não pode falhar por causa do Google
  }
}
