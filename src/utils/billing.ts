import type {
  BillingCard,
  BillingPayment,
  BillingPaymentStatus,
  BillingSubscription,
} from '@/services/billing';
import { formatPlanInterval } from '@/utils/plans';
import { formatPrice } from '@/utils/privateLessons';

export type BadgeTone = 'green' | 'yellow' | 'red' | 'gray';

export interface Badge {
  label: string;
  tone: BadgeTone;
}

const SHORT_MONTHS = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

const PAYMENT_BADGES: Record<BillingPaymentStatus, Badge> = {
  paid: { label: 'Pago', tone: 'green' },
  pending: { label: 'Pendente', tone: 'yellow' },
  failed: { label: 'Falhou', tone: 'red' },
  refunded: { label: 'Reembolsado', tone: 'gray' },
};

const SUBSCRIPTION_BADGES: Record<string, Badge> = {
  active: { label: 'Ativa', tone: 'green' },
  trialing: { label: 'Em teste grátis', tone: 'green' },
  past_due: { label: 'Pagamento pendente', tone: 'yellow' },
  unpaid: { label: 'Pagamento pendente', tone: 'yellow' },
  incomplete: { label: 'Pagamento pendente', tone: 'yellow' },
  canceled: { label: 'Cancelada', tone: 'gray' },
  incomplete_expired: { label: 'Cancelada', tone: 'gray' },
  paused: { label: 'Pausada', tone: 'gray' },
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
  return `${date.getDate()} de ${SHORT_MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

// "US$ 89,90"
export function formatAmount(amount: number, currency: string) {
  return formatPrice({ unitAmount: amount, currency });
}

// "Assinatura Premium", "2 aulas particulares". Há um plano pago só, o
// Premium, então o nome da assinatura é fixo.
export function describePayment(payment: BillingPayment) {
  if (payment.type === 'subscription') {
    return 'Assinatura Premium';
  }
  const quantity = payment.quantity ?? 1;
  return quantity === 1
    ? '1 aula particular'
    : `${quantity} aulas particulares`;
}

export function getPaymentBadge(status: BillingPaymentStatus) {
  return PAYMENT_BADGES[status];
}

// Situação desconhecida aparece com o código do Stripe. Cancelada no fim do
// período continua "Ativa": o aluno tem acesso até lá, e a linha da data diz
// que foi cancelada.
export function getSubscriptionBadge(subscription: BillingSubscription): Badge {
  return (
    SUBSCRIPTION_BADGES[subscription.status] ?? {
      label: subscription.status,
      tone: 'gray',
    }
  );
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
    ? `Cancelada, com acesso até ${date}`
    : `Próxima cobrança em ${date}`;
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
  return `Validade ${month}/${year}`;
}
