import { useMemo, useRef, useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';

import { ActivityResult } from '@/components/activity/ActivityResult';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { SentenceAnswer } from '@/components/activity/SentenceAnswer';
import { SentenceText } from '@/components/activity/SentenceText';
import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type { SentenceActivity } from '@/services/lesson';
import {
  getAnswers,
  isSameAnswer,
  parseSentence,
  type SentencePart,
} from '@/utils/sentence';

interface FillBlankActivityProps {
  activity: SentenceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as lacunas
  onProgress: (completed: boolean) => void;
  // Avisa quando a atividade chega ao resultado, e quando o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

interface FillBlankExercise {
  id: string;
  parts: SentencePart[];
  answers: string[];
}

interface SentenceFeedback {
  exercise: FillBlankExercise;
  isCorrect: boolean;
  isLast: boolean;
}

// Frases mais longas que isso aparecem em letra menor, para caber na tela
const LONG_SENTENCE_LENGTH = 160;

const INPUT_MIN_WIDTH = 96;
const INPUT_PADDING = 32;
const CHARACTER_WIDTH = 10.5;

function getInputWidth(value: string) {
  return Math.max(
    INPUT_MIN_WIDTH,
    Math.ceil(value.length * CHARACTER_WIDTH) + INPUT_PADDING
  );
}

// result: null antes de verificar; depois, se a lacuna está certa
function getInputClassName(result: boolean | null) {
  if (result === true) return 'border-green-600 bg-green-50 text-green-700';
  if (result === false) return 'border-red-500 bg-red-50 text-red-700';
  return 'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500';
}

// Uma frase por tela, no estilo dos apps de idioma: o aluno digita a palavra
// que falta, verifica e vê o painel de acerto ou erro. No fim mostra o
// placar, contado por lacuna.
export function FillBlankActivity({
  activity,
  onProgress,
  onFinishedChange,
}: FillBlankActivityProps) {
  const exercises = useMemo(
    () =>
      activity.exercises
        .map((exercise) => {
          const parts = parseSentence(exercise.sentence);
          return { id: exercise.id, parts, answers: getAnswers(parts) };
        })
        .filter((exercise) => exercise.answers.length > 0),
    [activity.exercises]
  );

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState<Record<string, string[]>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);
  // Campos da frase atual, na ordem, para o Enter pular para o próximo
  const inputs = useRef<(TextInput | null)[]>([]);

  const total = exercises.length;
  if (total === 0) {
    return null;
  }

  function getValues(item: FillBlankExercise) {
    return item.answers.map((_, slot) => typed[item.id]?.[slot] ?? '');
  }

  function countCorrect(item: FillBlankExercise) {
    const values = getValues(item);
    return item.answers.filter((answer, slot) =>
      isSameAnswer(values[slot], answer)
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
    setTyped({});
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
  const values = getValues(exercise);
  const isChecked = checkedIds.includes(exercise.id);
  const isLast = index === total - 1;
  const isComplete = values.every((value) => value.trim());
  const sentenceLength = exercise.parts.reduce(
    (acc, part) =>
      acc + (part.type === 'text' ? part.text.length : part.answer.length),
    0
  );
  const sentenceSize = sentenceLength > LONG_SENTENCE_LENGTH ? 'base' : 'md';

  function type(slot: number, value: string) {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    setTyped((previous) => {
      const next = [...getValues(exercise)];
      next[slot] = value;
      return { ...previous, [exercise.id]: next };
    });
  }

  function check() {
    if (isChecked || !isComplete) {
      return;
    }

    // O teclado sai para o painel aparecer inteiro
    Keyboard.dismiss();
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

      {/* Palavra por palavra, para a frase quebrar de linha em volta dos campos */}
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

          const value = values[part.index];
          const hasNext = part.index < exercise.answers.length - 1;
          const result = isChecked ? isSameAnswer(value, part.answer) : null;

          return (
            <TextInput
              // A key com a frase recria os campos a cada tela, e o autoFocus
              // abre o teclado no primeiro
              key={`${exercise.id}:${part.index}`}
              ref={(input) => {
                inputs.current[part.index] = input;
              }}
              autoFocus={part.index === 0}
              accessibilityLabel={`Lacuna ${part.index + 1}`}
              value={value}
              onChangeText={(text) => type(part.index, text)}
              editable={!isChecked}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              // Enter pula para a próxima lacuna; na última, verifica
              returnKeyType={hasNext ? 'next' : 'done'}
              submitBehavior={hasNext ? 'submit' : 'blurAndSubmit'}
              onSubmitEditing={() => {
                if (hasNext) {
                  inputs.current[part.index + 1]?.focus();
                  return;
                }
                check();
              }}
              placeholderTextColor={colors.placeholder}
              textAlignVertical="center"
              // A largura acompanha o texto digitado; o campo não cresce
              // sozinho no Android e cortava respostas longas.
              style={{ width: getInputWidth(value), maxWidth: '100%' }}
              // text-[16px] em vez de text-base: a altura de linha fixa
              // cortava a Poppins, que é alta, dentro do campo.
              className={`h-11 rounded-xl border-2 px-3 py-0 text-center font-poppins-medium text-[16px] ${getInputClassName(result)}`}
            />
          );
        })}
      </View>

      {/* Empurra o botão para o pé da tela, logo acima do teclado */}
      <View className="grow" />

      <Button
        size="lg"
        label="Verificar"
        onPress={check}
        disabled={!isComplete || isChecked}
      />

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
