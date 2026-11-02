import { t } from '@/lib/i18n';
import type { User } from '@/services/auth';
import type { ExplanationLanguage } from '@/services/preferences';
import { getFirstName } from '@/utils/format';

// A prática com IA é só para assinantes; o backend aplica a mesma regra
export function canUsePractice(user: User | null) {
  return !!user && user.role !== 'FREE_STUDENT';
}

// Abertura de reserva, para quando o backend não gera a abertura (sem
// conexão ou erro). A abertura normal vem de /api/mobile/practice/opening.
export function getOpeningMessage(name: string | null | undefined) {
  const firstName = getFirstName(name);

  return firstName
    ? `Oi, ${firstName}! Eu sou a Gisa, sua parceira de conversação com IA aqui no Portuguese with Giselle. Me conta um pouco de você: no que você trabalha ou estuda?`
    : 'Oi! Eu sou a Gisa, sua parceira de conversação com IA aqui no Portuguese with Giselle. Me conta um pouco de você: no que você trabalha ou estuda?';
}

// A abertura de reserva no idioma do app, para o botão de traduzir
export function getOpeningTranslation(name: string | null | undefined) {
  const firstName = getFirstName(name);

  return firstName
    ? t('practice.chat.openingTranslationName', { name: firstName })
    : t('practice.chat.openingTranslation');
}

export interface TextPart {
  text: string;
  isMistake: boolean;
}

// Divide a mensagem do aluno em partes, marcando os trechos errados.
// Trecho que não está no texto é ignorado, e nenhuma parte é marcada
// duas vezes.
export function splitByMistakes(text: string, mistakes: string[]): TextPart[] {
  const lower = text.toLowerCase();
  const ranges: { start: number; end: number }[] = [];

  for (const mistake of mistakes) {
    const needle = mistake.trim().toLowerCase();
    if (!needle) {
      continue;
    }

    let start = lower.indexOf(needle);
    while (start !== -1) {
      const end = start + needle.length;
      if (!ranges.some((range) => start < range.end && end > range.start)) {
        ranges.push({ start, end });
        break;
      }
      start = lower.indexOf(needle, start + 1);
    }
  }

  ranges.sort((a, b) => a.start - b.start);

  const parts: TextPart[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      parts.push({ text: text.slice(cursor, range.start), isMistake: false });
    }
    parts.push({ text: text.slice(range.start, range.end), isMistake: true });
    cursor = range.end;
  }
  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), isMistake: false });
  }

  return parts;
}

// Nome de cada idioma das explicações no aviso de troca, como na escolha
export const EXPLANATION_LANGUAGE_TITLES: Record<ExplanationLanguage, string> =
  {
    ENGLISH: 'English',
    SPANISH: 'Español',
    PORTUGUESE: 'Português',
  };

// Com tão poucas mensagens restantes no dia, o chat avisa o aluno
export const REMAINING_WARNING_AT = 10;

export function getRemainingLabel(remaining: number) {
  if (remaining <= 0) {
    return t('practice.chat.noMessagesLeft');
  }
  return t('practice.chat.messagesLeft', { count: remaining });
}
