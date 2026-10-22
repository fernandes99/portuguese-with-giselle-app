import type { Activity } from '@/services/lesson';
import { getAnswerableExercises } from '@/utils/choice';
import { getAnswers, parseSentence } from '@/utils/sentence';
import { getStatements } from '@/utils/trueFalse';

// A atividade tem ao menos um exercício que dá para responder. Algumas do CMS
// só têm o enunciado, sem nenhuma frase ou alternativa: elas ficam fora da
// aula guiada e da lista de atividades, senão travariam o aluno.
export function isPlayableActivity(activity: Activity) {
  if (activity.type === 'multiple_choice') {
    return getAnswerableExercises(activity.exercises).length > 0;
  }
  if (activity.type === 'true_or_false') {
    return getStatements(activity.exercises).length > 0;
  }
  // Sem perguntas: nenhum item tem o campo que o tipo pede (o áudio, por
  // exemplo)
  if (activity.type === 'vocabulary') {
    return activity.questions.length > 0;
  }
  if (activity.type !== 'fill_blank' && activity.type !== 'drag_drop') {
    return false;
  }
  return activity.exercises.some(
    (exercise) => getAnswers(parseSentence(exercise.sentence)).length > 0
  );
}
