import type { SentenceActivity } from '@/services/lesson';
import { getAnswers, parseSentence, type SentencePart } from '@/utils/sentence';

// Opção do banco de palavras
export interface WordChip {
  id: string;
  text: string;
}

export interface DragDropExercise {
  id: string;
  parts: SentencePart[];
  answers: string[];
  bank: WordChip[];
  // A frase repete uma resposta: cada opção aparece uma vez e pode ir para
  // várias lacunas. Senão, a opção usada sai do banco.
  reusesChips: boolean;
}

// Uma lacuna guarda o id da opção colocada nela
export type Slots = (string | null)[];

// O banco de cada frase tem pelo menos esse número de opções, completado com
// respostas das outras frases quando a frase tem poucas lacunas
const MIN_BANK_SIZE = 4;

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const normalize = (text: string) => text.trim().toLowerCase();

// Respostas sem repetição, ignorando maiúsculas e espaços nas pontas
function uniqueTexts(answers: string[]) {
  const unique = new Map<string, string>();
  for (const answer of answers) {
    const key = normalize(answer);
    if (!unique.has(key)) {
      unique.set(key, answer.trim());
    }
  }
  return unique;
}

// Frases com lacunas, cada uma com seu banco embaralhado: as respostas da
// frase e, se faltar para chegar ao mínimo, opções erradas tiradas das
// respostas das outras frases. O CMS não tem campo de distratores.
export function buildDragDropExercises(
  exercises: SentenceActivity['exercises']
): DragDropExercise[] {
  const sentences = exercises
    .map((exercise) => {
      const parts = parseSentence(exercise.sentence);
      return { id: exercise.id, parts, answers: getAnswers(parts) };
    })
    .filter((sentence) => sentence.answers.length > 0);

  return sentences.map((sentence) => {
    const own = uniqueTexts(sentence.answers);
    const reusesChips = own.size < sentence.answers.length;
    // Com opções reaproveitáveis, uma por resposta diferente; senão, uma por
    // lacuna
    const answerTexts = reusesChips
      ? [...own.values()]
      : sentence.answers.map((answer) => answer.trim());

    const others = uniqueTexts(
      sentences
        .filter((other) => other.id !== sentence.id)
        .flatMap((other) => other.answers)
    );
    const distractors = [...others]
      .filter(([key]) => !own.has(key))
      .map(([, text]) => text);

    const missing = Math.max(0, MIN_BANK_SIZE - answerTexts.length);
    const chips = [...answerTexts, ...shuffle(distractors).slice(0, missing)];

    return {
      ...sentence,
      bank: shuffle(
        chips.map((text, position) => ({
          id: `${sentence.id}:${position}`,
          text,
        }))
      ),
      reusesChips,
    };
  });
}
