export type SentencePart =
  | { type: 'text'; text: string }
  | { type: 'blank'; index: number; answer: string };

// Pedaço de texto de uma frase: palavra comum, termo com tradução ou quebra
// de linha. "bold" vem da marcação **negrito** do CMS.
export type TextToken =
  | { type: 'word'; text: string; bold: boolean }
  | { type: 'tip'; text: string; tip: string; bold: boolean }
  | { type: 'break' };

const BLANK_REGEX = /\{\{(.*?)\}\}/g;
// Mesma sintaxe de tooltip do site: \\termo==tradução\\
const TIP_REGEX = /\\\\(.*?)==(.*?)\\\\/g;
const BOLD_MARKER = '**';

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

// O CMS às vezes manda HTML nas frases; no app elas são texto simples
function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity] ?? entity);
}

// Divide "Eu {{sou}} estudante" em texto, lacuna e texto. Mesma sintaxe das
// atividades de preencher e de arrastar do site. Quebras de linha seguidas
// viram uma só, e as das pontas saem.
export function parseSentence(sentence: string): SentencePart[] {
  const clean = sentence
    .replace(/\r/g, '')
    .trim()
    .replace(/\n\s*\n/g, '\n');
  const parts: SentencePart[] = [];
  let lastIndex = 0;
  let blankIndex = 0;

  for (const match of clean.matchAll(BLANK_REGEX)) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: stripHtml(clean.slice(lastIndex, match.index)),
      });
    }

    parts.push({ type: 'blank', index: blankIndex++, answer: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < clean.length) {
    parts.push({ type: 'text', text: stripHtml(clean.slice(lastIndex)) });
  }

  return parts;
}

function toWords(text: string, bold: boolean): TextToken[] {
  return text
    .split(/[ \t]+/)
    .filter(Boolean)
    .map((word) => ({ type: 'word', text: word, bold }));
}

// Um trecho sem quebra de linha e com o mesmo peso
function tokenizeRun(text: string, bold: boolean): TextToken[] {
  const tokens: TextToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TIP_REGEX)) {
    tokens.push(...toWords(text.slice(lastIndex, match.index), bold));
    tokens.push({
      type: 'tip',
      text: match[1].trim(),
      tip: match[2].trim(),
      bold,
    });
    lastIndex = match.index + match[0].length;
  }

  tokens.push(...toWords(text.slice(lastIndex), bold));
  return tokens;
}

// Quebra o texto em palavras, para a frase poder quebrar de linha em volta
// das lacunas, mantendo cada termo com tradução inteiro. O negrito é contado
// dentro do trecho: um ** que abre numa parte e fecha em outra não vale.
export function tokenizeText(text: string): TextToken[] {
  const tokens: TextToken[] = [];

  text.split('\n').forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      tokens.push({ type: 'break' });
    }

    line.split(BOLD_MARKER).forEach((run, runIndex) => {
      tokens.push(...tokenizeRun(run, runIndex % 2 === 1));
    });
  });

  return tokens;
}

// Texto corrido sem marcação: "\\irmã==sister\\" vira "irmã", o negrito sai
// e as quebras de linha viram espaço
export function toPlainText(text: string) {
  return text
    .replace(TIP_REGEX, '$1')
    .replaceAll(BOLD_MARKER, '')
    .replace(/\s+/g, ' ');
}

export function getAnswers(parts: SentencePart[]) {
  return parts.flatMap((part) => (part.type === 'blank' ? [part.answer] : []));
}

// Como no site: ignora maiúsculas e espaços nas pontas, mas não acentos
export function isSameAnswer(
  given: string | null | undefined,
  expected: string
) {
  return (given ?? '').trim().toLowerCase() === expected.trim().toLowerCase();
}
