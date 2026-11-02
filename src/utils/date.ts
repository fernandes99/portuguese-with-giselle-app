import { getLocale, t } from '@/lib/i18n';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

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

function getShortMonth(date: Date) {
  return t(`account.time.monthsShort.${MONTHS[date.getMonth()]}`);
}

// "14 de out. de 2026", no formato do idioma do app
export function formatLongDate(date: Date) {
  return t('account.time.dateLong', {
    day: date.getDate(),
    month: getShortMonth(date),
    year: date.getFullYear(),
  });
}

// "14 de out.", no formato do idioma do app
export function formatDayMonth(date: Date) {
  return t('account.time.dayMonth', {
    day: date.getDate(),
    month: getShortMonth(date),
  });
}

// "12/10/2026", na ordem do idioma do app
export function formatShortDate(date: Date) {
  return date.toLocaleDateString(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// "Agora", "Há 5 min", "Há 2 horas", "Há 3 dias" e, depois de um mês, a data
export function formatTimeAgo(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const seconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);

  if (seconds < MINUTE) return t('account.time.now');
  if (seconds < HOUR) {
    return t('account.time.minutes', { count: Math.floor(seconds / MINUTE) });
  }
  if (seconds < DAY) {
    return t('account.time.hours', { count: Math.floor(seconds / HOUR) });
  }
  if (seconds < 30 * DAY) {
    return t('account.time.days', { count: Math.floor(seconds / DAY) });
  }

  return formatShortDate(date);
}

// Instante em ISO para "12/10/2026 16:33", no fuso do aparelho
export function formatDateTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  return `${formatShortDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
