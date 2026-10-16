import { Text, View } from 'react-native';

import { ActivityAudioProvider } from '@/components/activity/ActivityAudio';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { DragDropActivity } from '@/components/activity/DragDropActivity';
import { FillBlankActivity } from '@/components/activity/FillBlankActivity';
import { MultipleChoiceActivity } from '@/components/activity/MultipleChoiceActivity';
import type { Activity } from '@/services/lesson';

interface ActivityStepProps {
  activity: Activity;
  number: number;
  total: number;
  onProgress: (completed: boolean) => void;
  // true quando a atividade chega ao resultado; false se o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

// Uma atividade da aula guiada. O "Continuar" do rodapé só é liberado quando
// ela chega ao resultado.
export function ActivityStep({
  activity,
  number,
  total,
  onProgress,
  onFinishedChange,
}: ActivityStepProps) {
  return (
    // A key evita que o áudio de uma atividade vaze para a seguinte
    <ActivityAudioProvider key={activity.id}>
      {/* grow: a múltipla escolha ocupa a tela, com o botão no pé */}
      <View className="grow gap-4">
        <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
          Atividade {number} de {total}
        </Text>

        {/* A múltipla escolha mostra um exercício por tela, sem o cartão */}
        {activity.type === 'multiple_choice' ? (
          <MultipleChoiceActivity
            activity={activity}
            onProgress={onProgress}
            onFinishedChange={onFinishedChange}
          />
        ) : (
          <ActivityCard activity={activity} number={number}>
            {activity.type === 'fill_blank' ? (
              <FillBlankActivity
                activity={activity}
                onProgress={onProgress}
                onFinishedChange={onFinishedChange}
              />
            ) : null}
            {activity.type === 'drag_drop' ? (
              <DragDropActivity
                activity={activity}
                onProgress={onProgress}
                onFinishedChange={onFinishedChange}
              />
            ) : null}
          </ActivityCard>
        )}
      </View>
    </ActivityAudioProvider>
  );
}
