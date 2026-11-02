// Procura texto de tela escrito direto no código: tudo o que aparece para o
// aluno fica em src/locales/. Termina com erro se achar algum.
//
// node scripts/check-translations.mjs
import fs from 'node:fs';
import path from 'node:path';

// Arquivos que não têm texto de tela, ou em que o texto fica de propósito
const IGNORED_DIRS = ['src/locales'];

// Textos que ficam no código, com o motivo
const ALLOWED = [
  // Os nomes dos idiomas vão no próprio idioma
  /^Português$/,
  /^Español$/,
  // A abertura de reserva da Gisa: ela sempre fala em português
  /^Oi, \$\{firstName\}! Eu sou a Gisa/,
  /^Oi! Eu sou a Gisa/,
];

const PORTUGUESE = /[áàâãéêíóôõúçÁÉÍÓÚÀÂÊÔÃÕÇ]/;
const COMMON_WORDS =
  /\b(aula|aulas|atividade|atividades|voltar|tentar|continuar|concluir|enviar|salvar|erro|resposta|respostas|verificar|ouvir|escreva|escolha|toque|sair|fechar|abrir|mais|sem|com|para|seu|sua)\b/i;
const CLASS_NAMES =
  /^(font-|flex|bg-|text-|h-|w-|gap-|absolute|rounded|border|mt-|mb-|px-|py-|p-|items-|@\/|\.\/)/;
const STRING = /(['"`])((?:(?!\1).)*)\1/g;
const BETWEEN_TAGS = />([^<>{}]+)</g;
const JSX_TEXT = /^[A-ZÁÉÍÓÚ][^<>{}=;'"`]*$/;

function walk(target) {
  if (IGNORED_DIRS.includes(target.split(path.sep).join('/'))) {
    return [];
  }
  if (!fs.statSync(target).isDirectory()) {
    return [target];
  }
  return fs
    .readdirSync(target)
    .flatMap((name) => walk(path.join(target, name)));
}

function isScreenText(text) {
  if (CLASS_NAMES.test(text) || ALLOWED.some((rule) => rule.test(text))) {
    return false;
  }
  return (
    PORTUGUESE.test(text) || (text.includes(' ') && COMMON_WORDS.test(text))
  );
}

function isCode(line) {
  return (
    !line ||
    line.startsWith('//') ||
    line.startsWith('*') ||
    line.startsWith('{/*') ||
    line.startsWith('import ') ||
    line.includes("t('") ||
    line.includes('t(`')
  );
}

const found = [];

for (const file of walk('src')) {
  if (!/\.tsx?$/.test(file)) {
    continue;
  }

  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (isCode(line)) {
      return;
    }

    const texts = [
      ...[...line.matchAll(STRING)].map((match) => match[2]),
      ...[...line.matchAll(BETWEEN_TAGS)].map((match) => match[1]),
      ...(JSX_TEXT.test(line) ? [line] : []),
    ];
    for (const text of texts) {
      if (isScreenText(text)) {
        found.push(`${file}:${index + 1}: ${text}`);
      }
    }
  });
}

for (const item of found) {
  console.log(item);
}
console.log(
  found.length
    ? `\n${found.length} textos fora de src/locales/`
    : 'Nenhum texto fora de src/locales/'
);
process.exit(found.length > 0 ? 1 : 0);
