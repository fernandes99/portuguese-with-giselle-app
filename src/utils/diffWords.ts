export interface DiffPart {
  text: string;
  // same: nas duas frases; removed: só na original; added: só na corrigida
  kind: 'same' | 'removed' | 'added';
}

// Compara a frase do aluno com a corrigida palavra por palavra (separadas
// por espaço, com a pontuação junto), sem diferenciar maiúsculas, pela maior
// sequência comum. Palavras vizinhas do mesmo tipo vêm juntas; numa troca, a
// removida vem antes da adicionada. O texto igual sai da corrigida. Sem
// imports, para ser testada com o Node direto.
export function diffWords(original: string, corrected: string): DiffPart[] {
  const from = original.split(/\s+/).filter(Boolean);
  const to = corrected.split(/\s+/).filter(Boolean);
  const a = from.map((word) => word.toLowerCase());
  const b = to.map((word) => word.toLowerCase());

  // common[i][j]: tamanho da maior sequência comum de a[i..] e b[j..]
  const common = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      common[i][j] =
        a[i] === b[j]
          ? common[i + 1][j + 1] + 1
          : Math.max(common[i + 1][j], common[i][j + 1]);
    }
  }

  const parts: DiffPart[] = [];
  function push(text: string, kind: DiffPart['kind']) {
    const previous = parts[parts.length - 1];
    if (previous?.kind === kind) {
      previous.text += ` ${text}`;
    } else {
      parts.push({ text, kind });
    }
  }

  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      push(to[j], 'same');
      i++;
      j++;
    } else if (
      i < a.length &&
      (j >= b.length || common[i + 1][j] >= common[i][j + 1])
    ) {
      push(from[i], 'removed');
      i++;
    } else {
      push(to[j], 'added');
      j++;
    }
  }

  return parts;
}
