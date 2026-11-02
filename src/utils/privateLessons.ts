import { getLocale, t } from '@/lib/i18n';
import type { LessonPrice, PrivateLesson } from '@/services/privateLessons';

const CURRENCY_SYMBOLS: Record<string, string> = { usd: 'US$' };

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;
const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

const HOUR_MS = 60 * 60 * 1000;

// Preço de `quantity` aulas: "US$ 75,00", no formato do idioma do app
export function formatPrice(price: LessonPrice, quantity = 1) {
  const cents = price.unitAmount * quantity;
  const amount = (cents / 100).toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol =
    CURRENCY_SYMBOLS[price.currency.toLowerCase()] ??
    price.currency.toUpperCase();

  return `${symbol} ${amount}`;
}

export function formatLessons(count: number) {
  return t('common.lessons', { count });
}

// Texto que acompanha o número do saldo
export function formatAvailableLabel(count: number) {
  return t('practice.privateLessons.available', { count });
}

// Saldo por extenso, para o leitor de tela
export function formatAvailable(count: number) {
  return count === 0
    ? t('practice.privateLessons.noneAvailable')
    : `${count} ${formatAvailableLabel(count)}`;
}

// "3 aulas adicionadas à sua conta."
export function formatAddedLessons(count: number) {
  return t('practice.privateLessons.added', { count });
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

  let day: string = t(
    `practice.privateLessons.weekdays.${WEEKDAYS[date.getDay()]}`
  );
  if (isSameDay(date, now)) {
    day = t('practice.privateLessons.today');
  } else if (isSameDay(date, tomorrow)) {
    day = t('practice.privateLessons.tomorrow');
  }

  return t('practice.privateLessons.date', {
    day,
    date: date.getDate(),
    month: t(`practice.privateLessons.months.${MONTHS[date.getMonth()]}`),
  });
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
