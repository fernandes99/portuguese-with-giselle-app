import { Ionicons } from '@expo/vector-icons';
import {
  Redirect,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { formatAddedLessons, formatAvailable } from '@/utils/privateLessons';

const HOME_PATH = '/practice/private-lessons';

function Result({
  icon,
  iconColor,
  title,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="items-center gap-3">
      <Ionicons name={icon} size={72} color={iconColor} />
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

// Resultado de uma compra de aulas. Abre depois do pagamento, vinda da tela
// de compra (sessionId) ou do endereço para onde o site devolve o aluno
// (session_id).
export default function PurchaseResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId?: string;
    session_id?: string;
    result?: string;
  }>();
  const sessionId = params.sessionId || params.session_id || '';
  // O site devolveu o aluno depois de ele desistir no Checkout
  const gaveUp = params.result === 'cancel';

  const { state, purchase, retry } = usePurchaseStatus(sessionId);

  // Desempilha também a tela de compra, quando ela ficou embaixo
  const goHome = useCallback(() => router.dismissTo(HOME_PATH), [router]);

  // O voltar do Android leva às aulas, e não de volta à compra
  useFocusEffect(
    useCallback(() => {
      if (gaveUp) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goHome();
          return true;
        }
      );
      return () => subscription.remove();
    }, [goHome, gaveUp])
  );

  // Quem desistiu volta para a tela de compra, que ficou embaixo
  useEffect(() => {
    if (gaveUp && router.canGoBack()) {
      router.back();
    }
  }, [gaveUp, router]);

  if (gaveUp) {
    return router.canGoBack() ? null : <Redirect href={HOME_PATH} />;
  }

  if (!sessionId) {
    return <Redirect href={HOME_PATH} />;
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
              Confirmando seu pagamento...
            </Text>
          </View>
        ) : null}

        {state === 'paid' && purchase ? (
          <Result
            icon="checkmark-circle"
            iconColor={colors.green}
            title="Compra confirmada!"
          >
            <Message>{formatAddedLessons(purchase.quantity)}</Message>
            <Message>Você tem {formatAvailable(purchase.available)}.</Message>
          </Result>
        ) : null}

        {state === 'unconfirmed' ? (
          <Result
            icon="time-outline"
            iconColor={colors.gray}
            title="Não recebemos a confirmação do pagamento."
          >
            <Message>
              Se você não concluiu o pagamento, nada foi cobrado. Se concluiu,
              suas aulas aparecem em instantes.
            </Message>
          </Result>
        ) : null}

        {state === 'failed' ? (
          <Result
            icon="close-circle-outline"
            iconColor={colors.gray}
            title="Compra não concluída."
          >
            <Message>Nada foi cobrado.</Message>
          </Result>
        ) : null}
      </View>

      {state !== 'checking' ? (
        <View className="gap-2 px-6 pb-6">
          {state === 'unconfirmed' ? (
            <Button size="lg" label="Verificar de novo" onPress={retry} />
          ) : null}
          {state === 'failed' ? (
            <Button
              size="lg"
              label="Tentar novamente"
              onPress={() => router.replace('/practice/private-lessons/buy')}
            />
          ) : null}
          <Button
            size={state === 'paid' ? 'lg' : 'md'}
            variant={state === 'paid' ? 'primary' : 'link'}
            label="Voltar para as aulas"
            onPress={goHome}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
