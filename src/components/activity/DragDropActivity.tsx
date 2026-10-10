import { useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityResult } from '@/components/activity/ActivityResult';
import { SentenceText } from '@/components/activity/SentenceText';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import type { SentenceActivity } from '@/services/lesson';
import { getAnswers, isSameAnswer, parseSentence } from '@/utils/sentence';

interface DragDropActivityProps {
  activity: SentenceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as lacunas
  onProgress: (completed: boolean) => void;
}

type Slots = (string | null)[];

function shuffle<T>(items: T[]) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getSlotClassName(
  value: string | null,
  isActive: boolean,
  isChecked: boolean,
  isCorrect: boolean
) {
  if (isChecked) {
    return isCorrect
      ? 'border-green-600 bg-green-50'
      : 'border-red-500 bg-red-50';
  }
  if (value) {
    return 'border-green-600 bg-green-50';
  }
  return isActive
    ? 'border-dashed border-green-600 bg-green-50'
    : 'border-dashed border-gray-300 bg-gray-50';
}

// Versão para toque do "arrastar e soltar" do site: uma frase por vez, e o
// aluno toca na opção para preencher a lacuna destacada.
export function DragDropActivity({
  activity,
  onProgress,
}: DragDropActivityProps) {
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

  // Como no site, as opções são as respostas de todas as frases, sem
  // repetição e embaralhadas. Uma mesma opção pode ser usada várias vezes.
  const [options] = useState(() => {
    const unique = new Map<string, string>();
    for (const answer of exercises.flatMap((exercise) => exercise.answers)) {
      const key = answer.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, answer);
      }
    }
    return shuffle([...unique.values()]);
  });

  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<Record<string, Slots>>({});
  const [activeSlot, setActiveSlot] = useState(0);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);

  const total = exercises.length;
  if (total === 0) {
    return null;
  }

  const totalBlanks = exercises.reduce(
    (acc, exercise) => acc + exercise.answers.length,
    0
  );
  const correctBlanks = exercises.reduce(
    (acc, exercise) =>
      acc +
      exercise.answers.filter((answer, slot) =>
        isSameAnswer(filled[exercise.id]?.[slot], answer)
      ).length,
    0
  );

  function reset() {
    setIndex(0);
    setFilled({});
    setActiveSlot(0);
    setCheckedIds([]);
    setIsFinished(false);
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
  const slots: Slots = filled[exercise.id] ?? exercise.answers.map(() => null);
  const isChecked = checkedIds.includes(exercise.id);
  const isLast = index === total - 1;
  const isComplete = slots.every((slot) => slot !== null);
  const wrongAnswers = exercise.answers.filter(
    (answer, slot) => !isSameAnswer(slots[slot], answer)
  );

  function setSlots(next: Slots) {
    setFilled((previous) => ({ ...previous, [exercise.id]: next }));
  }

  function handleOptionPress(option: string) {
    if (isChecked) {
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    const next = [...slots];
    next[activeSlot] = option;
    setSlots(next);

    // Passa para a próxima lacuna vazia, começando pela seguinte
    const order = next.map((_, slot) => (activeSlot + 1 + slot) % next.length);
    const nextEmpty = order.find((slot) => next[slot] === null);
    if (nextEmpty !== undefined) {
      setActiveSlot(nextEmpty);
    }
  }

  // Tocar em uma lacuna a seleciona; se já estava preenchida, esvazia
  function handleSlotPress(slot: number) {
    if (isChecked) {
      return;
    }

    setActiveSlot(slot);
    if (slots[slot] !== null) {
      const next = [...slots];
      next[slot] = null;
      setSlots(next);
    }
  }

  function goNext() {
    if (!isLast) {
      setIndex(index + 1);
      setActiveSlot(0);
      return;
    }

    setIsFinished(true);
    onProgress(correctBlanks === totalBlanks);
  }

  return (
    <View className="gap-4">
      {total > 1 ? (
        <View className="gap-2">
          <Text className="font-poppins-medium text-xs text-gray-500">
            Frase {index + 1} de {total}
          </Text>
          <ProgressBar percentage={Math.round((index / total) * 100)} />
        </View>
      ) : null}

      <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-2 rounded-xl bg-gray-50 p-3">
        {exercise.parts.map((part, partIndex) => {
          if (part.type === 'text') {
            // biome-ignore lint/suspicious/noArrayIndexKey: as partes de uma frase não mudam de ordem
            return <SentenceText key={partIndex} text={part.text} />;
          }

          const value = slots[part.index];
          const isCorrect = isSameAnswer(value, part.answer);

          return (
            <Pressable
              key={`slot-${part.index}`}
              accessibilityRole="button"
              accessibilityLabel={
                value
                  ? `Lacuna ${part.index + 1}: ${value}. Toque para esvaziar`
                  : `Lacuna ${part.index + 1}, vazia`
              }
              onPress={() => handleSlotPress(part.index)}
              disabled={isChecked}
              className={`min-h-9 min-w-16 max-w-full items-center justify-center rounded-lg border px-2.5 py-1.5 ${getSlotClassName(value, part.index === activeSlot, isChecked, isCorrect)}`}
            >
              {value ? (
                <Text
                  className={`text-center font-poppins-medium text-sm ${isChecked && !isCorrect ? 'text-red-700' : 'text-green-700'}`}
                >
                  {value}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {isChecked ? (
        <View className="gap-1">
          <Text
            className={`font-poppins-semibold text-sm ${wrongAnswers.length === 0 ? 'text-green-700' : 'text-red-700'}`}
          >
            {wrongAnswers.length === 0
              ? 'Resposta correta!'
              : 'Resposta incorreta.'}
          </Text>
          {wrongAnswers.length > 0 ? (
            <Text className="font-poppins text-sm text-gray-600">
              {exercise.answers.length === 1 ? 'Correto: ' : 'Na ordem: '}
              <Text className="font-poppins-semibold text-green-700">
                {exercise.answers.join(' · ')}
              </Text>
            </Text>
          ) : null}
        </View>
      ) : (
        <View className="gap-2">
          <Text className="font-poppins text-xs text-gray-500">
            Toque em uma opção para preencher a lacuna destacada.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => handleOptionPress(option)}
                className="max-w-full rounded-full border border-gray-200 bg-white px-3.5 py-2 active:border-green-600 active:bg-green-50"
              >
                <Text className="font-poppins-medium text-sm text-gray-900">
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {isChecked ? (
        <Button
          label={isLast ? 'Ver resultado' : 'Próxima frase'}
          onPress={goNext}
        />
      ) : (
        <Button
          label="Verificar resposta"
          onPress={() => setCheckedIds([...checkedIds, exercise.id])}
          disabled={!isComplete}
        />
      )}
    </View>
  );
}
