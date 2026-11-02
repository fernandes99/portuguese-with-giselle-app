import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FlashcardItem } from '@/components/flashcards/FlashcardItem';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getFlashcards } from '@/services/flashcards';

// Conjuntos de flashcards, os mesmos do site. Recarrega ao voltar de uma
// sessão de estudo, para o progresso aparecer atualizado.
export default function FlashcardsScreen() {
  const { t } = useTranslation();

  const router = useRouter();
  const {
    data: flashcards,
    error,
    refreshing,
    refresh,
  } = useApiQuery(getFlashcards, t('practice.flashcards.loadError'));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title={t('practice.home.flashcards')} />
      <ScrollView
        contentContainerClassName="flex-grow gap-4 px-5 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <Text className="font-poppins text-base text-gray-600">
          {t('practice.flashcards.subtitle')}
        </Text>

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button
              variant="link"
              label={t('common.retry')}
              onPress={refresh}
            />
          </View>
        ) : null}

        {flashcards?.map((flashcard) => (
          <FlashcardItem
            key={flashcard.id}
            flashcard={flashcard}
            onPress={() =>
              router.push({
                pathname: '/practice/flashcards/[slug]',
                params: { slug: flashcard.slug },
              })
            }
          />
        ))}

        {flashcards?.length === 0 ? (
          <EmptyState
            title={t('practice.flashcards.emptyTitle')}
            text={t('practice.flashcards.emptyText')}
          />
        ) : null}

        {!flashcards && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
