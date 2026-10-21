import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { SimulationAvatar } from '@/components/simulations/SimulationAvatar';
import { SimulationRulesSheet } from '@/components/simulations/SimulationRulesSheet';
import { colors } from '@/constants/theme';
import type { Simulation } from '@/services/simulations';

// Os números das regras; null enquanto a lista não chegou
export interface SimulationRules {
  maxMessages: number;
  maxDeviations: number;
}

// Tela de detalhes de um cenário, antes de começar: a foto, o rosto da
// personagem, a cena, os objetivos, o aviso do feedback no fim e as regras.
// No limite do dia, o botão de começar dá lugar ao aviso.
export function SimulationIntro({
  simulation,
  rules,
  isStarting,
  limitMessage,
  error,
  onStart,
  onBack,
}: {
  simulation: Simulation;
  rules: SimulationRules | null;
  isStarting: boolean;
  // O aluno fez as simulações de hoje; null quando ainda pode começar
  limitMessage: string | null;
  // Falha ao começar, acima do botão
  error: string | null;
  onStart: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const count = simulation.tasks.length;

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="flex-grow gap-4 pb-6">
        <View className="h-[230px] bg-gray-700">
          <Image
            source={{ uri: simulation.thumbnailUrl }}
            resizeMode="cover"
            className="h-full w-full"
          />
          <View
            className="absolute left-4 right-4 flex-row justify-between"
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={onBack}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/90 active:bg-white"
            >
              <Ionicons name="chevron-back" size={22} color={colors.gray} />
            </Pressable>
            {rules ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Como funciona a simulação"
                onPress={() => setIsRulesOpen(true)}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/90 active:bg-white"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={colors.gray}
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Metade do avatar sobre a foto, descontado o espaço entre os blocos */}
        <View className="-mt-14 ml-4 self-start rounded-full border-4 border-background">
          <SimulationAvatar avatarUrl={simulation.avatarUrl} size={72} />
        </View>

        <View className="gap-2 px-5">
          <View className="max-w-full self-start rounded-full bg-surface px-3 py-1">
            <Text
              numberOfLines={1}
              className="font-poppins-semibold text-xs text-gray-700"
            >
              {simulation.category.title}
            </Text>
          </View>
          <Text
            accessibilityRole="header"
            className="font-poppins-bold text-2xl text-gray-900"
          >
            {simulation.title}
          </Text>
          <Text className="font-poppins text-base text-gray-700">
            {simulation.description}
          </Text>
          <Text className="font-poppins text-sm text-gray-500">
            Você vai conversar com:{' '}
            <Text className="font-poppins-semibold text-gray-900">
              {simulation.aiRole}
            </Text>
          </Text>
        </View>

        <View className="mx-5 gap-3 rounded-3xl border border-gray-200 bg-white p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-base text-gray-900">
              Seus objetivos
            </Text>
            <Text className="font-poppins text-sm text-gray-500">{count}</Text>
          </View>
          {simulation.tasks.map((task, index) => (
            <View key={task} className="flex-row items-start gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Text className="font-poppins-bold text-xs text-green-700">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 font-poppins text-sm text-gray-700">
                {task}
              </Text>
            </View>
          ))}
        </View>

        <View className="mx-5 flex-row gap-3 rounded-3xl bg-blue-50 p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-200">
            <Ionicons name="sparkles" size={20} color={colors.blue} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-poppins-semibold text-sm text-gray-900">
              Feedback no final
            </Text>
            <Text className="font-poppins text-sm text-gray-600">
              Ao terminar, você recebe um comentário sobre o seu desempenho, os
              objetivos cumpridos e as frases corrigidas.
            </Text>
          </View>
        </View>

        {rules ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsRulesOpen(true)}
            className="mx-5 flex-row items-center gap-3 rounded-2xl bg-surface p-3.5 active:bg-surface-pressed"
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.green}
            />
            <Text className="flex-1 font-poppins-semibold text-sm text-gray-900">
              Como funciona a simulação
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray} />
          </Pressable>
        ) : null}
      </ScrollView>

      <View className="gap-3 border-t border-gray-200 bg-white px-5 py-4">
        {limitMessage ? (
          <View className="gap-1">
            <Text className="text-center font-poppins-medium text-sm text-gray-900">
              {limitMessage}
            </Text>
            <Text className="text-center font-poppins text-xs text-gray-500">
              Os limites voltam à meia-noite (horário de Brasília).
            </Text>
          </View>
        ) : (
          <>
            {error ? (
              <Text
                accessibilityLiveRegion="polite"
                className="text-center font-poppins text-sm text-red-700"
              >
                {error}
              </Text>
            ) : null}
            <Button
              label={isStarting ? 'Preparando...' : 'Começar simulação'}
              loading={isStarting}
              onPress={onStart}
            />
          </>
        )}
      </View>

      {rules ? (
        <SimulationRulesSheet
          visible={isRulesOpen}
          maxMessages={rules.maxMessages}
          maxDeviations={rules.maxDeviations}
          onClose={() => setIsRulesOpen(false)}
        />
      ) : null}
    </View>
  );
}
