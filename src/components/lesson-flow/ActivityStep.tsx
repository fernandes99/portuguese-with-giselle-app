import { Text, View } from 'react-native';

import { ActivityAudioProvider } from '@/components/activity/ActivityAudio';
import { ActivityExercises } from '@/components/activity/ActivityExercises';
import type { Activity } from '@/services/lesson';

interface ActivityStepProps {
  activity: Activity;
  number: number;
  total: number;
  onProgress: (completed: boolean) => void;
  // true quando a atividade chega ao resultado; false se o aluno recomeça
  onFinishedChange: (finished: boolean) => void;
}

// Uma atividade da aula guiada. O rodapé com o "Continuar" volta quando ela
// chega ao resultado.
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
      {/* grow: o exercício ocupa a tela, com o botão no pé */}
      <View className="grow gap-4">
        <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
          Atividade {number} de {total}
        </Text>

        <ActivityExercises
          activity={activity}
          onProgress={onProgress}
          onFinishedChange={onFinishedChange}
        />
      </View>
    </ActivityAudioProvider>
  );
}
