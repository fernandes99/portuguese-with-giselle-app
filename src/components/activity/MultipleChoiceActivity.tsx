import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';
import type { ActivityFile, ChoiceActivity } from '@/services/lesson';

type Exercise = ChoiceActivity['exercises'][number];
type Alternative = Exercise['alternatives'][number];

interface MultipleChoiceActivityProps {
  activity: ChoiceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as perguntas
  onProgress: (completed: boolean) => void;
}

const LETTERS = 'ABCDEFGHIJ';

function isAudio(file: ActivityFile | null): file is ActivityFile {
  return file?.mimeType.startsWith('audio/') ?? false;
}

function isImage(file: ActivityFile | null): file is ActivityFile {
  return file?.mimeType.startsWith('image/') ?? false;
}

function isAnsweredCorrectly(exercise: Exercise, selected: string[]) {
  return exercise.alternatives.every(
    (alternative) => selected.includes(alternative.id) === alternative.isCorrect
  );
}

function getAlternativeStyle(
  alternative: Alternative,
  isSelected: boolean,
  isChecked: boolean
) {
  if (!isChecked) {
    return isSelected
      ? {
          row: 'border-green-600 bg-green-50',
          chip: 'bg-green-600',
          letter: 'text-white',
        }
      : {
          row: 'border-gray-200 bg-white',
          chip: 'bg-gray-100',
          letter: 'text-gray-600',
        };
  }

  // Depois de verificar, a alternativa correta fica sempre em verde
  if (alternative.isCorrect) {
    return {
      row: 'border-green-600 bg-green-50',
      chip: 'bg-green-600',
      letter: 'text-white',
    };
  }
  if (isSelected) {
    return {
      row: 'border-red-500 bg-red-50',
      chip: 'bg-red-500',
      letter: 'text-white',
    };
  }
  return {
    row: 'border-gray-200 bg-white opacity-60',
    chip: 'bg-gray-100',
    letter: 'text-gray-600',
  };
}

// Uma pergunta por vez: escolher, verificar, avançar. No fim mostra o placar.
export function MultipleChoiceActivity({
  activity,
  onProgress,
}: MultipleChoiceActivityProps) {
  const { exercises } = activity;
  const audio = useActivityAudio();

  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);

  const total = exercises.length;
  if (total === 0) {
    return null;
  }

  const correctCount = exercises.filter((exercise) =>
    isAnsweredCorrectly(exercise, selections[exercise.id] ?? [])
  ).length;

  function reset() {
    audio.stop();
    setIndex(0);
    setSelections({});
    setCheckedIds([]);
    setIsFinished(false);
  }

  if (isFinished) {
    const isAllCorrect = correctCount === total;

    return (
      <View className="items-center gap-3 rounded-xl bg-gray-50 p-5">
        <Ionicons
          name={isAllCorrect ? 'trophy' : 'ribbon-outline'}
          size={36}
          color={isAllCorrect ? colors.green : colors.gray}
        />
        <Text className="text-center font-poppins-bold text-lg text-gray-900">
          Você acertou {correctCount} de {total}
        </Text>
        <Text className="text-center font-poppins text-sm text-gray-600">
          {isAllCorrect
            ? 'Parabéns! Atividade concluída.'
            : 'Acerte todas as perguntas para concluir a atividade.'}
        </Text>
        <Button variant="link" label="Tentar de novo" onPress={reset} />
      </View>
    );
  }

  const exercise = exercises[index];
  const selected = selections[exercise.id] ?? [];
  const isChecked = checkedIds.includes(exercise.id);
  const isCorrect = isAnsweredCorrectly(exercise, selected);
  const isLast = index === total - 1;
  const allowsMultiple =
    exercise.alternatives.filter((alternative) => alternative.isCorrect)
      .length !== 1;

  function select(alternativeId: string) {
    if (isChecked) {
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

  function goNext() {
    audio.stop();

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    setIsFinished(true);
    onProgress(correctCount === total);
  }

  return (
    <View className="gap-4">
      {total > 1 ? (
        <View className="gap-2">
          <Text className="font-poppins-medium text-xs text-gray-500">
            Pergunta {index + 1} de {total}
          </Text>
          <ProgressBar percentage={Math.round((index / total) * 100)} />
        </View>
      ) : null}

      <View className="gap-3">
        {exercise.question ? (
          <Text className="font-poppins-medium text-lg text-gray-900">
            {exercise.question}
          </Text>
        ) : null}
        {isAudio(exercise.file) ? (
          <AudioButton url={exercise.file.url} label="Ouvir" />
        ) : null}
        {isImage(exercise.file) ? (
          <Image
            source={{ uri: `${exercise.file.url}?w=800&auto=compress` }}
            resizeMode="contain"
            className="h-44 w-full rounded-lg bg-gray-100"
          />
        ) : null}
        {allowsMultiple ? (
          <Text className="font-poppins text-xs text-gray-500">
            Selecione todas as alternativas corretas.
          </Text>
        ) : null}
      </View>

      <View className="gap-3">
        {exercise.alternatives.map((alternative, position) => {
          const isSelected = selected.includes(alternative.id);
          const style = getAlternativeStyle(alternative, isSelected, isChecked);

          return (
            <Pressable
              key={alternative.id}
              accessibilityRole={allowsMultiple ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: isSelected, disabled: isChecked }}
              onPress={() => select(alternative.id)}
              className={`gap-3 rounded-xl border p-3 ${style.row}`}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-8 w-8 items-center justify-center rounded-lg ${style.chip}`}
                >
                  <Text className={`font-poppins-bold text-sm ${style.letter}`}>
                    {LETTERS[position] ?? position + 1}
                  </Text>
                </View>
                <Text className="flex-1 font-poppins text-base text-gray-900">
                  {alternative.title}
                </Text>
                {isAudio(alternative.file) ? (
                  <AudioButton url={alternative.file.url} />
                ) : null}
                {isChecked && alternative.isCorrect ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.green}
                  />
                ) : null}
                {isChecked && isSelected && !alternative.isCorrect ? (
                  <Ionicons name="close-circle" size={22} color={colors.red} />
                ) : null}
              </View>
              {isImage(alternative.file) ? (
                <Image
                  source={{
                    uri: `${alternative.file.url}?w=600&auto=compress`,
                  }}
                  resizeMode="contain"
                  className="h-32 w-full rounded-lg bg-gray-100"
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {isChecked ? (
        <Text
          className={`font-poppins-semibold text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
        >
          {isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
        </Text>
      ) : null}

      {isChecked ? (
        <Button
          label={isLast ? 'Ver resultado' : 'Próxima pergunta'}
          onPress={goNext}
        />
      ) : (
        <Button
          label="Verificar resposta"
          onPress={() => setCheckedIds([...checkedIds, exercise.id])}
          disabled={selected.length === 0}
        />
      )}
    </View>
  );
}
