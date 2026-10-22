import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Text, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityResult } from '@/components/activity/ActivityResult';
import { ExerciseFeedbackSheet } from '@/components/activity/ExerciseFeedbackSheet';
import { ExerciseHeader } from '@/components/activity/ExerciseHeader';
import { VocabularyAnswer } from '@/components/activity/vocabulary/VocabularyAnswer';
import { VocabularyChoice } from '@/components/activity/vocabulary/VocabularyChoice';
import { VocabularyPairs } from '@/components/activity/vocabulary/VocabularyPairs';
import { VocabularySpeak } from '@/components/activity/vocabulary/VocabularySpeak';
import { VocabularyWrite } from '@/components/activity/vocabulary/VocabularyWrite';
import { EmptyState } from '@/components/lesson/EmptyState';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { PronunciationResult } from '@/components/vocabulary/PronunciationResult';
import type { PronunciationUnavailableReason } from '@/hooks/usePronunciationRecorder';
import { useVocabularyQueue } from '@/hooks/useVocabularyQueue';
import type {
  VocabularyActivity as VocabularyActivityData,
  VocabularyExerciseType,
} from '@/services/lesson';
import type { PronunciationEvaluation } from '@/services/vocabulary';
import {
  answerQuestion,
  finishPairs,
  isQueueFinished,
  skipQuestion,
  skipSpeakQuestions,
  type VocabularyQueue,
} from '@/utils/vocabularyActivity';

