import { t } from '@/lib/i18n';
import { formatShortDate } from '@/utils/date';
import type { DayActivity } from '@/services/progress';

// Na ordem de Date.getDay(): 0 é domingo
const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

// Fuso do aparelho, enviado ao backend para ele contar os dias
export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// `date` é um dia pronto (AAAA-MM-DD). Montar a data pelas partes evita a
// conversão de fuso de `new Date('AAAA-MM-DD')`, que o trata como UTC.
export function getWeekday(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return {
    short: t(`account.time.weekdaysShort.${weekday}`),
    full: t(`account.time.weekdaysFull.${weekday}`),
  };
}

// "1 aula, 3 exercícios, 14 práticas", para o leitor de tela
export function formatDayActivity(day: DayActivity) {
  return [
    t('common.lessons', { count: day.lessons }),
    t('account.progress.exercises', { count: day.activities }),
    t('account.progress.practices', { count: day.practices }),
  ].join(', ');
}

// Instante em ISO para "12/10/2026", no fuso do aparelho
export function formatUnlockedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatShortDate(date);
}

// Menor barra de um dia com alguma atividade, para ela não sumir ao lado
// de um dia muito maior
const MIN_BAR_HEIGHT = 4;

export interface ChartBar extends DayActivity {
  total: number;
  // Altura da barra inteira; as partes a dividem na proporção dos valores
  height: number;
}

// O dia de maior total ocupa `maxHeight`; os outros são proporcionais
export function getChartBars(
  activity: DayActivity[],
  maxHeight: number
): ChartBar[] {
  const totals = activity.map(
    (day) => day.lessons + day.activities + day.practices
  );
  const highest = Math.max(0, ...totals);

  return activity.map((day, index) => {
    const total = totals[index];

    return {
      ...day,
      total,
      height:
        total > 0
          ? Math.max(MIN_BAR_HEIGHT, Math.round((total / highest) * maxHeight))
          : 0,
    };
  });
}
