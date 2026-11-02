import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { formatAvailable, formatAvailableLabel } from '@/utils/privateLessons';

interface BalanceCardProps {
  available: number;
  // "US$ 25,00"
  price: string;
  onBuy: () => void;
}

// Saldo de aulas particulares e, no mesmo cartão, a compra de mais aulas.
// Sem saldo, comprar é a ação principal da tela.
export function BalanceCard({ available, price, onBuy }: BalanceCardProps) {
  const { t } = useTranslation();

  const isEmpty = available === 0;

  return (
    <View className="rounded-2xl border border-gray-200 bg-white">
      <View
        accessible
        accessibilityLabel={formatAvailable(available)}
        className="items-center gap-1 px-5 pb-5 pt-6"
      >
        <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
          {t('practice.privateLessons.balance')}
        </Text>
        <Text
          className={`font-poppins-bold text-6xl ${isEmpty ? 'text-gray-400' : 'text-green-700'}`}
        >
          {available}
        </Text>
        <Text className="font-poppins-medium text-base text-gray-700">
          {formatAvailableLabel(available)}
        </Text>
        {isEmpty ? (
          <Text className="mt-1 text-center font-poppins text-sm text-gray-600">
            {t('practice.privateLessons.buyToSchedule')}
          </Text>
        ) : null}
      </View>

      <View className="gap-3 border-t border-gray-200 px-5 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-poppins text-sm text-gray-600">
            {t('practice.privateLessons.liveLesson')}
          </Text>
          <Text className="font-poppins-semibold text-sm text-gray-900">
            {price} por aula
          </Text>
        </View>
        <Button
          variant={isEmpty ? 'primary' : 'outline'}
          label={t(
            isEmpty
              ? 'practice.privateLessons.buy'
              : 'practice.privateLessons.buyMore'
          )}
          onPress={onBuy}
        />
      </View>
    </View>
  );
}
