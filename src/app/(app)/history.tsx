import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { colors } from '@/constants/theme';
import { useHistory } from '@/hooks/useHistory';
import type {
  HistoryAction,
  HistoryEntity,
  HistoryEntry,
} from '@/services/history';
import { formatDateTime } from '@/utils/date';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Os mesmos nomes da área da professora, no site
const ENTITIES: Record<HistoryEntity, { label: string; icon: IconName }> = {
  COURSE: { label: 'Curso', icon: 'school' },
  MODULE: { label: 'Módulo', icon: 'layers' },
  LESSON: { label: 'Aula', icon: 'play' },
  ACTIVITY: { label: 'Atividade', icon: 'pencil' },
  FLASHCARD: { label: 'Flashcard', icon: 'albums' },
  SIMULATION: { label: 'Simulação', icon: 'chatbubbles' },
  HOMEWORK: { label: 'Lição de casa', icon: 'document-text' },
};

// A cor do ícone e o texto vêm da situação do item
const ACTIONS: Record<
  HistoryAction,
  { label: string; iconClassName: string; textClassName: string; color: string }
> = {
  STARTED: {
    label: 'Iniciou',
    iconClassName: 'bg-gray-100',
    textClassName: 'text-gray-600',
    color: colors.gray,
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    iconClassName: 'bg-blue-50',
    textClassName: 'text-blue-600',
    color: colors.blue,
  },
  COMPLETED: {
    label: 'Concluiu',
    iconClassName: 'bg-green-50',
    textClassName: 'text-green-700',
    color: colors.green,
  },
};

const FILTERS: { label: string; value: HistoryEntity | null }[] = [
  { label: 'Tudo', value: null },
  ...(Object.keys(ENTITIES) as HistoryEntity[]).map((value) => ({
    label: ENTITIES[value].label,
    value,
  })),
];

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const entity = ENTITIES[entry.entityType];
  const action = ACTIONS[entry.action];

  return (
    <View
      accessible
      accessibilityLabel={`${entity.label}: ${entry.title}. ${action.label} em ${formatDateTime(entry.updatedAt)}`}
      className="flex-row items-center gap-3 border-b border-gray-100 bg-white px-4 py-3"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${action.iconClassName}`}
      >
        <Ionicons name={entity.icon} size={18} color={action.color} />
      </View>

      <View className="flex-1">
        <Text className="font-poppins-semibold text-[11px] uppercase text-gray-500">
          {entity.label}
        </Text>
        <Text
          numberOfLines={1}
          className="font-poppins-semibold text-sm text-gray-900"
        >
          {entry.title}
        </Text>
        {entry.context ? (
          <Text
            numberOfLines={1}
            className="font-poppins text-xs text-gray-500"
          >
            {entry.context}
          </Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text
          className={`font-poppins-semibold text-xs ${action.textClassName}`}
        >
          {action.label}
        </Text>
        <Text className="mt-0.5 font-poppins text-xs text-gray-500">
          {formatDateTime(entry.updatedAt)}
        </Text>
      </View>
    </View>
  );
}

// Histórico de aprendizado: a situação atual de cada item que o aluno abriu,
// do mais recente para o mais antigo. É a lista que a professora vê no site.
export default function HistoryScreen() {
  const [type, setType] = useState<HistoryEntity | null>(null);
  const { entries, total, error, hasMore, isLoadingMore, loadMore, reload } =
    useHistory(type);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Histórico" />

      <View className="gap-3 px-5 pb-3 pt-2">
        <View>
          <Text className="font-poppins-bold text-xl text-gray-900">
            Histórico de aprendizado
          </Text>
          <Text className="mt-1 font-poppins text-sm text-gray-600">
            Situação atual de cada item e a data da última mudança.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {FILTERS.map((filter) => {
            const isActive = filter.value === type;

            return (
              <Pressable
                key={filter.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setType(filter.value)}
                className={`rounded-lg px-3 py-1.5 ${isActive ? 'bg-green-600' : 'bg-gray-100'}`}
              >
                <Text
                  className={`font-poppins-semibold text-xs ${isActive ? 'text-white' : 'text-gray-700'}`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error ? (
        <View className="mx-5 mb-3 gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="font-poppins text-sm text-red-700">{error}</Text>
          <Button variant="link" label="Tentar de novo" onPress={reload} />
        </View>
      ) : null}

      {entries ? (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.id}
          renderItem={({ item }) => <HistoryRow entry={item} />}
          className="border-t border-gray-200"
          contentContainerClassName="flex-grow pb-8"
          ListEmptyComponent={
            <Text className="p-10 text-center font-poppins text-sm text-gray-600">
              Nenhum registro de estudo.
            </Text>
          }
          ListFooterComponent={
            entries.length > 0 ? (
              <View className="gap-2 px-5 pt-4">
                <Text className="text-center font-poppins text-xs text-gray-500">
                  {entries.length} de {total}{' '}
                  {total === 1 ? 'registro' : 'registros'}
                </Text>
                {hasMore ? (
                  <Button
                    variant="link"
                    label="Carregar mais"
                    loading={isLoadingMore}
                    onPress={loadMore}
                  />
                ) : null}
              </View>
            ) : undefined
          }
        />
      ) : error ? null : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      )}
    </SafeAreaView>
  );
}
