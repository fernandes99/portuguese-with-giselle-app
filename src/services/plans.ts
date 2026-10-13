import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Nível da conta: é como o backend traduz a role para a tela de planos
export type PlanTier = 'free' | 'basic' | 'premium';

export interface PlanPrice {
  // Em centavos
  amount: number;
  currency: string;
  interval: 'month' | 'year';
}

export interface Plan {
  tier: PlanTier;
  name: string;
  tagline: string;
  // null no nível gratuito
  price: PlanPrice | null;
  priceId: string | null;
  highlighted: boolean;
}

export interface PlanBenefit {
  id: string;
  label: string;
  // Níveis que têm o benefício
  tiers: PlanTier[];
}

export interface Plans {
  currentTier: PlanTier;
  // Só o aluno gratuito assina pelo app
  canSubscribe: boolean;
  plans: Plan[];
  benefits: PlanBenefit[];
}

export interface PlanCheckout {
  url: string;
  sessionId: string;
}

// paid: paga e ativada; pending: ainda sem pagamento; expired: abandonada
export interface PlanCheckoutStatus {
  status: 'paid' | 'pending' | 'expired';
  tier: PlanTier;
}

export function getPlans(token: string) {
  return api<Plans>(API_ROUTES.plans, { token });
}

// Link de pagamento do Stripe para o plano escolhido
export function createPlanCheckout(token: string, priceId: string) {
  return api<PlanCheckout>(API_ROUTES.plansCheckout, {
    method: 'POST',
    body: { priceId },
    token,
  });
}

export function getPlanCheckoutStatus(token: string, sessionId: string) {
  return api<PlanCheckoutStatus>(API_ROUTES.planCheckoutStatus(sessionId), {
    token,
  });
}
