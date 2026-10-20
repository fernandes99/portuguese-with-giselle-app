import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityCheck } from '@/components/activity/ActivityFooter';
import { ActivityResult } from '@/components/activity/ActivityResult';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { SentenceAnswer } from '@/components/activity/SentenceAnswer';
import { SentenceText } from '@/components/activity/SentenceText';
import type { SentenceActivity } from '@/services/lesson';
import {
  buildDragDropExercises,
  type DragDropExercise,
  type Slots,
} from '@/utils/dragDrop';
import { isSameAnswer } from '@/utils/sentence';

interface DragDropActivityProps {
  activity: SentenceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as lacunas
  onProgress: (completed: boolean) => void;
  // Avisa quando a atividade chega ao resultado, e quando o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

interface SentenceFeedback {
  exercise: DragDropExercise;
  isCorrect: boolean;
  isLast: boolean;
}

// Frases mais longas que isso aparecem em letra menor, para caber na tela
const LONG_SENTENCE_LENGTH = 160;

// result: null antes de verificar; depois, se a lacuna está certa
function getSlotClassName(isFilled: boolean, result: boolean | null) {
  if (result === true) return 'border-green-600 bg-green-50';
  if (result === false) return 'border-red-500 bg-red-50';
  return isFilled
    ? 'border-gray-300 bg-white'
    : 'border-dashed border-gray-300 bg-gray-50';
}

function getSlotTextClassName(result: boolean | null) {
  if (result === true) return 'text-green-700';
  if (result === false) return 'text-red-700';
  return 'text-gray-900';
}

// Uma frase por tela, no estilo dos apps de idioma: o aluno toca nas opções
// do banco para preencher as lacunas, verifica e vê o painel de acerto ou
// erro. No fim mostra o placar, contado por lacuna.
export function DragDropActivity({
  activity,
  onProgress,
  onFinishedChange,
}: DragDropActivityProps) {
  // Montado uma vez: o banco de cada frase não pode ser embaralhado de novo
  // a cada atualização da aula
  const [exercises] = useState(() =>
    buildDragDropExercises(activity.exercises)
  );

  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<Record<string, Slots>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);

  const total = exercises.length;
  if (total === 0) {
    return null;
  }

  function getSlots(item: DragDropExercise): Slots {
    return filled[item.id] ?? item.answers.map(() => null);
  }

  function getChipText(item: DragDropExercise, chipId: string | null) {
    return item.bank.find((chip) => chip.id === chipId)?.text ?? null;
  }

  function countCorrect(item: DragDropExercise) {
    const itemSlots = getSlots(item);
    return item.answers.filter((answer, slot) =>
      isSameAnswer(getChipText(item, itemSlots[slot]), answer)
    ).length;
  }

  const totalBlanks = exercises.reduce(
    (acc, item) => acc + item.answers.length,
    0
  );
  const correctBlanks = exercises.reduce(
    (acc, item) => acc + countCorrect(item),
    0
  );

  function reset() {
    setIndex(0);
    setFilled({});
    setCheckedIds([]);
    setFeedback(null);
    setIsFinished(false);
    onFinishedChange(false);
  }

  if (isFinished) {
    return (
      <ActivityResult
        correct={correctBlanks}
        total={totalBlanks}
        unit={totalBlanks === 1 ? 'lacuna' : 'lacunas'}
        onRetry={reset}
      />
    );
  }

  const exercise = exercises[index];
  const slots = getSlots(exercise);
  const usedChipIds = new Set(slots);
  const isChecked = checkedIds.includes(exercise.id);
  const isLast = index === total - 1;
  const isComplete = slots.every((slot) => slot !== null);
  const sentenceLength = exercise.parts.reduce(
    (acc, part) =>
      acc + (part.type === 'text' ? part.text.length : part.answer.length),
    0
  );
  const sentenceSize = sentenceLength > LONG_SENTENCE_LENGTH ? 'base' : 'md';

