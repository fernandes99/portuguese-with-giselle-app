import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityInfoSheet } from '@/components/activity/ActivityInfoSheet';
import { ActivityResult } from '@/components/activity/ActivityResult';
import { ChoiceAlternatives } from '@/components/activity/ChoiceAlternatives';
import {
  type ChoiceFeedback,
  ChoiceFeedbackSheet,
} from '@/components/activity/ChoiceFeedbackSheet';
import { ChoicePrompt } from '@/components/activity/ChoicePrompt';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { ChoiceActivity } from '@/services/lesson';
import {
  allowsMultipleAnswers,
  type ChoiceExercise,
  getAnswerableExercises,
  getPromptKind,
  isAnsweredCorrectly,
  isAudio,
} from '@/utils/choice';

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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
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
  const hasInfo = Boolean(activity.title.trim() || activity.content?.trim());
  const answeredCount = index + (isChecked ? 1 : 0);

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
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <ProgressBar percentage={Math.round((answeredCount / total) * 100)} />
        </View>
        <Text className="font-poppins-medium text-xs text-gray-500">
          {index + 1}/{total}
        </Text>
        {hasInfo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver as instruções da atividade"
            onPress={() => setIsInfoOpen(true)}
            hitSlop={8}
            className="flex-row items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 active:bg-gray-50"
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.gray}
            />
            <Text className="font-poppins-medium text-xs text-gray-600">
              Instruções
            </Text>
          </Pressable>
        ) : null}
      </View>

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

      <ChoiceFeedbackSheet
        visible={isFeedbackOpen}
        feedback={feedback}
        onContinue={goNext}
      />

      <ActivityInfoSheet
        visible={isInfoOpen}
        title={activity.title}
        content={activity.content}
        onClose={() => setIsInfoOpen(false)}
      />
    </View>
  );
}
