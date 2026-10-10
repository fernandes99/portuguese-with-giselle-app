import { useMemo, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type { SentenceActivity } from '@/services/lesson';
import { getAnswers, isSameAnswer, parseSentence } from '@/utils/sentence';

interface FillBlankActivityProps {
  activity: SentenceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as lacunas
  onProgress: (completed: boolean) => void;
}

// editing: digitando; checked: corrigido; revealed: mostrando as respostas
type Status = 'editing' | 'checked' | 'revealed';

function getInputClassName(status: Status, isCorrect: boolean) {
  if (status === 'editing') {
    return 'border-gray-300 bg-gray-50 text-gray-900 focus:border-green-600';
  }
  return isCorrect
    ? 'border-green-600 bg-green-50 text-green-700'
    : 'border-red-500 bg-red-50 text-red-700';
}

const INPUT_MIN_WIDTH = 96;
const INPUT_PADDING = 32;
const CHARACTER_WIDTH = 10.5;

function getInputWidth(value: string) {
  return Math.max(
    INPUT_MIN_WIDTH,
    Math.ceil(value.length * CHARACTER_WIDTH) + INPUT_PADDING
  );
}

// Todas as frases em lista, com um campo de texto no lugar de cada lacuna
export function FillBlankActivity({
  activity,
  onProgress,
}: FillBlankActivityProps) {
  const exercises = useMemo(
    () =>
      activity.exercises.map((exercise) => {
        const parts = parseSentence(exercise.sentence);
        return { id: exercise.id, parts, answers: getAnswers(parts) };
      }),
    [activity.exercises]
  );

  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Status>('editing');
  const hasStarted = useRef(false);

  // Campos na ordem em que aparecem, para o Enter pular para o próximo
  const inputs = useRef<Record<string, TextInput | null>>({});
  const blankKeys = useMemo(
    () =>
      exercises.flatMap((exercise) =>
        exercise.answers.map((_, index) => `${exercise.id}:${index}`)
      ),
    [exercises]
  );

  const totalBlanks = exercises.reduce(
    (acc, exercise) => acc + exercise.answers.length,
    0
  );
  if (totalBlanks === 0) {
    return null;
  }

  const correctCount = exercises.reduce(
    (acc, exercise) =>
      acc +
      exercise.answers.filter((answer, index) =>
        isSameAnswer(userAnswers[exercise.id]?.[index], answer)
      ).length,
    0
  );
  const hasAnyAnswer = Object.values(userAnswers).some((answers) =>
    answers.some((answer) => answer?.trim())
  );

  function handleChange(exerciseId: string, index: number, value: string) {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    setUserAnswers((previous) => {
      const next = [...(previous[exerciseId] ?? [])];
      next[index] = value;
      return { ...previous, [exerciseId]: next };
    });
  }

  function handleCheck() {
    setStatus('checked');
    onProgress(correctCount === totalBlanks);
  }

  // Depois de corrigir, mantém os acertos e limpa só o que estava errado.
  // Com tudo certo ou com as respostas reveladas, recomeça do zero.
  function handleRetry() {
    setStatus('editing');

    if (status === 'revealed' || correctCount === totalBlanks) {
      setUserAnswers({});
      return;
    }

    setUserAnswers((previous) =>
      Object.fromEntries(
        exercises.map((exercise) => [
          exercise.id,
          exercise.answers.map((answer, index) =>
            isSameAnswer(previous[exercise.id]?.[index], answer)
              ? previous[exercise.id][index]
              : ''
          ),
        ])
      )
    );
  }

  function handleReveal() {
    setUserAnswers(
      Object.fromEntries(
        exercises.map((exercise) => [exercise.id, exercise.answers])
      )
    );
    setStatus('revealed');
  }

  return (
    <View className="gap-4">
      <View className="gap-3 rounded-xl bg-gray-50 p-3">
        {exercises.map((exercise, position) => (
          <View key={exercise.id} className="flex-row gap-3">
            <Text className="w-6 pt-2 font-poppins-semibold text-sm text-gray-500">
              {position + 1}.
            </Text>

            {/* Palavra por palavra, para a frase quebrar de linha em volta do campo */}
            <View className="flex-1 flex-row flex-wrap items-center gap-x-1.5 gap-y-2">
              {exercise.parts.map((part, partIndex) => {
                if (part.type === 'text') {
                  return part.text
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((word, wordIndex) => (
                      <Text
                        // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
                        key={`${partIndex}-${wordIndex}`}
                        className="font-poppins text-base text-gray-900"
                      >
                        {word}
                      </Text>
                    ));
                }

                const value = userAnswers[exercise.id]?.[part.index] ?? '';
                const blankKey = `${exercise.id}:${part.index}`;
                const nextKey = blankKeys[blankKeys.indexOf(blankKey) + 1];

                return (
                  <TextInput
                    key={`blank-${part.index}`}
                    accessibilityLabel={`Lacuna ${part.index + 1} da frase ${position + 1}`}
                    value={value}
                    onChangeText={(text) =>
                      handleChange(exercise.id, part.index, text)
                    }
                    editable={status === 'editing'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    ref={(input) => {
                      inputs.current[blankKey] = input;
                    }}
                    // No último campo o Enter só fecha o teclado
                    returnKeyType={nextKey ? 'next' : 'done'}
                    submitBehavior={nextKey ? 'submit' : 'blurAndSubmit'}
                    onSubmitEditing={() => {
                      if (nextKey) {
                        inputs.current[nextKey]?.focus();
                      }
                    }}
                    placeholderTextColor={colors.placeholder}
                    textAlignVertical="center"
                    // A largura acompanha o texto digitado; o campo não cresce
                    // sozinho no Android e cortava respostas longas.
                    style={{ width: getInputWidth(value), maxWidth: '100%' }}
                    // text-[16px] em vez de text-base: a altura de linha fixa
                    // cortava a Poppins, que é alta, dentro do campo.
                    className={`h-11 rounded-lg border px-3 py-0 text-center font-poppins-medium text-[16px] ${getInputClassName(status, isSameAnswer(value, part.answer))}`}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {status === 'checked' ? (
        <Text
          className={`font-poppins-semibold text-sm ${correctCount === totalBlanks ? 'text-green-700' : 'text-gray-900'}`}
        >
          {correctCount === totalBlanks
            ? 'Parabéns! Atividade concluída.'
            : `Você acertou ${correctCount} de ${totalBlanks}.`}
        </Text>
      ) : null}

      {status === 'editing' ? (
        <Button
          label="Verificar respostas"
          onPress={handleCheck}
          disabled={!hasAnyAnswer}
        />
      ) : (
        <View>
          <Button label="Tentar de novo" onPress={handleRetry} />
          {status === 'checked' && correctCount < totalBlanks ? (
            <Button
              variant="link"
              label="Ver respostas"
              onPress={handleReveal}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}
