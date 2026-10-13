import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import type { Plan, PlanTier } from '@/services/plans';

interface PlansFooterProps {
  currentTier: PlanTier;
  canSubscribe: boolean;
  // Plano escolhido; null quando não há o que escolher
  plan: Plan | null;
  paying: boolean;
  error: string;
  onSubscribe: () => void;
  onTalkToTeacher: () => void;
}

function Note({ children }: { children: string }) {
  return (
    <Text className="text-center font-poppins text-sm leading-5 text-gray-600">
      {children}
    </Text>
  );
}

// Rodapé da tela de planos, preso embaixo: assinar, falar com a professora
// (quem já é Básico) ou só o aviso de que a conta já tem tudo
export function PlansFooter({
  currentTier,
  canSubscribe,
  plan,
  paying,
  error,
  onSubscribe,
  onTalkToTeacher,
}: PlansFooterProps) {
  const insets = useSafeAreaInsets();

  let content = <Note>Você já tem o plano mais completo.</Note>;

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
          label={`Assinar o ${plan.name}`}
          loading={paying}
          onPress={onSubscribe}
        />
        <Text className="text-center font-poppins text-xs text-gray-500">
          Pagamento seguro pelo Stripe. Cancele quando quiser.
        </Text>
      </>
    );
  } else if (canSubscribe) {
    content = <Note>Os planos não estão disponíveis no momento.</Note>;
  } else if (currentTier === 'basic' && plan) {
    content = (
      <>
        <Note>{`Para mudar para o ${plan.name}, fale com a professora.`}</Note>
        <Button
          size="lg"
          label="Falar com a professora"
          onPress={onTalkToTeacher}
        />
      </>
    );
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
