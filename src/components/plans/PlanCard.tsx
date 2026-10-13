import { Pressable, Text, View } from 'react-native';

import type { Plan } from '@/services/plans';
import {
  formatPlanInterval,
  formatPlanIntervalLong,
  formatPlanPrice,
} from '@/utils/plans';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  // O plano que a conta já tem: mostra "Seu plano" e não pode ser escolhido
  current: boolean;
  // Nada pode ser escolhido (a conta já tem o plano mais completo)
  disabled: boolean;
  onPress: () => void;
}

function Tag({ label, strong }: { label: string; strong: boolean }) {
  return (
    <View
      className={`absolute -top-3 right-4 rounded-full px-3 py-1 ${strong ? 'bg-green-600' : 'bg-gray-200'}`}
    >
      <Text
        style={{ includeFontPadding: false }}
        className={`font-poppins-semibold text-[11px] leading-4 ${strong ? 'text-white' : 'text-gray-700'}`}
      >
        {label}
      </Text>
    </View>
  );
}

// Um plano pago, como opção de escolha única
export function PlanCard({
  plan,
  selected,
  current,
  disabled,
  onPress,
}: PlanCardProps) {
  if (!plan.price) {
    return null;
  }

  const price = formatPlanPrice(plan.price);
  const isLocked = current || disabled;

  let tag: string | null = null;
  if (current) {
    tag = 'Seu plano';
  } else if (plan.highlighted) {
    tag = 'Mais completo';
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: isLocked }}
      accessibilityLabel={`${plan.name}, ${price} ${formatPlanIntervalLong(plan.price.interval)}. ${plan.tagline}${tag ? `. ${tag}` : ''}`}
      onPress={onPress}
      disabled={isLocked}
      className={`flex-row items-center gap-3 rounded-2xl border-2 bg-white p-4 ${selected ? 'border-green-600' : 'border-gray-200'} ${current ? 'opacity-70' : 'active:bg-gray-50'}`}
    >
      {tag ? <Tag label={tag} strong={!current} /> : null}

      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-green-600' : 'border-gray-300'}`}
      >
        {selected ? (
          <View className="h-3 w-3 rounded-full bg-green-600" />
        ) : null}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-poppins-bold text-lg text-gray-900">
          {plan.name}
        </Text>
        <Text className="font-poppins text-[13px] leading-5 text-gray-600">
          {plan.tagline}
        </Text>
      </View>

      <View className="items-end">
        <Text className="font-poppins-bold text-xl text-gray-900">{price}</Text>
        <Text className="font-poppins text-xs text-gray-500">
          {formatPlanInterval(plan.price.interval)}
        </Text>
      </View>
    </Pressable>
  );
}
