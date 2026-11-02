import { t } from '@/lib/i18n';
import type { User } from '@/services/auth';
import type { Plan, PlanPrice, PlanTier } from '@/services/plans';
import { formatPrice } from '@/utils/privateLessons';

// Quem vê o botão "Seja Premium": só o aluno gratuito. Para as outras
// contas não há o que vender.
export function canSeePlans(user: User | null) {
  return user?.role === 'FREE_STUDENT';
}

// "US$ 49,90"
export function formatPlanPrice(price: PlanPrice) {
  return formatPrice({ unitAmount: price.amount, currency: price.currency });
}

// "/mês"
export function formatPlanInterval(interval: PlanPrice['interval']) {
  return interval === 'year'
    ? t('account.plans.perYearShort')
    : t('account.plans.perMonthShort');
}

// "por mês", para o leitor de tela
export function formatPlanIntervalLong(interval: PlanPrice['interval']) {
  return interval === 'year'
    ? t('account.plans.perYear')
    : t('account.plans.perMonth');
}

export function getTierName(tier: PlanTier) {
  return t(`account.plans.${tier}`);
}

// Planos que têm preço: os que aparecem como cartão
export function getPaidPlans(plans: Plan[]) {
  return plans.filter((plan) => plan.price !== null && plan.priceId !== null);
}

// Plano que vem escolhido: o destacado, ou o último, entre os que a conta
// ainda não tem. Sem nenhum, null.
export function getDefaultPlan(plans: Plan[], currentTier: PlanTier) {
  const available = getPaidPlans(plans).filter(
    (plan) => plan.tier !== currentTier
  );

  return (
    available.find((plan) => plan.highlighted) ??
    available[available.length - 1] ??
    null
  );
}
