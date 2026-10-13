import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Plan, PlanBenefit, PlanTier } from '@/services/plans';

interface PlanComparisonProps {
  plans: Plan[];
  benefits: PlanBenefit[];
  // Coluna em destaque: o plano escolhido
  selectedTier: PlanTier | null;
}

// Largura fixa das colunas dos planos: os vistos ficam alinhados em
// qualquer largura de tela, e o texto do benefício ocupa o resto
const COLUMN_CLASS = 'w-[60px] items-center justify-center self-stretch py-3';

// Tabela "Compare os planos": uma linha por benefício, uma coluna por plano
export function PlanComparison({
  plans,
  benefits,
  selectedTier,
}: PlanComparisonProps) {
  const columnClass = (tier: PlanTier) =>
    `${COLUMN_CLASS} ${tier === selectedTier ? 'bg-green-50' : ''}`;

  return (
    <View className="gap-3">
      <Text
        accessibilityRole="header"
        className="font-poppins-bold text-lg text-gray-900"
      >
        Compare os planos
      </Text>

      <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <View className="flex-row items-center border-b border-gray-200">
          <View className="flex-1" />
          {plans.map((plan) => (
            <View key={plan.tier} className={columnClass(plan.tier)}>
              <Text
                numberOfLines={1}
                className={`font-poppins-semibold text-[11px] ${plan.tier === selectedTier ? 'text-green-700' : 'text-gray-600'}`}
              >
                {plan.name}
              </Text>
            </View>
          ))}
        </View>

        {benefits.map((benefit, index) => (
          <View
            key={benefit.id}
            className={`flex-row items-center ${index > 0 ? 'border-t border-gray-100' : ''}`}
          >
            <Text className="flex-1 py-3 pl-4 pr-2 font-poppins text-[13px] leading-5 text-gray-900">
              {benefit.label}
            </Text>
            {plans.map((plan) => {
              const included = benefit.tiers.includes(plan.tier);
              return (
                <View
                  key={plan.tier}
                  accessible
                  accessibilityLabel={`${plan.name}: ${included ? 'incluído' : 'não incluído'}`}
                  className={columnClass(plan.tier)}
                >
                  {included ? (
                    <Ionicons name="checkmark" size={20} color={colors.green} />
                  ) : (
                    <View className="h-0.5 w-3 rounded-full bg-gray-300" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
