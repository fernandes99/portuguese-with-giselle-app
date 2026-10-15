import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import type { BillingSubscription } from '@/services/billing';
import {
  formatSubscriptionDate,
  formatSubscriptionPrice,
  getSubscriptionBadge,
  isSubscriptionEnded,
} from '@/utils/billing';

import { StatusBadge } from './StatusBadge';

interface SubscriptionCardProps {
  subscription: BillingSubscription | null;
  // O portal de pagamentos pode ser aberto
  canManage: boolean;
  // O aluno pode ver a tela de planos (conta gratuita)
  canSeePlans: boolean;
  managing: boolean;
  manageError: string;
  onManage: () => void;
  onSeePlans: () => void;
}

// Bloco da assinatura: plano, situação, valor e a próxima cobrança (ou o
// fim), com o atalho para o portal do Stripe
export function SubscriptionCard({
  subscription,
  canManage,
  canSeePlans,
  managing,
  manageError,
  onManage,
  onSeePlans,
}: SubscriptionCardProps) {
  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
        Assinatura
      </Text>

      {subscription ? (
        <>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 font-poppins-bold text-lg text-gray-900">
              {subscription.planName}
            </Text>
            <StatusBadge badge={getSubscriptionBadge(subscription)} />
          </View>

          {isSubscriptionEnded(subscription) ? null : (
            <View className="gap-0.5">
              <Text className="font-poppins-semibold text-base text-gray-900">
                {formatSubscriptionPrice(subscription)}
              </Text>
              <Text className="font-poppins text-sm text-gray-600">
                {formatSubscriptionDate(subscription)}
              </Text>
            </View>
          )}

          {canManage ? (
            <View className="gap-2">
              <Button
                variant="outline"
                label="Gerenciar assinatura"
                loading={managing}
                onPress={onManage}
                accessibilityLabel="Gerenciar assinatura, abre o portal de pagamentos"
              />
              {manageError ? (
                <Text className="font-poppins text-sm text-red-700">
                  {manageError}
                </Text>
              ) : null}
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text className="font-poppins text-base text-gray-700">
            Você está no plano gratuito.
          </Text>
          {canSeePlans ? (
            <Button label="Ver planos" onPress={onSeePlans} />
          ) : null}
        </>
      )}
    </View>
  );
}
