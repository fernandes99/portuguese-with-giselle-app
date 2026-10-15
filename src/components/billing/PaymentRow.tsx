import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { BillingPayment } from '@/services/billing';
import {
  describePayment,
  formatAmount,
  formatBillingDate,
  getPaymentBadge,
} from '@/utils/billing';

import { StatusBadge } from './StatusBadge';

interface PaymentRowProps {
  payment: BillingPayment;
  onOpenReceipt: (url: string) => void;
}

// Uma linha do histórico. Com recibo, o toque abre o recibo do Stripe.
export function PaymentRow({ payment, onOpenReceipt }: PaymentRowProps) {
  const description = describePayment(payment);
  const date = formatBillingDate(payment.date);
  const amount = formatAmount(payment.amount, payment.currency);
  const badge = getPaymentBadge(payment.status);
  const { receiptUrl } = payment;

  const content = (
    <>
      <View className="flex-1 gap-1">
        <Text className="font-poppins-semibold text-sm text-gray-900">
          {description}
        </Text>
        <Text className="font-poppins text-xs text-gray-500">{date}</Text>
      </View>
      <View className="items-end gap-1">
        <Text className="font-poppins-semibold text-sm text-gray-900">
          {amount}
        </Text>
        <StatusBadge badge={badge} />
      </View>
      {receiptUrl ? (
        <Ionicons name="open-outline" size={16} color={colors.gray} />
      ) : null}
    </>
  );

  const label = `${description}, ${date}, ${amount}, ${badge.label}`;
  const className =
    'flex-row items-center gap-3 border-b border-gray-100 px-4 py-3';

  if (!receiptUrl) {
    return (
      <View accessible accessibilityLabel={label} className={className}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Abre o recibo"
      onPress={() => onOpenReceipt(receiptUrl)}
      className={`${className} active:bg-gray-50`}
    >
      {content}
    </Pressable>
  );
}
