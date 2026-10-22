import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityAudioProvider } from '@/components/activity/ActivityAudio';
import { ActivityExercises } from '@/components/activity/ActivityExercises';
import {
  ActivityFooter,
  ActivityFooterProvider,
  ActivityScrollView,
} from '@/components/activity/ActivityFooter';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/lesson/EmptyState';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { colors } from '@/constants/theme';
import type { Activity } from '@/services/lesson';
import { isPlayableActivity } from '@/utils/activityScreens';

interface LessonActivitiesProps {
  activities: Activity[];
  onProgress: (activityId: string, completed: boolean) => void;
}

const ACTIVITY_TYPE_LABELS: Record<Activity['type'], string> = {
  multiple_choice: 'MÚLTIPLA ESCOLHA',
  true_or_false: 'VERDADEIRO OU FALSO',
  fill_blank: 'PREENCHER LACUNAS',
  drag_drop: 'ARRASTAR E SOLTAR',
  vocabulary: 'VOCABULÁRIO',
};

// intro: apresentação; número: atividade em andamento; summary: fechamento
type Step = 'intro' | 'summary' | number;

function formatCount(count: number) {
  return `${count} ${count === 1 ? 'atividade' : 'atividades'}`;
}

function getSegmentClassName(position: number, current: number) {
  if (position < current) return 'bg-green-600';
  if (position === current) return 'bg-gray-900';
  return 'bg-gray-200';
}

