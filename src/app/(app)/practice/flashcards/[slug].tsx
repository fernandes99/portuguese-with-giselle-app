import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { StudySession } from '@/components/flashcards/StudySession';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { colors } from '@/constants/theme';
import { useFlashcard } from '@/hooks/useFlashcard';

// Estudo de um conjunto de flashcards
export default function FlashcardScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, reload } = useFlashcard(slug);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title={data?.title ?? 'Flashcards'} />

      {data ? (
        <StudySession
          key={data.id}
          flashcard={data}
          onExit={() => router.back()}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          {error ? (
            <>
              <Text className="text-center font-poppins text-base text-red-700">
                {error}
              </Text>
              <Button variant="link" label="Tentar de novo" onPress={reload} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.green} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
