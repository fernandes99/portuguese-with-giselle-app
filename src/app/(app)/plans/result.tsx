import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Redirect,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanCheckoutStatus } from '@/hooks/usePlanCheckoutStatus';
import { getTierName } from '@/utils/plans';

const PLANS_PATH = '/plans';

function Result({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="items-center gap-3">
      {icon}
      <Text
        accessibilityRole="header"
        className="text-center font-poppins-bold text-2xl text-gray-900"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Message({ children }: { children: ReactNode }) {
  return (
    <Text className="text-center font-poppins text-base text-gray-600">
      {children}
    </Text>
  );
}

// Resultado de uma assinatura. Abre depois do pagamento, vinda da tela de
// planos (sessionId) ou do endereço para onde o site devolve o aluno
// (session_id).
export default function PlanResultScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const params = useLocalSearchParams<{
    sessionId?: string;
    session_id?: string;
    result?: string;
  }>();
  const sessionId = params.sessionId || params.session_id || '';
  // O site devolveu o aluno depois de ele desistir no Checkout
  const gaveUp = params.result === 'cancel';

  const { state, tier, retry } = usePlanCheckoutStatus(sessionId);
  const isPaid = state === 'paid';

  // A role mudou no backend: relê a conta, uma vez, para o app inteiro
  // passar a tratar o aluno como assinante
  const refreshed = useRef(false);
  useEffect(() => {
    if (isPaid && !refreshed.current) {
      refreshed.current = true;
      refreshUser();
    }
  }, [isPaid, refreshUser]);

  // Fecha as telas de planos e leva à aba Aprender
  const goLearn = useCallback(() => {
    router.dismissAll();
    router.navigate('/');
  }, [router]);

  const goPlans = useCallback(() => router.replace(PLANS_PATH), [router]);

  // O voltar do Android nunca leva de volta ao pagamento
  useFocusEffect(
    useCallback(() => {
      if (gaveUp) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isPaid) {
            goLearn();
          } else {
            goPlans();
          }
          return true;
        }
      );
      return () => subscription.remove();
    }, [gaveUp, isPaid, goLearn, goPlans])
  );

  // Quem desistiu volta para a tela de planos, que ficou embaixo
  useEffect(() => {
    if (gaveUp && router.canGoBack()) {
      router.back();
    }
  }, [gaveUp, router]);

  if (gaveUp) {
    return router.canGoBack() ? null : <Redirect href={PLANS_PATH} />;
  }

  if (!sessionId) {
    return <Redirect href={PLANS_PATH} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Sem o gesto de voltar do iOS, pelo mesmo motivo do Android */}
      <Stack.Screen options={{ gestureEnabled: false }} />

      <View className="flex-1 justify-center px-6">
        {state === 'checking' ? (
          <View className="items-center gap-4">
            <ActivityIndicator size="large" color={colors.green} />
            <Text
              accessibilityLiveRegion="polite"
              className="font-poppins text-base text-gray-600"
            >
              Confirmando o pagamento...
            </Text>
          </View>
        ) : null}

        {isPaid ? (
          <Result
            icon={
              <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <MaterialCommunityIcons
                  name="crown"
                  size={52}
                  color={colors.green}
                />
              </View>
            }
            title={`Bem-vindo ao ${getTierName(tier ?? 'basic')}!`}
          >
            <Message>Seu plano já está ativo. Bons estudos!</Message>
          </Result>
        ) : null}

        {state === 'unconfirmed' ? (
          <Result
            icon={
              <Ionicons name="time-outline" size={72} color={colors.gray} />
            }
            title="Ainda estamos confirmando o pagamento."
          >
            <Message>
              Se você não concluiu o pagamento, nada foi cobrado. Se concluiu,
              seu plano aparece em instantes.
            </Message>
          </Result>
        ) : null}

        {state === 'failed' ? (
          <Result
            icon={
              <Ionicons
                name="close-circle-outline"
                size={72}
                color={colors.gray}
              />
            }
            title="O pagamento não foi concluído."
          >
            <Message>Nada foi cobrado.</Message>
          </Result>
        ) : null}
      </View>

      {state !== 'checking' ? (
        <View className="gap-2 px-6 pb-6">
          {isPaid ? (
            <Button size="lg" label="Começar a estudar" onPress={goLearn} />
          ) : null}
          {state === 'unconfirmed' ? (
            <Button size="lg" label="Conferir de novo" onPress={retry} />
          ) : null}
          {state === 'failed' ? (
            <Button size="lg" label="Ver os planos" onPress={goPlans} />
          ) : null}
          {state === 'unconfirmed' ? (
            <Button variant="link" label="Voltar" onPress={goPlans} />
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
