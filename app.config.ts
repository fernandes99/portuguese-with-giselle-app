import type { ConfigContext, ExpoConfig } from 'expo/config';

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

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Portuguese With Giselle',
  slug: 'portuguese-with-giselle-app',
  version: '1.0.0',
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
    adaptiveIcon: {
      backgroundColor: BACKGROUND,
      foregroundImage: './assets/android-icon-foreground.png',
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-web-browser',
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
  experiments: {
    typedRoutes: true,
  },
});
