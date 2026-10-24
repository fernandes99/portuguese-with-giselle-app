import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import { VocabularyDetail } from '@/components/vocabulary/VocabularyDetail';
import { VocabularyFilters } from '@/components/vocabulary/VocabularyFilters';
import { VocabularyRow } from '@/components/vocabulary/VocabularyRow';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useVocabulary } from '@/hooks/useVocabulary';
import {
  canCheckPronunciation,
  filterVocabulary,
  VOCABULARY_FILTER_ALL,
  type VocabularyFilter,
} from '@/utils/vocabulary';

// Gírias e expressões do dia a dia, com busca, filtro por categoria e o botão
// dos salvos ao lado da busca. O toque abre o detalhe com os áudios; o item exclusivo do Premium
// leva aos planos.
export default function VocabularyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, error, refreshing, refresh, savedIds, toggleSaved } =
    useVocabulary();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<VocabularyFilter>(VOCABULARY_FILTER_ALL);
  const [onlySaved, setOnlySaved] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const categoriesById = useMemo(
    () => new Map(data?.categories.map((category) => [category.id, category])),
    [data]
  );
  const items = useMemo(
    () =>
      data
        ? filterVocabulary(data.items, query, filter, onlySaved, savedIds)
        : [],
    [data, query, filter, onlySaved, savedIds]
  );
  const filterOptions = [
    { id: VOCABULARY_FILTER_ALL, title: 'Todas' },
    ...(data?.categories ?? []),
  ];

  const openItem = data?.items.find((item) => item.id === openId) ?? null;
  const getCategory = (item: { categoryIds: string[] }) =>
    categoriesById.get(item.categoryIds[0] ?? '');

  const isSavedFilterEmpty = onlySaved && savedIds.size === 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Vocabulário" />

      <View className="gap-3 pb-3 pt-2">
        <View className="mx-5 flex-row items-center gap-2">
          <View className="h-12 flex-1 flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4">
            <Ionicons name="search" size={20} color={colors.gray} />
            <TextInput
              accessibilityLabel="Buscar"
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar palavra, significado ou exemplo"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              // Sem line-height e sem padding próprio: com a Poppins eles
              // empurram o texto para fora do centro do campo
              textAlignVertical="center"
              style={{ includeFontPadding: false }}
              className="h-full flex-1 py-0 font-poppins text-[16px] text-gray-900"
            />
            {query ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar a busca"
                onPress={() => setQuery('')}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={20} color={colors.gray} />
              </Pressable>
            ) : null}
          </View>

          {/* Liga e desliga os salvos; vale junto com a busca e a categoria */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mostrar só os salvos"
            accessibilityState={{ selected: onlySaved }}
            onPress={() => setOnlySaved((previous) => !previous)}
            className={`h-12 w-12 items-center justify-center rounded-2xl border ${
              onlySaved
                ? 'border-green-600 bg-green-600'
                : 'border-gray-200 bg-white active:bg-gray-50'
            }`}
          >
            <Ionicons
              name={onlySaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={onlySaved ? colors.white : colors.gray}
            />
          </Pressable>
        </View>

        {data ? (
          <VocabularyFilters
            options={filterOptions}
            active={filter}
            onChange={setFilter}
          />
        ) : null}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        // Rolar ou tocar fora do campo fecha o teclado
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow gap-3 px-5 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
        ListHeaderComponent={
          error ? (
            <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="font-poppins text-sm text-red-700">{error}</Text>
              <Button variant="link" label="Tentar de novo" onPress={refresh} />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          data ? (
            <EmptyState
              title={
                isSavedFilterEmpty
                  ? 'Você ainda não salvou nada.'
                  : 'Nenhuma expressão encontrada.'
              }
              text={
                isSavedFilterEmpty
                  ? 'Toque no marcador de uma expressão para revê-la aqui.'
                  : undefined
              }
            />
          ) : error ? undefined : (
            <View className="flex-1 items-center justify-center pt-16">
              <ActivityIndicator size="large" color={colors.green} />
            </View>
          )
        }
        renderItem={({ item }) => (
          <VocabularyRow
            item={item}
            category={getCategory(item)}
            isSaved={savedIds.has(item.id)}
            onPress={() =>
              item.isLocked ? router.push('/plans') : setOpenId(item.id)
            }
            onToggleSaved={() => toggleSaved(item.id)}
          />
        )}
      />

      <VocabularyDetail
        item={openItem}
        getCategory={getCategory}
        savedIds={savedIds}
        canCheckPronunciation={canCheckPronunciation(user)}
        pronunciationEngine={data?.pronunciationEngine ?? 'elevenlabs'}
        onClose={() => setOpenId(null)}
        onToggleSaved={toggleSaved}
        onOpenPlans={() => {
          setOpenId(null);
          router.push('/plans');
        }}
      />
    </SafeAreaView>
  );
}
