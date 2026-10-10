import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { HtmlContent } from '@/components/lesson/HtmlContent';
import { colors } from '@/constants/theme';
import type { Activity } from '@/services/lesson';

const TYPE_LABELS: Record<Activity['type'], string> = {
  multiple_choice: 'MÚLTIPLA ESCOLHA',
  true_or_false: 'VERDADEIRO OU FALSO',
  fill_blank: 'PREENCHER LACUNAS',
  drag_drop: 'ARRASTAR E SOLTAR',
};

interface ActivityCardProps {
  activity: Activity;
  // Posição na lista de atividades da aula, começando em 1
  number: number;
  children: ReactNode;
}

// Moldura comum a todos os tipos de atividade: número, tipo, selo de
// concluída, título e enunciado.
export function ActivityCard({
  activity,
  number,
  children,
}: ActivityCardProps) {
  return (
    <View className="gap-4 rounded-2xl border border-gray-100 bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-green-100">
          <Text className="font-poppins-bold text-sm text-green-700">
            {String(number).padStart(2, '0')}
          </Text>
        </View>
        <Text className="flex-1 font-poppins-semibold text-xs tracking-widest text-gray-500">
          {TYPE_LABELS[activity.type]}
        </Text>
        {activity.isCompleted ? (
          <View className="flex-row items-center gap-1 rounded-full bg-green-100 px-2.5 py-1">
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.darkGreen}
            />
            <Text className="font-poppins-medium text-xs text-green-700">
              Concluída
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="font-poppins-semibold text-lg text-gray-900">
        {activity.title}
      </Text>

      {activity.content ? <HtmlContent html={activity.content} /> : null}

      {children}
    </View>
  );
}
