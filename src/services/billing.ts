import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Contrato em .specs/billing/architecture.md (o mesmo do site)

export interface BillingSubscription {
  id: string;
  // active, trialing, past_due, unpaid, canceled, incomplete,
  // incomplete_expired, paused
  status: string;
  planName: string;
  // Em centavos
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface BillingCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export type BillingPaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface BillingPayment {
  id: string;
  type: 'subscription' | 'private_lessons';
  // Aulas compradas; null na assinatura
  quantity: number | null;
  // Em centavos, na moeda cobrada
  amount: number;
  currency: string;
  status: BillingPaymentStatus;
  date: string;
  receiptUrl: string | null;
}

export interface BillingOverview {
  subscription: BillingSubscription | null;
  card: BillingCard | null;
  privateLessons: { balance: number };
  // Do mais novo para o mais antigo
  payments: BillingPayment[];
  // O portal de pagamentos pode ser aberto
  canManage: boolean;
}

export function getBilling(token: string) {
  return api<BillingOverview>(API_ROUTES.billing, { token });
}

// Endereço do portal de pagamentos do Stripe
export function createBillingPortal(token: string) {
  return api<{ url: string }>(API_ROUTES.billingPortal, {
    method: 'POST',
    token,
  });
}
