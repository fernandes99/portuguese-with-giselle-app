import type { DayActivity } from '@/services/progress';

// Na ordem de Date.getDay(): 0 é domingo
const WEEKDAYS = [
  { short: 'dom.', full: 'domingo' },
  { short: 'seg.', full: 'segunda-feira' },
  { short: 'ter.', full: 'terça-feira' },
  { short: 'qua.', full: 'quarta-feira' },
  { short: 'qui.', full: 'quinta-feira' },
  { short: 'sex.', full: 'sexta-feira' },
  { short: 'sáb.', full: 'sábado' },
];

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
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

// "1 aula, 3 exercícios, 14 práticas", para o leitor de tela
export function formatDayActivity(day: DayActivity) {
  return [
    plural(day.lessons, 'aula', 'aulas'),
    plural(day.activities, 'exercício', 'exercícios'),
    plural(day.practices, 'prática', 'práticas'),
  ].join(', ');
}

// Instante em ISO para "12/10/2026", no fuso do aparelho
export function formatUnlockedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
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
