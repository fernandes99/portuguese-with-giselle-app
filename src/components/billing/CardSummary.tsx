import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { BillingCard } from '@/services/billing';
import { formatCardExpiry, formatCardNumber } from '@/utils/billing';

// Bloco do cartão salvo: bandeira, final e validade
export function CardSummary({ card }: { card: BillingCard }) {
  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
        Cartão
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-50">
          <Ionicons name="card-outline" size={20} color={colors.green} />
        </View>
        <View className="flex-1">
          <Text className="font-poppins-semibold text-base text-gray-900">
            {formatCardNumber(card)}
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            {formatCardExpiry(card)}
          </Text>
        </View>
      </View>
    </View>
  );
}
