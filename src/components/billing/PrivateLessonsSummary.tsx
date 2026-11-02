import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
        {t('practice.privateLessons.title')}
      </Text>
      <Text className="font-poppins-semibold text-base text-gray-900">
        {formatAvailable(balance)}
      </Text>
      <Button
        variant="outline"
        label={t('practice.privateLessons.buy')}
        onPress={onBuy}
      />
    </View>
  );
}
