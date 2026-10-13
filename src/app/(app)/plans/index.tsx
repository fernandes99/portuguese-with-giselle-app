import { usePathname, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PlanCard } from '@/components/plans/PlanCard';
import { PlanComparison } from '@/components/plans/PlanComparison';
import { PlansFooter } from '@/components/plans/PlansFooter';
import { PlansHero } from '@/components/plans/PlansHero';
import { PLANS_RETURN_URL } from '@/constants/config';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ApiError, getErrorMessage } from '@/lib/api';
import { createPlanCheckout, getPlans, type PlanTier } from '@/services/plans';
import { getDefaultPlan, getPaidPlans } from '@/utils/plans';

const RESULT_PATH = '/plans/result';

// Tela de venda: os planos pagos, a comparação com o gratuito e o botão de
// assinar. O pagamento acontece numa página do Stripe, fora do app; ao
// voltar, a tela de resultado confere a compra.
export default function PlansScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();
  const {
    data,
    error: loadError,
    refresh,
    reload,
  } = useApiQuery(getPlans, 'Erro ao carregar os planos.');

  // null enquanto o aluno não escolhe: vale o plano destacado
  const [pickedTier, setPickedTier] = useState<PlanTier | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  // Lido depois que o navegador fecha, quando o valor do render já é antigo
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const paidPlans = data ? getPaidPlans(data.plans) : [];
  // Quem já tem o plano mais completo não escolhe nada
  const hasEverything = data?.currentTier === 'premium';
  const selectedPlan =
    data && !hasEverything
      ? (paidPlans.find(
          (plan) => plan.tier === pickedTier && plan.tier !== data.currentTier
        ) ?? getDefaultPlan(data.plans, data.currentTier))
      : null;

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const subscribe = async () => {
    if (!token || paying || !selectedPlan?.priceId) {
      return;
    }

    setPaying(true);
    setError('');
    try {
      const checkout = await createPlanCheckout(token, selectedPlan.priceId);

      // Resolve quando o Stripe devolve o aluno ao app ou quando ele fecha
      // o navegador. Nos dois casos quem diz se a assinatura foi paga é o
      // backend, consultado pela tela de resultado.
      const result = await WebBrowser.openAuthSessionAsync(
        checkout.url,
        PLANS_RETURN_URL
      );

      // O aluno tocou em voltar no Checkout: nada foi pago, e ele continua
      // aqui para tentar de novo ou escolher outro plano
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
      // A conta já tem plano (assinou pelo site, por exemplo): a tela
      // recarrega e passa a mostrar "Seu plano"
      if (err instanceof ApiError && err.status === 409) {
        await reload();
        return;
      }
      setError(getErrorMessage(err, 'Não foi possível iniciar o pagamento.'));
    } finally {
      setPaying(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow pb-8">
        <PlansHero onClose={close} />

        <View className="flex-1 gap-8 px-5 pt-8">
          {loadError && !data ? (
            <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="font-poppins text-sm text-red-700">
                {loadError}
              </Text>
              <Button variant="link" label="Tentar de novo" onPress={refresh} />
            </View>
          ) : null}

          {data ? (
            <>
              {paidPlans.length > 0 ? (
                <View accessibilityRole="radiogroup" className="gap-5">
                  {paidPlans.map((plan) => (
                    <PlanCard
                      key={plan.tier}
                      plan={plan}
                      selected={plan.tier === selectedPlan?.tier}
                      current={plan.tier === data.currentTier}
                      disabled={hasEverything}
                      onPress={() => {
                        setPickedTier(plan.tier);
                        setError('');
                      }}
                    />
                  ))}
                </View>
              ) : null}

              <PlanComparison
                plans={data.plans}
                benefits={data.benefits}
                selectedTier={selectedPlan?.tier ?? data.currentTier}
              />
            </>
          ) : null}

          {!data && !loadError ? (
            <View className="flex-1 items-center justify-center py-12">
              <ActivityIndicator size="large" color={colors.green} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {data ? (
        <PlansFooter
          currentTier={data.currentTier}
          canSubscribe={data.canSubscribe}
          plan={selectedPlan}
          paying={paying}
          error={error}
          onSubscribe={subscribe}
          onTalkToTeacher={() => router.push('/teacher-chat')}
        />
      ) : null}
    </View>
  );
}
