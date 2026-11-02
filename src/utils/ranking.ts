import { getLocale, t } from '@/lib/i18n';

const TIME_ZONE = 'America/Sao_Paulo';

// 1621 → "1.621"
export function formatScore(score: number) {
  return score.toLocaleString(getLocale());
}

// 4 → "4º"
export function formatPosition(position: number) {
  return t('account.ranking.position', { position });
}

// O mês do ranking, no horário de Brasília: "De 01 a 31 out 2026". O fim que
// vem da rota é exclusivo (o primeiro instante do mês seguinte).
export function formatPeriod(
  periodStart: string | null,
  periodEnd: string | null
) {
  if (!periodStart || !periodEnd) {
    return t('account.ranking.allTime');
  }

  const start = new Date(periodStart);
  const end = new Date(new Date(periodEnd).getTime() - 1);
  const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(getLocale(), {
      timeZone: TIME_ZONE,
      ...options,
    }).format(date);
  // "out." vira "out"
  const month = part(end, { month: 'short' }).replace('.', '');

  return t('account.ranking.period', {
    start: part(start, { day: '2-digit' }),
    end: part(end, { day: '2-digit' }),
    month,
    year: part(end, { year: 'numeric' }),
  });
}
