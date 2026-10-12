import type { Activity, Lesson } from '@/services/lesson';

export type FlowStep =
  | { kind: 'intro' }
  | { kind: 'content' }
  | { kind: 'activity'; activity: Activity; number: number; total: number };

// Verdadeiro ou falso ainda não existe no app e fica fora do fluxo
const SUPPORTED_ACTIVITIES: Activity['type'][] = [
  'multiple_choice',
  'fill_blank',
  'drag_drop',
];

// Unidades da aula guiada, na ordem em que o aluno passa por elas. Cada uma
// vale um passo da barra de progresso.
export function getLessonFlow(lesson: Lesson): FlowStep[] {
  const activities = lesson.activities.filter((activity) =>
    SUPPORTED_ACTIVITIES.includes(activity.type)
  );

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
