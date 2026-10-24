const TIME_ZONE = 'America/Sao_Paulo';

// 1621 → "1.621"
export function formatScore(score: number) {
  return score.toLocaleString('pt-BR');
}

// 4 → "4º"
export function formatPosition(position: number) {
  return `${position}º`;
}

// O mês do ranking, no horário de Brasília: "De 01 a 31 out 2026". O fim que
// vem da rota é exclusivo (o primeiro instante do mês seguinte).
export function formatPeriod(
  periodStart: string | null,
  periodEnd: string | null
) {
  if (!periodStart || !periodEnd) {
    return 'Desde o início';
  }

  const start = new Date(periodStart);
  const end = new Date(new Date(periodEnd).getTime() - 1);
  const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: TIME_ZONE,
      ...options,
    }).format(date);
  // "out." vira "out"
  const month = part(end, { month: 'short' }).replace('.', '');

  return `De ${part(start, { day: '2-digit' })} a ${part(end, {
    day: '2-digit',
  })} ${month} ${part(end, { year: 'numeric' })}`;
}
