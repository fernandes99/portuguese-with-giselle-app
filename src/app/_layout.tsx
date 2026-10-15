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
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { WelcomeScreen } from '@/components/WelcomeScreen';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WelcomeProvider } from '@/contexts/WelcomeContext';
import { clearLastPushResponse } from '@/lib/push';
import { hasSeenWelcome, markWelcomeSeen } from '@/lib/storage';

// A splash nativa fica na tela até as fontes, a sessão e a marca da
// introdução estarem prontas
SplashScreen.preventAutoHideAsync();

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { status, user } = useAuth();
  // null enquanto a marca ainda não foi lida do aparelho
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);
  const ready = fontsReady && status !== 'loading' && welcomeSeen !== null;
  const isAuthenticated = status === 'authenticated';
  // Campo ausente (backend antigo) conta como respondido
  const needsOnboarding =
    isAuthenticated && user?.onboardingCompleted === false;

  useEffect(() => {
    hasSeenWelcome().then(setWelcomeSeen);
  }, []);

  // A tela de login pode pedir a introdução de novo. A marca do aparelho
  // não é apagada: na próxima abertura o app vai direto para o login.
  const welcome = useMemo(
    () => ({ showWelcome: () => setWelcomeSeen(false) }),
    []
  );

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  // Um toque no push sem sessão aberta é descartado: depois do login, o app
  // não abre uma notificação de antes
  useEffect(() => {
    if (status === 'unauthenticated') {
      clearLastPushResponse();
    }
  }, [status]);

  if (!ready) {
    return null;
  }

  // Primeira abertura do app, ou pedido da tela de login: introdução antes
  // do login
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
    <WelcomeProvider value={welcome}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={isAuthenticated && !needsOnboarding}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        {/* Antes das abas, enquanto o aluno não respondeu as boas-vindas */}
        <Stack.Protected guard={needsOnboarding}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </WelcomeProvider>
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
