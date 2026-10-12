import type { User } from '@/services/auth';
import { getFirstName } from '@/utils/format';

// A prática com IA é só para assinantes; o backend aplica a mesma regra
export function canUsePractice(user: User | null) {
  return !!user && user.role !== 'FREE_STUDENT';
}

// Primeira mensagem da Gisa, fixa e escrita no app
export function getOpeningMessage(name: string | null | undefined) {
  const firstName = getFirstName(name);

  return firstName
    ? `Olá, ${firstName}! Sou a Professora Gisa, e vamos usar esse chat para conversar e treinar seu Português. Me fala, ${firstName}, no que você trabalha ou estuda?`
    : 'Olá! Sou a Professora Gisa, e vamos usar esse chat para conversar e treinar seu Português. Me fala, no que você trabalha ou estuda?';
}

// A abertura em inglês, para o botão de traduzir
export function getOpeningTranslation(name: string | null | undefined) {
  const firstName = getFirstName(name);

  return firstName
    ? `Hi, ${firstName}! I'm Professora Gisa, and we'll use this chat to talk and practice your Portuguese. So tell me, ${firstName}, what do you do for work or study?`
    : `Hi! I'm Professora Gisa, and we'll use this chat to talk and practice your Portuguese. So tell me, what do you do for work or study?`;
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
