import { usePathname, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { QuantityStepper } from '@/components/privateLessons/QuantityStepper';
import { PURCHASE_RETURN_URL } from '@/constants/config';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  createLessonCheckout,
  getPrivateLessons,
} from '@/services/privateLessons';
import { formatLessons, formatPrice } from '@/utils/privateLessons';

const RESULT_PATH = '/practice/private-lessons/purchase';

// Escolha de quantas aulas comprar. O pagamento acontece numa página do
// Stripe, fora do app; ao voltar, a tela de resultado confere a compra.
export default function BuyLessonsScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();
  const {
    data: summary,
    error: loadError,
    refresh,
  } = useApiQuery(getPrivateLessons, 'Erro ao carregar as aulas particulares.');

  const [quantity, setQuantity] = useState(1);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Lido depois que o navegador fecha, quando o valor do render já é antigo
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const pay = async () => {
    if (!token || paying) {
      return;
    }

    setPaying(true);
    setError('');
    try {
      const checkout = await createLessonCheckout(token, quantity);

      // Resolve quando o Stripe devolve o aluno ao app ou quando ele fecha
      // o navegador. Nos dois casos quem diz se a compra foi paga é o
      // backend, consultado pela tela de resultado.
      const result = await WebBrowser.openAuthSessionAsync(
        checkout.url,
        PURCHASE_RETURN_URL
      );

      // O aluno tocou em voltar no Checkout: nada foi pago, e ele continua
      // aqui para tentar de novo ou mudar a quantidade
      if (result.type === 'success' && result.url.includes('result=cancel')) {
        return;
      }

      // No Android o endereço de retorno pode já ter aberto a tela
      if (pathnameRef.current !== RESULT_PATH) {
        router.replace({
          pathname: RESULT_PATH,
          params: { sessionId: checkout.sessionId },
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setError(getErrorMessage(err, 'Não foi possível iniciar o pagamento.'));
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Comprar aulas" />
      <ScrollView contentContainerClassName="flex-grow gap-6 px-5 pb-8 pt-4">
        {loadError ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">
              {loadError}
            </Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {summary ? (
          <>
            <View className="gap-1">
              <Text className="font-poppins-bold text-2xl text-gray-900">
                Quantas aulas?
              </Text>
              <Text className="font-poppins text-base text-gray-600">
                {formatPrice(summary.price)} por aula
              </Text>
            </View>

            <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-6">
              <QuantityStepper
                quantity={quantity}
                max={summary.maxQuantity}
                onChange={setQuantity}
              />
              <View className="h-px bg-gray-200" />
              <View className="flex-row items-center justify-between">
                <Text className="font-poppins text-base text-gray-600">
                  {formatLessons(quantity)}
                </Text>
                <Text className="font-poppins-bold text-xl text-gray-900">
                  {formatPrice(summary.price, quantity)}
                </Text>
              </View>
            </View>

            <Text className="font-poppins text-sm text-gray-600">
              O pagamento é feito com cartão, em uma página segura do Stripe.
              Depois de pagar, você volta para o app.
            </Text>

            <View className="mt-auto gap-3">
              {error ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="text-center font-poppins text-sm text-red-700"
                >
                  {error}
                </Text>
              ) : null}
              <Button
                size="lg"
                label="Continuar para o pagamento"
                loading={paying}
                onPress={pay}
              />
            </View>
          </>
        ) : null}

        {!summary && !loadError ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
