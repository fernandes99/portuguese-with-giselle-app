import { DragDropActivity } from '@/components/activity/DragDropActivity';
import { FillBlankActivity } from '@/components/activity/FillBlankActivity';
import { MultipleChoiceActivity } from '@/components/activity/MultipleChoiceActivity';
import { TrueFalseActivity } from '@/components/activity/TrueFalseActivity';
import type { Activity } from '@/services/lesson';

interface ActivityExercisesProps {
  activity: Activity;
  // false ao começar ou errar; true quando o aluno acerta tudo
  onProgress: (completed: boolean) => void;
  // true quando a atividade chega ao placar; false se o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

// Os exercícios de uma atividade, um por tela, conforme o tipo. Usado pela
// aula guiada e pelo modal de atividades da aula em revisão.
export function ActivityExercises({
  activity,
  onProgress,
  onFinishedChange,
}: ActivityExercisesProps) {
  if (activity.type === 'multiple_choice') {
    return (
      <MultipleChoiceActivity
        activity={activity}
        onProgress={onProgress}
        onFinishedChange={onFinishedChange}
      />
    );
  }

  if (activity.type === 'true_or_false') {
    return (
      <TrueFalseActivity
        activity={activity}
        onProgress={onProgress}
        onFinishedChange={onFinishedChange}
      />
    );
  }

  if (activity.type === 'drag_drop') {
    return (
      <DragDropActivity
        activity={activity}
        onProgress={onProgress}
        onFinishedChange={onFinishedChange}
      />
    );
  }

  if (activity.type === 'fill_blank') {
    return (
      <FillBlankActivity
        activity={activity}
        onProgress={onProgress}
        onFinishedChange={onFinishedChange}
      />
    );
  }

  return null;
}
