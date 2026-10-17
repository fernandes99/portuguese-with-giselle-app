import type { Activity, Lesson } from '@/services/lesson';
import { isPlayableActivity } from '@/utils/activityScreens';

export type FlowStep =
  | { kind: 'intro' }
  | { kind: 'content' }
  | { kind: 'activity'; activity: Activity; number: number; total: number };

// Unidades da aula guiada, na ordem em que o aluno passa por elas. Cada uma
// vale um passo da barra de progresso. Atividades sem nenhum exercício ficam
// de fora.
export function getLessonFlow(lesson: Lesson): FlowStep[] {
  const activities = lesson.activities.filter(isPlayableActivity);

  const steps: FlowStep[] = [{ kind: 'intro' }];

  if (lesson.content?.trim()) {
    steps.push({ kind: 'content' });
  }

  activities.forEach((activity, index) => {
    steps.push({
      kind: 'activity',
      activity,
      number: index + 1,
      total: activities.length,
    });
  });

  return steps;
}