  function setSlots(next: Slots) {
    setFilled((previous) => ({ ...previous, [exercise.id]: next }));
  }

  // A opção vai para a primeira lacuna vazia
  function placeChip(chipId: string) {
    const slot = slots.indexOf(null);
    if (isChecked || slot === -1) {
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    const next = [...slots];
    next[slot] = chipId;
    setSlots(next);
  }

  // Tocar numa lacuna preenchida devolve a opção ao banco
  function clearSlot(slot: number) {
    if (isChecked || slots[slot] === null) {
      return;
    }

    const next = [...slots];
    next[slot] = null;
    setSlots(next);
  }

  function check() {
    setCheckedIds((previous) => [...previous, exercise.id]);
    setFeedback({
      exercise,
      isCorrect: countCorrect(exercise) === exercise.answers.length,
      isLast,
    });
    setIsFeedbackOpen(true);
  }

  function goNext() {
    setIsFeedbackOpen(false);

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    setIsFinished(true);
    onFinishedChange(true);
    onProgress(correctBlanks === totalBlanks);
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

      <Text className="text-center font-poppins-bold text-xl text-gray-900">
        {exercise.answers.length > 1
          ? 'Complete as lacunas'
          : 'Complete a frase'}
      </Text>

      {/* Palavra por palavra, para a frase quebrar de linha em volta das lacunas */}
      <View className="flex-row flex-wrap items-center gap-x-2 gap-y-3 rounded-2xl border border-gray-100 bg-white p-4">
        {exercise.parts.map((part, partIndex) => {
          if (part.type === 'text') {
            return (
              <SentenceText
                // biome-ignore lint/suspicious/noArrayIndexKey: as partes de uma frase não mudam de ordem
                key={partIndex}
                text={part.text}
                size={sentenceSize}
              />
            );
          }

          const value = getChipText(exercise, slots[part.index]);
          const result = isChecked ? isSameAnswer(value, part.answer) : null;

          return (
            <Pressable
              key={`slot-${part.index}`}
              accessibilityRole="button"
              accessibilityLabel={
                value
                  ? `Lacuna ${part.index + 1}: ${value}. Toque para devolver ao banco`
                  : `Lacuna ${part.index + 1}, vazia`
              }
              onPress={() => clearSlot(part.index)}
              disabled={isChecked || !value}
              className={`min-h-11 min-w-20 max-w-full items-center justify-center rounded-xl border-2 px-3 py-1.5 ${getSlotClassName(value !== null, result)}`}
            >
              {value ? (
                <Text
                  className={`text-center font-poppins-medium text-base ${getSlotTextClassName(result)}`}
                >
                  {value}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row flex-wrap justify-center gap-2.5">
        {exercise.bank.map((chip) => {
          const isUsed = !exercise.reusesChips && usedChipIds.has(chip.id);

          return (
            <Pressable
              key={chip.id}
              accessibilityRole="button"
              accessibilityLabel={chip.text}
              accessibilityState={{ disabled: isUsed || isChecked }}
              disabled={isUsed || isChecked}
              onPress={() => placeChip(chip.id)}
              // A opção usada deixa o espaço marcado no banco, como no Duolingo
              className={`max-w-full rounded-xl border-2 border-b-4 px-4 py-2.5 ${isUsed ? 'border-gray-200 bg-gray-200' : 'border-gray-200 bg-white active:bg-gray-50'}`}
            >
              <Text
                className={`text-center font-poppins-medium text-base ${isUsed ? 'text-gray-200' : 'text-gray-900'}`}
              >
                {chip.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ActivityCheck disabled={!isComplete || isChecked} onCheck={check} />

      {feedback ? (
        <ExerciseFeedbackSheet
          visible={isFeedbackOpen}
          isCorrect={feedback.isCorrect}
          isLast={feedback.isLast}
          answerLabel="Resposta certa:"
          answer={<SentenceAnswer parts={feedback.exercise.parts} />}
          onContinue={goNext}
        />
      ) : null}
    </View>
  );
}
