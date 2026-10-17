import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityResult } from '@/components/activity/ActivityResult';
import {
  ChoiceAlternatives,
  ChoiceAnswer,
} from '@/components/activity/ChoiceAlternatives';
import { ChoicePrompt } from '@/components/activity/ChoicePrompt';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { Button } from '@/components/Button';
import type { ChoiceActivity } from '@/services/lesson';
import {
  allowsMultipleAnswers,
  type ChoiceExercise,
  getAnswerableExercises,
  getPromptKind,
  isAnsweredCorrectly,
  isAudio,
} from '@/utils/choice';

interface ChoiceFeedback {
  exercise: ChoiceExercise;
  isCorrect: boolean;
  isLast: boolean;
}

interface MultipleChoiceActivityProps {
  activity: ChoiceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as perguntas
  onProgress: (completed: boolean) => void;
  // Avisa quando a atividade chega ao resultado, e quando o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

// Um exercício por tela, no estilo dos apps de idioma: escolher, verificar,
// ver o painel de acerto ou erro e continuar. No fim mostra o placar. O
// título e o enunciado longo da atividade ficam no botão "Instruções".
export function MultipleChoiceActivity({
  activity,
  onProgress,
  onFinishedChange,
}: MultipleChoiceActivityProps) {
  const exercises = useMemo(
    () => getAnswerableExercises(activity.exercises),
    [activity.exercises]
  );
  const { play, stop } = useActivityAudio();

  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ChoiceFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);
  // Exercício cujo áudio já tocou sozinho; volta a null ao recomeçar
  const autoPlayedId = useRef<string | null>(null);

  const total = exercises.length;
  const exercise: ChoiceExercise | undefined = exercises[index];

  // O áudio da pergunta toca sozinho quando o exercício aparece
  useEffect(() => {
    if (!exercise || isFinished || autoPlayedId.current === exercise.id) {
      return;
    }

    autoPlayedId.current = exercise.id;
    if (isAudio(exercise.file)) {
      play(exercise.file.url);
    }
  }, [exercise, isFinished, play]);

  if (!exercise) {
    return null;
  }

  const correctCount = exercises.filter((item) =>
    isAnsweredCorrectly(item, selections[item.id] ?? [])
  ).length;

  function reset() {
    stop();
    autoPlayedId.current = null;
    setIndex(0);
    setSelections({});
    setCheckedIds([]);
    setFeedback(null);
    setIsFinished(false);
    onFinishedChange(false);
  }

  if (isFinished) {
    return (
      <ActivityResult correct={correctCount} total={total} onRetry={reset} />
    );
  }

  const kind = getPromptKind(exercise);
  const allowsMultiple = allowsMultipleAnswers(exercise);
  const selected = selections[exercise.id] ?? [];
  const isChecked = checkedIds.includes(exercise.id);
  const isLast = index === total - 1;

  function select(alternativeId: string) {
    if (!exercise || isChecked) {
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    setSelections((previous) => {
      const current = previous[exercise.id] ?? [];
      const next = allowsMultiple
        ? current.includes(alternativeId)
          ? current.filter((id) => id !== alternativeId)
          : [...current, alternativeId]
        : [alternativeId];

      return { ...previous, [exercise.id]: next };
    });
  }

  function check() {
    if (!exercise) {
      return;
    }

    stop();
    setCheckedIds((previous) => [...previous, exercise.id]);
    setFeedback({
      exercise,
      isCorrect: isAnsweredCorrectly(exercise, selected),
      isLast,
    });
    setIsFeedbackOpen(true);
  }

  function goNext() {
    stop();
    setIsFeedbackOpen(false);

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    setIsFinished(true);
    onFinishedChange(true);
    onProgress(correctCount === total);
  }

  return (
    <View className="grow gap-6">
      <ExerciseHeader
        index={index}
        total={total}
        isChecked={isChecked}
        title={activity.title}
        content={activity.content}
      />

      <ChoicePrompt
        exercise={exercise}
        kind={kind}
        allowsMultiple={allowsMultiple}
      />

      <ChoiceAlternatives
        exercise={exercise}
        kind={kind}
        selected={selected}
        isChecked={isChecked}
        allowsMultiple={allowsMultiple}
        onSelect={select}
      />

      {/* Empurra o botão para o pé da tela na aula guiada */}
      <View className="grow" />

      <Button
        size="lg"
        label="Verificar"
        onPress={check}
        disabled={selected.length === 0 || isChecked}
      />

      {feedback ? (
        <ExerciseFeedbackSheet
          visible={isFeedbackOpen}
          isCorrect={feedback.isCorrect}
          isLast={feedback.isLast}
          answerLabel={
            allowsMultipleAnswers(feedback.exercise)
              ? 'Respostas certas:'
              : 'Resposta certa:'
          }
          answer={<ChoiceAnswer exercise={feedback.exercise} />}
          onContinue={goNext}
        />
      ) : null}
    </View>
  );
}
