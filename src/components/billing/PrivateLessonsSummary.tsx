import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatAvailable } from '@/utils/privateLessons';

interface PrivateLessonsSummaryProps {
  balance: number;
  onBuy: () => void;
}

// Bloco das aulas particulares: o saldo e o atalho para comprar mais
export function PrivateLessonsSummary({
  balance,
  onBuy,
}: PrivateLessonsSummaryProps) {
  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
        Aulas particulares
      </Text>
      <Text className="font-poppins-semibold text-base text-gray-900">
        {formatAvailable(balance)}
      </Text>
      <Button variant="outline" label="Comprar aulas" onPress={onBuy} />
    </View>
  );
}
