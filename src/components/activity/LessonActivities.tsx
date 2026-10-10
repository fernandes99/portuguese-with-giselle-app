import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityAudioProvider } from '@/components/activity/ActivityAudio';
import {
  ACTIVITY_TYPE_LABELS,
  ActivityCard,
} from '@/components/activity/ActivityCard';
import { DragDropActivity } from '@/components/activity/DragDropActivity';
import { FillBlankActivity } from '@/components/activity/FillBlankActivity';
import { MultipleChoiceActivity } from '@/components/activity/MultipleChoiceActivity';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/lesson/EmptyState';
import { colors } from '@/constants/theme';
import type { Activity } from '@/services/lesson';

interface LessonActivitiesProps {
  activities: Activity[];
  onProgress: (activityId: string, completed: boolean) => void;
}

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

// Aba "Atividades" da aula: uma introdução, depois uma atividade por vez
export function LessonActivities({
  activities,
  onProgress,
}: LessonActivitiesProps) {
  const [step, setStep] = useState<Step>('intro');
  // A atividade em andamento já chegou ao resultado
  const [isCurrentFinished, setIsCurrentFinished] = useState(false);

  const total = activities.length;
  const completedCount = activities.filter(
    (activity) => activity.isCompleted
  ).length;

  if (total === 0) {
    return <EmptyState title="Nenhuma atividade disponível" />;
  }

  function goTo(next: Step) {
    setIsCurrentFinished(false);
    setStep(next);
  }

  if (step === 'intro') {
    const firstPending = activities.findIndex(
      (activity) => !activity.isCompleted
    );
    const isAllCompleted = firstPending === -1;

    return (
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
          onPress={() => goTo(isAllCompleted ? 0 : firstPending)}
        />
      </View>
    );
  }

  if (step === 'summary') {
    const isAllCompleted = completedCount === total;

    return (
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
    );
  }

  const activity = activities[step];
  const isLast = step === total - 1;
  const next: Step = isLast ? 'summary' : step + 1;
  const handleProgress = (completed: boolean) =>
    onProgress(activity.id, completed);

  return (
    <ActivityAudioProvider key={activity.id}>
      <View className="gap-4">
        <View className="gap-2">
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

        <ActivityCard activity={activity} number={step + 1}>
          {activity.type === 'multiple_choice' ? (
            <MultipleChoiceActivity
              activity={activity}
              onProgress={handleProgress}
              onFinishedChange={setIsCurrentFinished}
            />
          ) : activity.type === 'fill_blank' ? (
            <FillBlankActivity
              activity={activity}
              onProgress={handleProgress}
              onFinishedChange={setIsCurrentFinished}
            />
          ) : activity.type === 'drag_drop' ? (
            <DragDropActivity
              activity={activity}
              onProgress={handleProgress}
              onFinishedChange={setIsCurrentFinished}
            />
          ) : (
            // Verdadeiro ou falso ainda não foi portado para o app
            <View className="rounded-xl bg-gray-50 p-4">
              <Text className="text-center font-poppins text-sm text-gray-600">
                Este tipo de atividade ainda não está disponível no app. Por
                enquanto, faça pelo site.
              </Text>
            </View>
          )}
        </ActivityCard>

        {isCurrentFinished ? (
          <Button
            label={isLast ? 'Concluir' : 'Próxima atividade'}
            onPress={() => goTo(next)}
          />
        ) : (
          <Button
            variant="link"
            label={isLast ? 'Pular e concluir' : 'Pular atividade'}
            onPress={() => goTo(next)}
          />
        )}
      </View>
    </ActivityAudioProvider>
  );
}
