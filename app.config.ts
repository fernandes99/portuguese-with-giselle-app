import type { ConfigContext, ExpoConfig } from 'expo/config';

import packageJson from './package.json';

const APP_ID = 'com.portuguesewithgiselle.app';
const BACKGROUND = '#f9fafb';

// O plugin do Google Sign-In só é necessário no iOS, e precisa do client ID
// de iOS invertido como URL scheme. Sem a variável, o plugin fica de fora.
function googleSignInPlugin(): [string, { iosUrlScheme: string }][] {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!iosClientId) {
    return [];
  }

  const iosUrlScheme = iosClientId.split('.').reverse().join('.');
  return [['@react-native-google-signin/google-signin', { iosUrlScheme }]];
}

// Credenciais do Firebase para o push no Android. O arquivo fica fora do
// git: no EAS, GOOGLE_SERVICES_JSON é uma variável do tipo arquivo; no build
// local, aponta para o arquivo (ex.: ./google-services.json, no .env). Sem
// ela, o build sai sem push no Android.
const GOOGLE_SERVICES_FILE = process.env.GOOGLE_SERVICES_JSON || undefined;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Portuguese With Giselle',
  slug: 'portuguese-with-giselle-app',
  version: packageJson.version,
  scheme: 'pwg',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: BACKGROUND,
  ios: {
    bundleIdentifier: APP_ID,
    supportsTablet: true,
  },
  android: {
    package: APP_ID,
    googleServicesFile: GOOGLE_SERVICES_FILE,
    adaptiveIcon: {
      backgroundColor: BACKGROUND,
      foregroundImage: './assets/android-icon-foreground.png',
    },
  },
  plugins: [
    'expo-router',
    'expo-asset',
    'expo-status-bar',
    'expo-secure-store',
    'expo-font',
    'expo-web-browser',
    [
      'expo-audio',
      {
        microphonePermission:
          'Permita o acesso ao microfone para praticar a pronúncia.',
        // Sem áudio em segundo plano: os áudios só tocam com a tela aberta
        enableBackgroundPlayback: false,
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Permita o acesso ao microfone para praticar a pronúncia.',
        speechRecognitionPermission:
          'Permita o reconhecimento de fala para conferir a sua pronúncia.',
      },
    ],
    [
      'expo-notifications',
      {
        // Cor de destaque do push na barra do Android
        color: '#00a63e',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: BACKGROUND,
        image: './assets/splash-icon.png',
        imageWidth: 160,
      },
    ],
    ...googleSignInPlugin(),
  ],
  extra: {
    eas: {
      projectId: '3d86602a-d3a4-4a02-9a1b-3edf73c18314',
    },
  },
  experiments: {
    typedRoutes: true,
  },
});
