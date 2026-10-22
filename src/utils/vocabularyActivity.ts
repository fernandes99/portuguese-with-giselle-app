import type { VocabularyQuestion } from '@/services/lesson';

// Regras da atividade de vocabulário. As perguntas chegam prontas do site; o
// app só confere a resposta digitada e controla a fila. As funções repetem as
// de src/services/vocabularyActivities/ do site, com as mesmas regras.

// Sem maiúsculas, acentos e pontuação, com os espaços juntos: "Pão-duro!" e
// "pao duro" valem o mesmo
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAcceptedAnswer(
  question: Extract<VocabularyQuestion, { kind: 'write' }>,
  typed: string
): boolean {
  const normalized = normalizeAnswer(typed);
  return normalized !== '' && question.acceptedAnswers.includes(normalized);
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Reordena as opções de uma pergunta de escolha; as outras voltam iguais
export function shuffleOptions(
  question: VocabularyQuestion,
  random: () => number = Math.random
): VocabularyQuestion {
  if (question.kind !== 'choice') {
    return question;
  }
  return { ...question, options: shuffle(question.options, random) };
}

// Fila: a errada volta para o fim até ser acertada, e a atividade acaba
// quando a fila esvazia
export interface VocabularyQueue {
  // A primeira é a pergunta da tela
  pending: VocabularyQuestion[];
  // Itens da atividade: um grupo de pares conta um item por par
  total: number;
  // Itens acertados ou pulados
  resolved: number;
  // Itens acertados na primeira vez em que apareceram
  firstTry: number;
  // Perguntas erradas ao menos uma vez
  missedIds: string[];
}

export function questionSize(question: VocabularyQuestion): number {
  return question.kind === 'pairs' ? question.pairs.length : 1;
}

export function createQueue(questions: VocabularyQuestion[]): VocabularyQueue {
  return {
    pending: [...questions],
    total: questions.reduce((sum, question) => sum + questionSize(question), 0),
    resolved: 0,
    firstTry: 0,
    missedIds: [],
  };
}

export function isQueueFinished(queue: VocabularyQueue): boolean {
  return queue.pending.length === 0;
}

// Tira a pergunta da tela, somando os itens dela
function resolveCurrent(
  queue: VocabularyQueue,
  countsAsFirstTry: boolean
): VocabularyQueue {
  const [current, ...rest] = queue.pending;
  if (!current) {
    return queue;
  }
  const size = questionSize(current);
  return {
    ...queue,
    pending: rest,
    resolved: queue.resolved + size,
    firstTry: queue.firstTry + (countsAsFirstTry ? size : 0),
  };
}

// Escolha, escrita e fala: a certa sai; a errada vai para o fim, com as
// opções embaralhadas de novo
export function answerQuestion(
  queue: VocabularyQueue,
  correct: boolean,
  random: () => number = Math.random
): VocabularyQueue {
  const [current, ...rest] = queue.pending;
  if (!current) {
    return queue;
  }

  if (correct) {
    return resolveCurrent(queue, !queue.missedIds.includes(current.id));
  }

  return {
    ...queue,
    pending: [...rest, shuffleOptions(current, random)],
    missedIds: queue.missedIds.includes(current.id)
      ? queue.missedIds
      : [...queue.missedIds, current.id],
  };
}

// Os pares nunca voltam: o grupo acaba quando todos estão ligados, e conta
// de primeira só sem nenhuma ligação errada
export function finishPairs(
  queue: VocabularyQueue,
  hadMistake: boolean
): VocabularyQueue {
  return resolveCurrent(queue, !hadMistake);
}

// "Não posso falar agora": o item sai sem erro, mas não conta de primeira
export function skipQuestion(queue: VocabularyQueue): VocabularyQueue {
  return resolveCurrent(queue, false);
}

// Sem conferência de pronúncia (limite do dia ou plano gratuito), as de
// falar que faltam saem da fila, para a atividade não travar
export function skipSpeakQuestions(queue: VocabularyQueue): VocabularyQueue {
  const skipped = queue.pending.filter((question) => question.kind === 'speak');
  return {
    ...queue,
    pending: queue.pending.filter((question) => question.kind !== 'speak'),
    resolved:
      queue.resolved +
      skipped.reduce((sum, question) => sum + questionSize(question), 0),
  };
}