interface VocabularyActivityProps {
  activity: VocabularyActivityData;
  // false na primeira resposta; true quando a fila acaba
  onProgress: (completed: boolean) => void;
  // Avisa quando a atividade chega ao placar, e quando o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

// O texto acima da pergunta, por tipo
const EXERCISE_TITLES: Record<VocabularyExerciseType, string> = {
  meaning_choice: 'Escolha o significado',
  term_choice: 'Escolha a palavra',
  listen_choice: 'Ouça e escolha a palavra',
  listen_write: 'Ouça e escreva o que ouviu',
  translate_write: 'Escreva em português',
  match_pairs: 'Ligue os pares',
  listen_example: 'Ouça a frase e escolha a tradução',
  speak: 'Fale a palavra',
};

// O painel aberto depois de uma resposta: o que mostrar e o que fazer com a
// fila no "Continuar"
interface Feedback {
  isCorrect: boolean;
  isLast: boolean;
  answerLabel: string;
  answer: ReactNode;
  update: (queue: VocabularyQueue) => VocabularyQueue;
}

// Atividade montada a partir do vocabulário (as perguntas vêm prontas do
// site): uma pergunta por tela, a errada volta para o fim, e a atividade
// conclui quando a fila esvazia
export function VocabularyActivity({
  activity,
  onProgress,
  onFinishedChange,
}: VocabularyActivityProps) {
  const { stop } = useActivityAudio();
  const { queue, current, turn, apply, restart } = useVocabularyQueue(
    activity.questions
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [unavailable, setUnavailable] =
    useState<PronunciationUnavailableReason | null>(null);
  const hasStarted = useRef(false);
  const isFinished = activity.questions.length > 0 && isQueueFinished(queue);

  const markStarted = useCallback(() => {
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;
    onProgress(false);
  }, [onProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: avisa só quando a fila acaba
  useEffect(() => {
    if (isFinished) {
      onFinishedChange(true);
      onProgress(true);
    }
  }, [isFinished]);

  const isLastQuestion = queue.pending.length === 1;

  const openFeedback = useCallback((next: Feedback) => {
    setFeedback(next);
    setIsFeedbackOpen(true);
  }, []);

  function goNext() {
    stop();
    setIsFeedbackOpen(false);
    if (feedback) {
      apply(feedback.update);
    }
  }

  const handleUnavailable = useCallback(
    (reason: PronunciationUnavailableReason) => {
      setUnavailable(reason);
      apply(skipSpeakQuestions);
    },
    [apply]
  );

  const handleEvaluated = useCallback(
    (evaluation: PronunciationEvaluation) => {
      const isCorrect = evaluation.result === 'correct';
      openFeedback({
        isCorrect,
        isLast: isLastQuestion && isCorrect,
        answerLabel: 'O que ouvimos:',
        answer: (
          <PronunciationResult evaluation={evaluation} termAudioUrl={null} />
        ),
        update: (queue) => answerQuestion(queue, isCorrect),
      });
    },
    [isLastQuestion, openFeedback]
  );

  function handleRetry() {
    stop();
    setFeedback(null);
    restart();
    onFinishedChange(false);
  }

  if (activity.questions.length === 0) {
    return <EmptyState title="Esta atividade ainda não está disponível." />;
  }

  if (isFinished) {
    return (
      <ActivityResult
        correct={queue.firstTry}
        total={queue.total}
        unit="de primeira"
        message="Atividade concluída."
        onRetry={handleRetry}
      />
    );
  }

  function renderQuestion() {
    if (!current) {
      return null;
    }
    const key = `${current.id}-${turn}`;

    if (current.kind === 'choice' || current.kind === 'write') {
      const question = current;
      const onChecked = (isCorrect: boolean) =>
        openFeedback({
          isCorrect,
          isLast: isLastQuestion && isCorrect,
          answerLabel: 'Resposta certa:',
          answer: (
            <VocabularyAnswer
              answer={question.answer}
              showExample={question.exerciseType === 'listen_example'}
            />
          ),
          update: (queue) => answerQuestion(queue, isCorrect),
        });

      return question.kind === 'choice' ? (
        <VocabularyChoice
          key={key}
          question={question}
          exerciseType={question.exerciseType}
          onInteract={markStarted}
          onChecked={onChecked}
        />
      ) : (
        <VocabularyWrite
          key={key}
          question={question}
          exerciseType={question.exerciseType}
          onInteract={markStarted}
          onChecked={onChecked}
        />
      );
    }

    if (current.kind === 'pairs') {
      return (
        <VocabularyPairs
          key={key}
          question={current}
          onInteract={markStarted}
          onFinished={(hadMistake) =>
            openFeedback({
              isCorrect: true,
              isLast: isLastQuestion,
              answerLabel: '',
              answer: null,
              update: (queue) => finishPairs(queue, hadMistake),
            })
          }
        />
      );
    }

    return (
      <VocabularySpeak
        key={key}
        question={current}
        onInteract={markStarted}
        onEvaluated={handleEvaluated}
        onSkip={() => apply(skipQuestion)}
        onUnavailable={handleUnavailable}
      />
    );
  }

  return (
    <View className="grow gap-6">
      <ExerciseHeader
        index={Math.min(queue.resolved, queue.total - 1)}
        total={queue.total}
        isChecked={false}
        title={activity.title}
        content={activity.content}
      />

      <Text className="font-poppins-semibold text-lg text-gray-900">
        {current ? EXERCISE_TITLES[current.exerciseType] : null}
      </Text>

      {unavailable ? (
        <View className="flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          {unavailable === 'subscribers_only' ? <PremiumBadge /> : null}
          <Text className="flex-1 font-poppins text-sm text-amber-800">
            {unavailable === 'daily_limit'
              ? 'Você usou as conferências de pronúncia de hoje.'
              : 'A verificação de pronúncia é exclusiva do Premium.'}
          </Text>
        </View>
      ) : null}

      {renderQuestion()}

      {feedback ? (
        <ExerciseFeedbackSheet
          visible={isFeedbackOpen}
          isCorrect={feedback.isCorrect}
          isLast={feedback.isLast}
          answerLabel={feedback.answerLabel}
          answer={feedback.answer}
          onContinue={goNext}
        />
      ) : null}
    </View>
  );
}
