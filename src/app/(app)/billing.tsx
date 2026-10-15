import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CardSummary } from '@/components/billing/CardSummary';
import { PaymentRow } from '@/components/billing/PaymentRow';
import { PrivateLessonsSummary } from '@/components/billing/PrivateLessonsSummary';
import { SubscriptionCard } from '@/components/billing/SubscriptionCard';
import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { BILLING_RETURN_URL } from '@/constants/config';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ApiError, getErrorMessage } from '@/lib/api';
import { createBillingPortal, getBilling } from '@/services/billing';
import { canSeePlans } from '@/utils/plans';

const LOAD_ERROR = 'Não foi possível carregar seus pagamentos.';

// Pagamentos do aluno: a assinatura, o cartão, o saldo de aulas
// particulares e o histórico de tudo o que foi pago (assinatura e aulas)
export default function BillingScreen() {
  const router = useRouter();
  const { token, user, signOut } = useAuth();
  const { data, error, refreshing, refresh, reload } = useApiQuery(
    getBilling,
    LOAD_ERROR
  );
  const [managing, setManaging] = useState(false);
  const [manageError, setManageError] = useState('');

  // Abre o portal do Stripe e recarrega na volta: o app não sabe o que o
  // aluno mudou lá
  const manage = async () => {
    if (!token || managing) {
      return;
    }

    setManaging(true);
    setManageError('');
    try {
      const { url } = await createBillingPortal(token);
      await WebBrowser.openAuthSessionAsync(url, BILLING_RETURN_URL);
      await reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setManageError(
        getErrorMessage(err, 'Não foi possível abrir o portal de pagamentos.')
      );
    } finally {
      setManaging(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Pagamentos" />

      {!data && !error ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.green} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="flex-grow gap-4 px-5 pb-8 pt-2"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.green]}
              tintColor={colors.green}
            />
          }
        >
          {error ? (
            <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="font-poppins text-sm text-red-700">{error}</Text>
              <Button variant="link" label="Tentar de novo" onPress={refresh} />
            </View>
          ) : null}

          {data ? (
            <>
              <SubscriptionCard
                subscription={data.subscription}
                canManage={data.canManage}
                canSeePlans={canSeePlans(user)}
                managing={managing}
                manageError={manageError}
                onManage={manage}
                onSeePlans={() => router.push('/plans')}
              />

              {data.card ? <CardSummary card={data.card} /> : null}

              <PrivateLessonsSummary
                balance={data.privateLessons.balance}
                onBuy={() => router.push('/practice/private-lessons/buy')}
              />

              <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <Text className="px-4 pb-2 pt-4 font-poppins-semibold text-xs uppercase text-gray-500">
                  Histórico
                </Text>
                {data.payments.length === 0 ? (
                  <Text className="px-4 pb-4 font-poppins text-sm text-gray-600">
                    Nenhum pagamento ainda.
                  </Text>
                ) : (
                  data.payments.map((payment) => (
                    <PaymentRow
                      key={payment.id}
                      payment={payment}
                      onOpenReceipt={(url) => WebBrowser.openBrowserAsync(url)}
                    />
                  ))
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
