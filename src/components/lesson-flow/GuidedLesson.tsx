import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityStep } from '@/components/lesson-flow/ActivityStep';
import { Congratulations } from '@/components/lesson-flow/Congratulations';
import { ContentStep } from '@/components/lesson-flow/ContentStep';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { FlowHeader } from '@/components/lesson-flow/FlowHeader';
import type { ToastMessage } from '@/components/lesson-flow/FlowToast';
import { hasLessonMedia, IntroStep } from '@/components/lesson-flow/IntroStep';
import { getErrorMessage } from '@/lib/api';
import type { LessonDetail } from '@/services/lesson';
import { getLessonFlow } from '@/utils/lessonFlow';

interface GuidedLessonProps {
  courseSlug: string;
  data: LessonDetail;
  setCompleted: (completed: boolean) => Promise<void>;
  saveActivityProgress: (activityId: string, completed: boolean) => void;
}

// Aula em etapas, para a aula que o aluno ainda não concluiu: introdução,
// conteúdo, atividades uma a uma e, no fim, a tela de parabéns.
export function GuidedLesson({
  courseSlug,
  data,
  setCompleted,
  saveActivityProgress,
}: GuidedLessonProps) {
  const router = useRouter();
  const { lesson } = data;

  // Calculada uma vez: salvar o progresso de uma atividade atualiza a aula,
  // e a ordem e o total das etapas não podem mudar no meio do fluxo
  const [steps] = useState(() => getLessonFlow(lesson));
  // "Recomeçar lição": a aula já estava concluída ao abrir. Nada do que o
  // aluno fizer aqui desfaz o progresso que ele já tem.
  const [isReview] = useState(lesson.isCompleted);
  const [index, setIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  // A atividade da etapa atual já chegou ao resultado
  const [isActivityFinished, setIsActivityFinished] = useState(false);
  // O aluno já tocou no play do vídeo da introdução
  const [hasPlayed, setHasPlayed] = useState(false);
  // Aviso rápido de quando o aluno toca no "Continuar" desabilitado
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const goToLearn = useCallback(() => {
    // dismissTo desempilha a aula: voltar, já no Aprender, não a reabre
    // Ao refazer uma aula, o caminho não tem conclusão nova para animar
    router.dismissTo({
      pathname: '/',
      params: isReview
        ? { course: courseSlug }
        : { course: courseSlug, completed: lesson.id },
    });
  }, [router, courseSlug, lesson.id, isReview]);

  const confirmExit = useCallback(() => {
    Alert.alert(
      'Sair da aula?',
      isReview
        ? 'A aula continua concluída. Você pode recomeçar quando quiser.'
        : 'Você vai recomeçar esta aula do início na próxima vez.',
      [
        { text: 'Continuar na aula', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => router.back() },
      ]
    );
  }, [router, isReview]);

  // Voltar do Android: confirma a saída no meio da aula e, no parabéns, faz
  // o mesmo que o "Continuar"
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isDone) {
            goToLearn();
          } else {
            confirmExit();
          }
          return true;
        }
      );

      return () => subscription.remove();
    }, [isDone, goToLearn, confirmExit])
  );

  async function handleContinue() {
    if (isSaving) {
      return;
    }

    if (!isLast) {
      setIsActivityFinished(false);
      setToast(null);
      setIndex(index + 1);
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      // Refazendo, a aula já está gravada como concluída
      if (!isReview) {
        await setCompleted(true);
      }
      setIsDone(true);
    } catch (err) {
      setError(
        getErrorMessage(err, 'Erro ao concluir a aula. Tente novamente.')
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Sem o gesto de voltar do iOS, que sairia da aula sem a confirmação
  const screenOptions = <Stack.Screen options={{ gestureEnabled: false }} />;

  if (isDone) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        {screenOptions}
        <FlowHeader progress={1} />
        <Congratulations lesson={lesson} onContinue={goToLearn} />
      </SafeAreaView>
    );
  }

  // O estado da atividade (concluída ou não) vem da aula, que é atualizada
  // a cada resposta salva
  const activity =
    step.kind === 'activity'
      ? (lesson.activities.find((item) => item.id === step.activity.id) ??
        step.activity)
      : null;

  // O "Continuar" espera o play na introdução (quando a aula tem vídeo) e o
  // resultado nas atividades
  const needsVideo =
    step.kind === 'intro' && hasLessonMedia(lesson) && !hasPlayed;
  const needsAnswer = step.kind === 'activity' && !isActivityFinished;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {screenOptions}
      <FlowHeader progress={index / steps.length} onClose={confirmExit} />

      <ScrollView
        // A key leva a rolagem de volta ao topo a cada etapa
        key={index}
        // Para os campos das atividades não ficarem atrás do teclado
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow px-5 pb-8 pt-2"
      >
        {step.kind === 'intro' ? (
          <IntroStep lesson={lesson} onPlay={() => setHasPlayed(true)} />
        ) : null}
        {step.kind === 'content' ? <ContentStep lesson={lesson} /> : null}
        {step.kind === 'activity' && activity ? (
          <ActivityStep
            activity={activity}
            number={step.number}
            total={step.total}
            onProgress={(completed) => {
              // Refazendo, um erro não tira a conclusão que a atividade já tem
              if (completed || !isReview) {
                saveActivityProgress(activity.id, completed);
              }
            }}
            onFinishedChange={setIsActivityFinished}
          />
        ) : null}
      </ScrollView>

      <FlowFooter
        onPress={handleContinue}
        disabled={needsVideo || needsAnswer}
        onDisabledPress={() =>
          setToast((current) => ({
            text: needsVideo
              ? 'Inicie o vídeo da aula para continuar.'
              : 'Conclua a atividade para continuar.',
            id: (current?.id ?? 0) + 1,
          }))
        }
        toast={toast}
        loading={isSaving}
        error={error}
      />
    </SafeAreaView>
  );
}
