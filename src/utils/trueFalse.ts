import type { ActivityFile, ChoiceActivity } from '@/services/lesson';

// Uma afirmação do verdadeiro ou falso. No CMS, cada exercício traz as
// afirmações como alternativas, e "isCorrect" marca as verdadeiras.
export interface Statement {
  id: string;
  text: string;
  isTrue: boolean;
  // Áudio ou imagem do exercício, mostrado acima da afirmação
  exerciseFile: ActivityFile | null;
  // Áudio ou imagem da própria afirmação
  file: ActivityFile | null;
}

// Todas as afirmações da atividade, na ordem do CMS. Afirmação sem texto fica
// de fora: não há o que julgar.
export function getStatements(
  exercises: ChoiceActivity['exercises']
): Statement[] {
  return exercises.flatMap((exercise) =>
    exercise.alternatives
      .filter((alternative) => alternative.title.trim())
      .map((alternative) => ({
        id: alternative.id,
        text: alternative.title.trim(),
        isTrue: alternative.isCorrect,
        exerciseFile: exercise.file,
        file: alternative.file,
      }))
  );
}
