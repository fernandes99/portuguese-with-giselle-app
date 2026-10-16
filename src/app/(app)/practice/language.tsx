import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { ExplanationLanguageSelector } from '@/components/practice/ExplanationLanguageSelector';

// Troca do idioma das explicações, aberta pelo cabeçalho do chat. A
// conversa continua de onde estava.
export default function ExplanationLanguageScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LessonHeader title="Idioma das explicações" />
      <ExplanationLanguageSelector onDone={() => router.back()} />
    </SafeAreaView>
  );
}
