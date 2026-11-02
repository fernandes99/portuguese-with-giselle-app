import { t } from '@/lib/i18n';
import type {
  BillingCard,
  BillingPayment,
  BillingPaymentStatus,
  BillingSubscription,
} from '@/services/billing';
import { formatLongDate } from '@/utils/date';
import { formatPlanInterval } from '@/utils/plans';
import { formatPrice } from '@/utils/privateLessons';

export type BadgeTone = 'green' | 'yellow' | 'red' | 'gray';

export interface Badge {
  label: string;
  tone: BadgeTone;
}

const PAYMENT_TONES: Record<BillingPaymentStatus, BadgeTone> = {
  paid: 'green',
  pending: 'yellow',
  failed: 'red',
  refunded: 'gray',
};

type SubscriptionText =
  'active' | 'trialing' | 'pastDue' | 'canceled' | 'paused';

const SUBSCRIPTION_BADGES: Record<
  string,
  { text: SubscriptionText; tone: BadgeTone }
> = {
  active: { text: 'active', tone: 'green' },
  trialing: { text: 'trialing', tone: 'green' },
  past_due: { text: 'pastDue', tone: 'yellow' },
  unpaid: { text: 'pastDue', tone: 'yellow' },
  incomplete: { text: 'pastDue', tone: 'yellow' },
  canceled: { text: 'canceled', tone: 'gray' },
  incomplete_expired: { text: 'canceled', tone: 'gray' },
  paused: { text: 'paused', tone: 'gray' },
};

const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  elo: 'Elo',
  discover: 'Discover',
  diners: 'Diners',
  jcb: 'JCB',
};

// "14 de out. de 2026", no fuso do aparelho
export function formatBillingDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return formatLongDate(date);
}

// "US$ 89,90"
export function formatAmount(amount: number, currency: string) {
  return formatPrice({ unitAmount: amount, currency });
}

// "Assinatura Premium", "2 aulas particulares". Há um plano pago só, o
// Premium, então o nome da assinatura é fixo.
export function describePayment(payment: BillingPayment) {
  if (payment.type === 'subscription') {
    return t('account.billing.premiumSubscription');
  }
  const quantity = payment.quantity ?? 1;
  return t('account.billing.privateLessons', { count: quantity });
}

export function getPaymentBadge(status: BillingPaymentStatus) {
  return {
    label: t(`account.billing.paymentStatus.${status}`),
    tone: PAYMENT_TONES[status],
  };
}

// Situação desconhecida aparece com o código do Stripe. Cancelada no fim do
// período continua "Ativa": o aluno tem acesso até lá, e a linha da data diz
// que foi cancelada.
export function getSubscriptionBadge(subscription: BillingSubscription): Badge {
  const badge = SUBSCRIPTION_BADGES[subscription.status];
  if (!badge) {
    return { label: subscription.status, tone: 'gray' };
  }
  return {
    label: t(`account.billing.subscriptionStatus.${badge.text}`),
    tone: badge.tone,
  };
}

export function isSubscriptionEnded(subscription: BillingSubscription) {
  return (
    subscription.status === 'canceled' ||
    subscription.status === 'incomplete_expired'
  );
}

// "US$ 89,90/mês"
export function formatSubscriptionPrice(subscription: BillingSubscription) {
  return `${formatAmount(subscription.amount, subscription.currency)}${formatPlanInterval(subscription.interval === 'year' ? 'year' : 'month')}`;
}

// "Próxima cobrança em 14 de nov. de 2026" ou "Cancelada, com acesso até..."
export function formatSubscriptionDate(subscription: BillingSubscription) {
  const date = formatBillingDate(subscription.currentPeriodEnd);
  return subscription.cancelAtPeriodEnd
    ? t('account.billing.canceledUntil', { date })
    : t('account.billing.nextCharge', { date });
}

export function formatCardBrand(card: BillingCard) {
  return CARD_BRANDS[card.brand] ?? card.brand.toUpperCase();
}

// "Visa •••• 4242"
export function formatCardNumber(card: BillingCard) {
  return `${formatCardBrand(card)} •••• ${card.last4}`;
}

// "Validade 10/27"
export function formatCardExpiry(card: BillingCard) {
  const month = String(card.expMonth).padStart(2, '0');
  const year = String(card.expYear).slice(-2);
  return t('account.billing.expires', { date: `${month}/${year}` });
}
