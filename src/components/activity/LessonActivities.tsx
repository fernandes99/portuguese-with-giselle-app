import { Text, View } from 'react-native';

import { ActivityAudioProvider } from '@/components/activity/ActivityAudio';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { MultipleChoiceActivity } from '@/components/activity/MultipleChoiceActivity';
import { EmptyState } from '@/components/lesson/EmptyState';
import type { Activity } from '@/services/lesson';

interface LessonActivitiesProps {
  activities: Activity[];
  onProgress: (activityId: string, completed: boolean) => void;
}

// Aba "Atividades" da aula
export function LessonActivities({
  activities,
  onProgress,
}: LessonActivitiesProps) {
  if (activities.length === 0) {
    return <EmptyState title="Nenhuma atividade disponível" />;
  }

  return (
    <ActivityAudioProvider>
      <View className="gap-5">
        <View className="gap-1">
          <Text className="font-poppins-semibold text-xs tracking-widest text-gray-500">
            PRATIQUE O QUE APRENDEU
          </Text>
          <Text className="font-poppins-semibold text-2xl text-gray-900">
            Atividades da aula
          </Text>
          <Text className="font-poppins text-base text-gray-600">
            Complete os exercícios para avançar no curso.
          </Text>
        </View>

        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            number={index + 1}
          >
            {activity.type === 'multiple_choice' ? (
              <MultipleChoiceActivity
                activity={activity}
                onProgress={(completed) => onProgress(activity.id, completed)}
              />
            ) : (
              // Os outros tipos ainda não foram portados para o app
              <View className="rounded-xl bg-gray-50 p-4">
                <Text className="text-center font-poppins text-sm text-gray-600">
                  Este tipo de atividade ainda não está disponível no app. Por
                  enquanto, faça pelo site.
                </Text>
              </View>
            )}
          </ActivityCard>
        ))}
      </View>
    </ActivityAudioProvider>
  );
}
