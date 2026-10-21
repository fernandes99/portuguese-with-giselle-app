import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { SimulationAvatar } from '@/components/simulations/SimulationAvatar';
import { colors } from '@/constants/theme';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import type {
  Simulation,
  SimulationEndReason,
  SimulationStatus,
} from '@/services/simulations';
import { getReviewMessages } from '@/utils/simulations';

// Resumo do fim da simulação, montado com o que o app já tem: as tarefas, o
// comentário do último turno e as frases corrigidas
export function SimulationSummary({
  simulation,
  status,
  endReason,
  feedback,
  endNotice,
  completedTasks,
  messages,
  onRetry,
  onOther,
}: {
  simulation: Simulation;
  status: SimulationStatus;
  endReason: SimulationEndReason | null;
  feedback: string;
  // Por que a simulação parou, quando não foi pelo fim normal
  endNotice: string | null;
  completedTasks: number[];
  messages: ChatMessage[];
  onRetry: () => void;
  onOther: () => void;
}) {
  const isCompleted = status === 'COMPLETED';
  const isInterrupted = endReason === 'DEVIATIONS';
  const title = isCompleted
    ? 'Simulação concluída!'
    : isInterrupted
      ? 'Simulação interrompida'
      : 'Quase lá!';
  const subtitle = isInterrupted
    ? 'A conversa parou porque você saiu das suas tarefas. Veja o que melhorar.'
    : !isCompleted && !endNotice
      ? 'Suas mensagens desta simulação acabaram.'
      : null;
  const review = getReviewMessages(messages);

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="flex-grow gap-5 px-5 pb-6 pt-4">
        {endNotice ? (
          <Text className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center font-poppins text-sm text-amber-800">
            {endNotice}
          </Text>
        ) : null}

        <View className="items-center gap-2">
          <SimulationAvatar avatarUrl={simulation.avatarUrl} size={72} />
          <Text
            accessibilityRole="header"
            className="text-center font-poppins-bold text-2xl text-gray-900"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-center font-poppins text-sm text-gray-600">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {feedback ? (
          <Text className="rounded-2xl border border-gray-200 bg-white p-4 font-poppins text-sm leading-5 text-gray-700">
            {feedback}
          </Text>
        ) : null}

        <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="font-poppins-semibold text-base text-gray-900">
            Tarefas
          </Text>
          {simulation.tasks.map((task, index) => {
            const isDone = completedTasks.includes(index);
            return (
              <View
                key={task}
                accessible
                accessibilityLabel={`${task}, ${isDone ? 'cumprida' : 'não cumprida'}`}
                className="flex-row items-start gap-3"
              >
                <Ionicons
                  name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isDone ? colors.green : colors.gray}
                />
                <Text className="flex-1 font-poppins text-sm text-gray-700">
                  {task}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="gap-3">
          <Text className="font-poppins-semibold text-base text-gray-900">
            Frases para revisar
          </Text>
          {review.length > 0 ? (
            review.map((message) =>
              message.correction ? (
                <CorrectionCard
                  key={message.id}
                  original={message.content}
                  correction={message.correction}
                  onBackground
                />
              ) : null
            )
          ) : (
            <Text className="font-poppins text-sm text-gray-600">
              Nenhuma correção. Muito bem!
            </Text>
          )}
        </View>
      </ScrollView>

      <View className="gap-1 border-t border-gray-200 bg-white px-5 py-4">
        <Button label="Tentar de novo" onPress={onRetry} />
        <Button variant="link" label="Outras simulações" onPress={onOther} />
      </View>
    </View>
  );
}
