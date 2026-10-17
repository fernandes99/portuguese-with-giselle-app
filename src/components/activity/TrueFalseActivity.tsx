import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { ActivityInfoSheet } from '@/components/activity/ActivityInfoSheet';
import { ActivityResult } from '@/components/activity/ActivityResult';
import {
  ALTERNATIVE_STYLES,
  getAlternativeState,
} from '@/components/activity/ChoiceAlternatives';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { SentenceText } from '@/components/activity/SentenceText';
import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type { ActivityFile, ChoiceActivity } from '@/services/lesson';
import { isAudio, isImage } from '@/utils/choice';
import { getStatements, type Statement } from '@/utils/trueFalse';

interface TrueFalseActivityProps {
  activity: ChoiceActivity;
  // false ao começar ou errar; true quando o aluno acerta todas as afirmações
  onProgress: (completed: boolean) => void;
  // Avisa quando a atividade chega ao resultado, e quando o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

interface StatementFeedback {
  statement: Statement;
  isCorrect: boolean;
  isLast: boolean;
}

const OPTIONS = [
  { value: true, label: 'Verdadeiro', icon: 'checkmark-circle-outline' },
  { value: false, label: 'Falso', icon: 'close-circle-outline' },
] as const;

function getOptionLabel(value: boolean) {
  return value ? 'Verdadeiro' : 'Falso';
}

// Áudio ou imagem de um exercício ou de uma afirmação
function StatementMedia({ file }: { file: ActivityFile | null }) {
  return (
    <>
      {isAudio(file) ? (
        <View className="items-center">
          <AudioButton url={file.url} label="Ouvir" />
        </View>
      ) : null}
      {isImage(file) ? (
        <Image
          source={{ uri: `${file.url}?w=800&auto=compress` }}
          resizeMode="contain"
          className="h-48 w-full rounded-2xl bg-gray-100"
        />
      ) : null}
    </>
  );
}

// Uma afirmação por tela, no estilo dos apps de idioma: o aluno escolhe
// "Verdadeiro" ou "Falso", verifica e vê o painel de acerto ou erro. As
// afirmações dependem do texto da atividade (uma transcrição ou um texto de
// leitura), que abre pelo cartão "Ler o texto".
export function TrueFalseActivity({
  activity,
  onProgress,
  onFinishedChange,
}: TrueFalseActivityProps) {
  const statements = useMemo(
    () => getStatements(activity.exercises),
    [activity.exercises]
  );
  const { stop } = useActivityAudio();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<StatementFeedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const hasStarted = useRef(false);

  const total = statements.length;
  if (total === 0) {
    return null;
  }

  const correctCount = statements.filter(
    (item) => answers[item.id] === item.isTrue
  ).length;

  function reset() {
    stop();
    setIndex(0);
    setAnswers({});
    setCheckedIds([]);
    setFeedback(null);
    setIsFinished(false);
    onFinishedChange(false);
  }

  if (isFinished) {
    return (
      <ActivityResult
        correct={correctCount}
        total={total}
        unit={total === 1 ? 'afirmação' : 'afirmações'}
        onRetry={reset}
      />
    );
  }

  const statement = statements[index];
  const answer: boolean | undefined = answers[statement.id];
  const isChecked = checkedIds.includes(statement.id);
  const isLast = index === total - 1;
  const hasText = Boolean(activity.content?.trim());

  function choose(value: boolean) {
    if (isChecked) {
      return;
    }

    if (!hasStarted.current) {
      hasStarted.current = true;
      onProgress(false);
    }

    setAnswers((previous) => ({ ...previous, [statement.id]: value }));
  }

  function check() {
    stop();
    setCheckedIds((previous) => [...previous, statement.id]);
    setFeedback({
      statement,
      isCorrect: answer === statement.isTrue,
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

      <Text className="text-center font-poppins-bold text-xl text-gray-900">
        Verdadeiro ou falso?
      </Text>

      {hasText ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ler o texto da atividade"
          onPress={() => setIsTextOpen(true)}
          className="flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 active:bg-gray-50"
        >
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <Ionicons
              name="document-text-outline"
              size={22}
              color={colors.blue}
            />
          </View>
          <View className="flex-1">
            <Text className="font-poppins-semibold text-sm text-gray-900">
              Ler o texto
            </Text>
            <Text className="font-poppins text-xs text-gray-500">
              Você vai precisar dele para responder.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </Pressable>
      ) : null}

      <StatementMedia file={statement.exerciseFile} />

      <View className="items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1">
          <SentenceText text={statement.text} size="lg" />
        </View>
        <StatementMedia file={statement.file} />
      </View>

      <View className="flex-row gap-3">
        {OPTIONS.map((option) => {
          const isSelected = answer === option.value;
          const style =
            ALTERNATIVE_STYLES[
              getAlternativeState(
                option.value === statement.isTrue,
                isSelected,
                isChecked
              )
            ];

          return (
            <Pressable
              key={option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isChecked }}
              disabled={isChecked}
              onPress={() => choose(option.value)}
              className={`flex-1 items-center gap-2 rounded-2xl border-2 px-3 py-5 ${style.box}`}
            >
              <Ionicons name={option.icon} size={30} color={style.icon} />
              <Text className="font-poppins-semibold text-base text-gray-900">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Empurra o botão para o pé da tela na aula guiada */}
      <View className="grow" />

      <Button
        size="lg"
        label="Verificar"
        onPress={check}
        disabled={answer === undefined || isChecked}
      />

      {feedback ? (
        <ExerciseFeedbackSheet
          visible={isFeedbackOpen}
          isCorrect={feedback.isCorrect}
          isLast={feedback.isLast}
          answerLabel="Resposta certa:"
          answer={
            <Text className="font-poppins-medium text-base text-gray-900">
              {getOptionLabel(feedback.statement.isTrue)}
            </Text>
          }
          onContinue={goNext}
        />
      ) : null}

      <ActivityInfoSheet
        visible={isTextOpen}
        title={activity.title}
        content={activity.content}
        onClose={() => setIsTextOpen(false)}
      />
    </View>
  );
}