// Aba "Atividades" da aula: uma introdução e, ao começar, um modal de tela
// cheia com uma atividade por vez
export function LessonActivities({
  activities: allActivities,
  onProgress,
}: LessonActivitiesProps) {
  // Atividades sem nenhum exercício (só com o enunciado no CMS) ficam de fora
  const activities = useMemo(
    () => allActivities.filter(isPlayableActivity),
    [allActivities]
  );
  const [step, setStep] = useState<Step>('intro');
  // Última atividade aberta: o modal continua mostrando ela enquanto desce
  const [runnerStep, setRunnerStep] = useState(0);
  // Sobe a cada abertura, para o modal começar do zero mesmo que reabra
  // antes de terminar de descer
  const [session, setSession] = useState(0);

  const total = activities.length;
  const completedCount = activities.filter(
    (activity) => activity.isCompleted
  ).length;

  if (total === 0) {
    return <EmptyState title="Nenhuma atividade disponível" />;
  }

  function goTo(next: Step) {
    if (typeof next === 'number') {
      setRunnerStep(next);
    }
    setStep(next);
  }

  function open(index: number) {
    setSession((value) => value + 1);
    goTo(index);
  }

  const runner = (
    <ActivityRunner
      key={session}
      visible={typeof step === 'number'}
      activities={activities}
      step={runnerStep}
      onProgress={onProgress}
      onGoTo={goTo}
    />
  );

  if (step === 'summary') {
    const isAllCompleted = completedCount === total;

    return (
      <>
        <View className="items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6">
          <Ionicons
            name={isAllCompleted ? 'trophy' : 'ribbon-outline'}
            size={44}
            color={isAllCompleted ? colors.green : colors.gray}
          />
          <Text className="text-center font-poppins-bold text-xl text-gray-900">
            {isAllCompleted ? 'Atividades concluídas!' : 'Você chegou ao fim'}
          </Text>
          <Text className="text-center font-poppins text-base text-gray-600">
            {completedCount} de {formatCount(total)}{' '}
            {completedCount === 1 ? 'concluída' : 'concluídas'}.
            {isAllCompleted ? '' : ' Refaça as que faltam para concluir todas.'}
          </Text>
          <View className="mt-2 w-full">
            <Button label="Voltar ao início" onPress={() => goTo('intro')} />
          </View>
        </View>
        {runner}
      </>
    );
  }

  // Com uma atividade em andamento, a introdução fica atrás do modal
  const firstPending = activities.findIndex(
    (activity) => !activity.isCompleted
  );
  const isAllCompleted = firstPending === -1;

  // O modal fica na mesma posição nas duas telas (introdução e fechamento):
  // se mudasse de lugar, o React o recriaria e a animação de saída se perderia
  return (
    <>
      <View className="gap-5">
        <View className="gap-1">
          <Text className="font-poppins-semibold text-xs tracking-widest text-gray-500">
            PRATIQUE O QUE APRENDEU
          </Text>
          <Text className="font-poppins-semibold text-2xl text-gray-900">
            Atividades da aula
          </Text>
          <Text className="font-poppins text-base text-gray-600">
            Esta aula tem {formatCount(total)}. Faça uma de cada vez para fixar
            o conteúdo.
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-100 bg-white">
          {activities.map((activity, index) => (
            <View
              key={activity.id}
              className={`flex-row items-center gap-3 p-4 ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                <Text className="font-poppins-bold text-sm text-green-700">
                  {String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-poppins-semibold text-xs tracking-widest text-gray-500">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </Text>
                <Text
                  numberOfLines={2}
                  className="font-poppins-medium text-sm text-gray-900"
                >
                  {activity.title}
                </Text>
              </View>
              {activity.isCompleted ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.green}
                />
              ) : null}
            </View>
          ))}
        </View>

        {completedCount > 0 ? (
          <Text className="text-center font-poppins text-sm text-gray-600">
            {completedCount} de {formatCount(total)}{' '}
            {completedCount === 1 ? 'concluída' : 'concluídas'}
          </Text>
        ) : null}

        <Button
          label={
            isAllCompleted
              ? 'Refazer atividades'
              : completedCount > 0
                ? 'Continuar atividades'
                : 'Iniciar atividades'
          }
          onPress={() => open(isAllCompleted ? 0 : firstPending)}
        />
      </View>
      {runner}
    </>
  );
}

interface ActivityRunnerProps {
  visible: boolean;
  activities: Activity[];
  step: number;
  onProgress: (activityId: string, completed: boolean) => void;
  onGoTo: (next: Step) => void;
}

// Modal de tela cheia com a atividade em andamento, sem as abas da aula. Fica
// montado ao fechar, para o Modal descer com a animação antes de sumir.
function ActivityRunner({
  visible,
  activities,
  step,
  onProgress,
  onGoTo,
}: ActivityRunnerProps) {
  const insets = useSafeAreaInsets();
  // A atividade em andamento já chegou ao resultado
  const [isCurrentFinished, setIsCurrentFinished] = useState(false);

  const total = activities.length;
  const activity = activities[step];
  const isLast = step === total - 1;
  const next: Step = isLast ? 'summary' : step + 1;
  const handleProgress = (completed: boolean) =>
    onProgress(activity.id, completed);

  function goTo(target: Step) {
    // Ao fechar, a tela fica como está enquanto o modal desce
    if (typeof target === 'number') {
      setIsCurrentFinished(false);
    }
    onGoTo(target);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => goTo('intro')}
    >
      {/* O Modal é outra janela: a área segura vem da tela de fora. A de
      baixo fica por conta do rodapé. */}
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top + 8 }}
      >
        <ActivityAudioProvider key={activity.id}>
          <ActivityFooterProvider>
            <View className="gap-2 px-5 pb-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-poppins-semibold text-sm text-gray-900">
                  Atividade {step + 1} de {total}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sair das atividades"
                  onPress={() => goTo('intro')}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={22} color={colors.gray} />
                </Pressable>
              </View>

              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: total, now: step }}
                className="flex-row gap-1.5"
              >
                {activities.map((item, position) => (
                  <View
                    key={item.id}
                    className={`h-1.5 flex-1 rounded-full ${getSegmentClassName(position, step)}`}
                  />
                ))}
              </View>
            </View>

            {/* Rola o campo focado das lacunas para cima do teclado e do
          rodapé */}
            <ActivityScrollView
              // A key leva a rolagem de volta ao topo a cada atividade
              key={step}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="flex-grow gap-4 px-5 pb-4 pt-4"
            >
              <ActivityExercises
                activity={activity}
                onProgress={handleProgress}
                onFinishedChange={setIsCurrentFinished}
              />
            </ActivityScrollView>

            {/* Respondendo: "Verificar" e "Pular atividade", que sobem com o
          teclado. No placar: o botão que avança. */}
            {isCurrentFinished ? (
              <FlowFooter
                label={isLast ? 'Concluir' : 'Próxima atividade'}
                onPress={() => goTo(next)}
              />
            ) : (
              <ActivityFooter
                skipLabel={isLast ? 'Pular e concluir' : 'Pular atividade'}
                onSkip={() => goTo(next)}
              />
            )}
          </ActivityFooterProvider>
        </ActivityAudioProvider>
      </View>
    </Modal>
  );
}
