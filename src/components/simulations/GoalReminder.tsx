import warningSound from '@assets/sounds/warning.wav';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { type ComponentProps, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import type {
  SimulationDeviationKind,
  SimulationGoalReminder,
} from '@/services/simulations';

// Âmbar do ícone do aviso (amber-600)
const WARNING_COLOR = '#d97706';

const ICONS: Record<
  SimulationDeviationKind,
  ComponentProps<typeof Ionicons>['name']
> = {
  AGAINST_TASK: 'flag-outline',
  OFF_TOPIC: 'compass-outline',
  OTHER_LANGUAGE: 'chatbubble-ellipses-outline',
};

// Aviso por cima da conversa quando o aluno vai contra uma tarefa, sai da
// cena ou escreve em outro idioma: lembra a tarefa (ou todas as que faltam)
// e quantos avisos faltam para a simulação ser interrompida. Cada aviso
// novo toca o som de atenção.
export function GoalReminder({
  reminder,
  tasks,
  pendingTasks,
  onClose,
}: {
  reminder: SimulationGoalReminder | null;
  tasks: string[];
  // As tarefas que ainda faltam, pela posição
  pendingTasks: number[];
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const player = useAudioPlayer(warningSound);

  // Um aviso novo chega como outro objeto, a cada turno com desvio
  useEffect(() => {
    if (!reminder) {
      return;
    }
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => undefined);
  }, [reminder, player]);

  if (!reminder) {
    return null;
  }

  const shown =
    reminder.task !== null && tasks[reminder.task]
      ? [reminder.task]
      : pendingTasks;
  const isLast = reminder.count >= reminder.max - 1;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View
          accessibilityViewIsModal
          className="w-full gap-4 rounded-3xl bg-white p-6"
        >
          <View className="items-center gap-2">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <Ionicons
                name={ICONS[reminder.kind]}
                size={24}
                color={WARNING_COLOR}
              />
            </View>
            <Text
              accessibilityRole="header"
              className="text-center font-poppins-bold text-lg text-gray-900"
            >
              {t(`practice.simulations.reminder.titles.${reminder.kind}`)}
            </Text>
            <Text className="text-center font-poppins text-sm leading-5 text-gray-600">
              {/* Sem o motivo do backend, vale o texto do tipo */}
              {reminder.reason ||
                t(`practice.simulations.reminder.reasons.${reminder.kind}`)}
            </Text>
          </View>

          {shown.length > 0 ? (
            <View className="gap-2 rounded-2xl border border-gray-200 bg-background p-4">
              <Text className="font-poppins-semibold text-xs uppercase text-gray-500">
                {t(
                  shown.length === 1
                    ? 'practice.simulations.reminder.yourTask'
                    : 'practice.simulations.reminder.yourTasks'
                )}
              </Text>
              {shown.map((task) => (
                <View key={task} className="flex-row items-start gap-2">
                  <Ionicons
                    name="ellipse-outline"
                    size={16}
                    color={colors.gray}
                  />
                  <Text className="flex-1 font-poppins text-sm text-gray-800">
                    {tasks[task]}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text className="text-center font-poppins-medium text-xs text-amber-800">
            {t('practice.simulations.reminder.warning', {
              current: reminder.count,
              total: reminder.max - 1,
            })}{' '}
            {isLast
              ? t('practice.simulations.reminder.nextStops')
              : t('practice.simulations.reminder.stopsAt', {
                  max: reminder.max,
                })}
          </Text>

          <Button label={t('lesson.exercise.gotIt')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
