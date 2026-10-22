import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActivityInfoSheet } from '@/components/activity/ActivityInfoSheet';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';

interface ExerciseHeaderProps {
  // Posição do exercício atual, começando em 0
  index: number;
  total: number;
  // O exercício atual já foi verificado: a barra conta ele como feito
  isChecked: boolean;
  title: string;
  // HTML com o enunciado da atividade
  content: string | null;
  // No lugar de "posição/total" (a atividade de vocabulário mostra as
  // resolvidas, porque a errada volta para o fim)
  counter?: string;
}

// Topo dos exercícios de uma tela só: barra de progresso, contador e o botão
// "Instruções", que abre o título e o enunciado completo da atividade
export function ExerciseHeader({
  index,
  total,
  isChecked,
  title,
  content,
  counter,
}: ExerciseHeaderProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const hasInfo = Boolean(title.trim() || content?.trim());
  const answeredCount = index + (isChecked ? 1 : 0);

  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <ProgressBar percentage={Math.round((answeredCount / total) * 100)} />
      </View>
      <Text className="font-poppins-medium text-xs text-gray-500">
        {counter ?? `${index + 1}/${total}`}
      </Text>
      {hasInfo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver as instruções da atividade"
          onPress={() => setIsInfoOpen(true)}
          hitSlop={8}
          className="flex-row items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 active:bg-gray-50"
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.gray}
          />
          <Text className="font-poppins-medium text-xs text-gray-600">
            Instruções
          </Text>
        </Pressable>
      ) : null}

      <ActivityInfoSheet
        visible={isInfoOpen}
        title={title}
        content={content}
        onClose={() => setIsInfoOpen(false)}
      />
    </View>
  );
}
