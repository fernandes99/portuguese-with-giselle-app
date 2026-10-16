import type { ActivityFile, ChoiceActivity } from '@/services/lesson';

export type ChoiceExercise = ChoiceActivity['exercises'][number];
export type ChoiceAlternative = ChoiceExercise['alternatives'][number];

// Como a pergunta é apresentada, a partir do que o exercício traz:
// listen: áudio na pergunta; look: imagem na pergunta; pick-audio: as
// alternativas são só áudios; read: pergunta e alternativas em texto
export type ChoicePromptKind = 'listen' | 'look' | 'pick-audio' | 'read';

export const PROMPT_INSTRUCTIONS: Record<ChoicePromptKind, string> = {
  listen: 'Selecione o que você ouve',
  look: 'Selecione o que você vê',
  'pick-audio': 'Selecione o áudio certo',
  read: 'Escolha a resposta certa',
};

const LETTERS = 'ABCDEFGHIJ';

export function getLetter(position: number) {
  return LETTERS[position] ?? String(position + 1);
}

export function isAudio(file: ActivityFile | null): file is ActivityFile {
  return file?.mimeType.startsWith('audio/') ?? false;
}

export function isImage(file: ActivityFile | null): file is ActivityFile {
  return file?.mimeType.startsWith('image/') ?? false;
}

// Alternativa sem texto, só com o áudio
export function isAudioOnly(alternative: ChoiceAlternative) {
  return !alternative.title.trim() && isAudio(alternative.file);
}

export function getPromptKind(exercise: ChoiceExercise): ChoicePromptKind {
  if (isAudio(exercise.file)) return 'listen';
  if (isImage(exercise.file)) return 'look';
  if (
    exercise.alternatives.length > 0 &&
    exercise.alternatives.every(isAudioOnly)
  ) {
    return 'pick-audio';
  }
  return 'read';
}

// Com mais de uma alternativa correta, o aluno marca todas
export function allowsMultipleAnswers(exercise: ChoiceExercise) {
  return (
    exercise.alternatives.filter((alternative) => alternative.isCorrect)
      .length > 1
  );
}

export function isAnsweredCorrectly(
  exercise: ChoiceExercise,
  selected: string[]
) {
  return exercise.alternatives.every(
    (alternative) => selected.includes(alternative.id) === alternative.isCorrect
  );
}

// Um exercício sem alternativa correta é erro de cadastro no CMS. Ele fica
// de fora, senão a atividade nunca poderia ser concluída.
export function getAnswerableExercises(exercises: ChoiceExercise[]) {
  return exercises.filter((exercise) =>
    exercise.alternatives.some((alternative) => alternative.isCorrect)
  );
}
