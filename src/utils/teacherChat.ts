import type { User } from '@/services/auth';

const MONTHS = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

// O chat com a professora só não vale para o aluno gratuito; o backend
// aplica a mesma regra. Contas da equipe também podem escrever por aqui.
export function canUseTeacherChat(user: User | null) {
  return !!user && user.role !== 'FREE_STUDENT';
}

// Contador de não lidas, como aparece no Perfil e na aba
export function formatUnread(count: number) {
  return count > 9 ? '9+' : String(count);
}

// Hora da mensagem no fuso do aparelho: "14:05"
export function formatMessageTime(isoDate: string) {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// Data que abre cada dia da conversa: "Hoje", "Ontem" ou "12 de out."
export function formatDayLabel(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return 'Hoje';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  }

  const label = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear()
    ? label
    : `${label} de ${date.getFullYear()}`;
}
