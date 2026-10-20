import { useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, Text, TextInput, View } from 'react-native';

import { ActivityCheck } from '@/components/activity/ActivityFooter';
import { ActivityResult } from '@/components/activity/ActivityResult';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { SentenceAnswer } from '@/components/activity/SentenceAnswer';
import { SentenceText } from '@/components/activity/SentenceText';
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

// O painel de feedback leva 200 ms para descer no Android
// (config_shortAnimTime); o foco espera um pouco mais que isso
const ANDROID_SHEET_CLOSE_DELAY = 300;

// result: null antes de verificar; depois, se a lacuna está certa
function getBlankClassName(result: boolean | null, isFocused: boolean) {
  if (result === true) return 'border-green-600 bg-green-50';
  if (result === false) return 'border-red-500 bg-red-50';
  return isFocused
    ? 'border-blue-500 bg-gray-50'
    : 'border-gray-300 bg-gray-50';
}

function getLetterClassName(result: boolean | null) {
  if (result === true) return 'text-green-700';
  if (result === false) return 'text-red-700';
  return 'text-gray-900';
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
  // Lacuna com o teclado aberto, para marcar a próxima letra
  const [focusedSlot, setFocusedSlot] = useState<number | null>(null);
  const hasStarted = useRef(false);
  // Campos da frase atual, na ordem, para o Enter pular para o próximo
  const inputs = useRef<(TextInput | null)[]>([]);
  // A próxima frase abre com o painel ainda descendo, e o teclado não abre
  // atrás do Modal. O foco fica pendente até o painel sumir.
  const hasPendingFocus = useRef(false);

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

  function focusFirstInput() {
    if (!hasPendingFocus.current) {
      return;
    }

    hasPendingFocus.current = false;
    inputs.current[0]?.focus();
  }

  function goNext() {
    setIsFeedbackOpen(false);

    if (!isLast) {
      hasPendingFocus.current = true;
      setIndex(index + 1);
      // No iOS o foco vem do onDismiss do painel
      if (Platform.OS === 'android') {
        setTimeout(focusFirstInput, ANDROID_SHEET_CLOSE_DELAY);
      }
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
          const letters = Array.from(value);
          const hasNext = part.index < exercise.answers.length - 1;
          const result = isChecked ? isSameAnswer(value, part.answer) : null;
          const isFocused = focusedSlot === part.index;

          return (
            // Um traço por letra da resposta ("mãe" vira _ _ _), trocado pela
            // letra conforme o aluno digita. O campo de texto fica invisível
            // por cima e só recebe o teclado; a largura é a da resposta.
            <View
              key={`${exercise.id}:${part.index}`}
              className={`min-h-11 min-w-14 max-w-full justify-center rounded-xl border-2 px-3 ${getBlankClassName(result, isFocused)}`}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                className="flex-row flex-wrap justify-center gap-x-1"
              >
                {Array.from(part.answer).map((answerLetter, slot) => {
                  const letter = letters[slot];
                  const isNext = isFocused && slot === letters.length;

                  return (
                    <View
                      // biome-ignore lint/suspicious/noArrayIndexKey: as letras da resposta não mudam de ordem
                      key={slot}
                      className="h-7 w-[15px] items-center justify-end"
                    >
                      {letter ? (
                        // text-[16px] em vez de text-base: a altura de linha
                        // fixa cortava a Poppins, que é alta.
                        <Text
                          className={`font-poppins-medium text-[16px] ${getLetterClassName(result)}`}
                        >
                          {letter}
                        </Text>
                      ) : answerLetter.trim() ? (
                        <View
                          className={`mb-1 h-0.5 w-full rounded-full ${isNext ? 'bg-blue-500' : 'bg-gray-400'}`}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>

              <TextInput
                // A key com a frase recria os campos a cada tela. O autoFocus
                // abre o teclado só na primeira frase; nas outras ele marcaria
                // o campo como focado com o painel ainda na tela, sem teclado,
                // e o focus() de focusFirstInput não faria nada.
                ref={(input) => {
                  inputs.current[part.index] = input;
                }}
                autoFocus={index === 0 && part.index === 0}
                accessibilityLabel={`Lacuna ${part.index + 1}`}
                value={value}
                onChangeText={(text) => type(part.index, text)}
                onFocus={() => setFocusedSlot(part.index)}
                // Ao pular de lacuna, o blur da anterior pode chegar depois
                // do focus da próxima
                onBlur={() =>
                  setFocusedSlot((current) =>
                    current === part.index ? null : current
                  )
                }
                maxLength={part.answer.length}
                editable={!isChecked}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                caretHidden
                contextMenuHidden
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
                // opacity-0, e não a cor transparente: no Android o texto
                // em composição do teclado aparecia por cima dos traços. O
                // campo continua recebendo o toque e o teclado.
                className="absolute inset-0 p-0 text-[16px] opacity-0"
              />
            </View>
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
          onDismiss={focusFirstInput}
        />
      ) : null}
    </View>
  );
}
