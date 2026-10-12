import '../../global.css';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { WelcomeScreen } from '@/components/WelcomeScreen';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { hasSeenWelcome, markWelcomeSeen } from '@/lib/storage';

// A splash nativa fica na tela até as fontes, a sessão e a marca da
// introdução estarem prontas
SplashScreen.preventAutoHideAsync();

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { status } = useAuth();
  // null enquanto a marca ainda não foi lida do aparelho
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);
  const ready = fontsReady && status !== 'loading' && welcomeSeen !== null;
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    hasSeenWelcome().then(setWelcomeSeen);
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  // Primeira abertura do app: introdução antes do login
  if (!isAuthenticated && !welcomeSeen) {
    return (
      <WelcomeScreen
        onDone={() => {
          setWelcomeSeen(true);
          markWelcomeSeen();
        }}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator fontsReady={fontsLoaded || fontError !== null} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
