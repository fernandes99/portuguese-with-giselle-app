import type { LessonPrice, PrivateLesson } from '@/services/privateLessons';

const CURRENCY_SYMBOLS: Record<string, string> = { usd: 'US$' };

const WEEKDAYS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const HOUR_MS = 60 * 60 * 1000;

// Preço de `quantity` aulas: "US$ 75,00"
export function formatPrice(price: LessonPrice, quantity = 1) {
  const cents = price.unitAmount * quantity;
  const whole = Math.floor(cents / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const fraction = String(cents % 100).padStart(2, '0');
  const symbol =
    CURRENCY_SYMBOLS[price.currency.toLowerCase()] ??
    price.currency.toUpperCase();

  return `${symbol} ${whole},${fraction}`;
}

export function formatLessons(count: number) {
  return `${count} ${count === 1 ? 'aula' : 'aulas'}`;
}

// Texto que acompanha o número do saldo
export function formatAvailableLabel(count: number) {
  return count === 1 ? 'aula disponível' : 'aulas disponíveis';
}

// Saldo por extenso, para o leitor de tela
export function formatAvailable(count: number) {
  return count === 0
    ? 'Nenhuma aula disponível'
    : `${count} ${formatAvailableLabel(count)}`;
}

// "3 aulas adicionadas à sua conta."
export function formatAddedLessons(count: number) {
  return count === 1
    ? '1 aula adicionada à sua conta.'
    : `${count} aulas adicionadas à sua conta.`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Dia da aula no fuso do aparelho: "terça, 20 de outubro". Hoje e amanhã
// aparecem pelo nome: "Hoje, 20 de outubro".
export function formatLessonDate(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  let day = WEEKDAYS[date.getDay()];
  if (isSameDay(date, now)) {
    day = 'Hoje';
  } else if (isSameDay(date, tomorrow)) {
    day = 'Amanhã';
  }

  return `${day}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

function formatTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Horário da aula no fuso do aparelho: "14:00 – 14:50"
export function formatLessonTime(lesson: PrivateLesson) {
  return `${formatTime(new Date(lesson.startTime))} – ${formatTime(new Date(lesson.endTime))}`;
}

// Dia e horário numa frase, para o assunto do email e o leitor de tela
export function formatLessonMoment(lesson: PrivateLesson, now = new Date()) {
  return `${formatLessonDate(lesson.startTime, now)}, ${formatTime(new Date(lesson.startTime))}`;
}

// A aula já começou e ainda não terminou
export function isLessonNow(lesson: PrivateLesson, now = new Date()) {
  const time = now.getTime();
  return (
    lesson.status === 'scheduled' &&
    new Date(lesson.startTime).getTime() <= time &&
    new Date(lesson.endTime).getTime() > time
  );
}

// Se o aluno ainda pode remarcar ou cancelar pelo app. O backend já diz
// isso em `canChange`; o relógio do aparelho confere de novo, porque a tela
// pode estar aberta há horas.
export function canChangeLesson(
  lesson: PrivateLesson,
  changeNoticeHours: number,
  now = new Date()
) {
  return (
    lesson.canChange &&
    new Date(lesson.startTime).getTime() - now.getTime() >=
      changeNoticeHours * HOUR_MS
  );
}
