import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import type { Plan } from '@/services/plans';

interface PlansFooterProps {
  canSubscribe: boolean;
  // Plano escolhido; null quando não há o que escolher
  plan: Plan | null;
  paying: boolean;
  error: string;
  onSubscribe: () => void;
}

function Note({ children }: { children: string }) {
  return (
    <Text className="text-center font-poppins text-sm leading-5 text-gray-600">
      {children}
    </Text>
  );
}

// Rodapé da tela de planos, preso embaixo: assinar ou só o aviso de que a
// conta já tem o plano
export function PlansFooter({
  canSubscribe,
  plan,
  paying,
  error,
  onSubscribe,
}: PlansFooterProps) {
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  let content = <Note>{t('account.plans.hasPremium')}</Note>;

  if (canSubscribe && plan) {
    content = (
      <>
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
          label={t('account.plans.subscribe', { plan: plan.name })}
          loading={paying}
          onPress={onSubscribe}
        />
        <Text className="text-center font-poppins text-xs text-gray-500">
          {t('account.plans.secure')}
        </Text>
      </>
    );
  } else if (canSubscribe) {
    content = <Note>{t('account.plans.unavailable')}</Note>;
  }

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      className="gap-2 border-t border-gray-200 bg-white px-5 pt-3"
    >
      {content}
    </View>
  );
}
