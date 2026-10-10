export type SentencePart =
  | { type: 'text'; text: string }
  | { type: 'blank'; index: number; answer: string };

const BLANK_REGEX = /\{\{(.*?)\}\}/g;

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
// atividades de preencher e de arrastar do site.
export function parseSentence(sentence: string): SentencePart[] {
  const parts: SentencePart[] = [];
  let lastIndex = 0;
  let blankIndex = 0;

  for (const match of sentence.matchAll(BLANK_REGEX)) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: stripHtml(sentence.slice(lastIndex, match.index)),
      });
    }

    parts.push({ type: 'blank', index: blankIndex++, answer: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < sentence.length) {
    parts.push({ type: 'text', text: stripHtml(sentence.slice(lastIndex)) });
  }

  return parts;
}

export function getAnswers(parts: SentencePart[]) {
  return parts.flatMap((part) => (part.type === 'blank' ? [part.answer] : []));
}

// Como no site: ignora maiúsculas e espaços nas pontas, mas não acentos
export function isSameAnswer(given: string | undefined, expected: string) {
  return (given ?? '').trim().toLowerCase() === expected.trim().toLowerCase();
}
