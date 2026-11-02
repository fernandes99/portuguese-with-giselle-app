import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { ExplanationLanguageSelector } from '@/components/practice/ExplanationLanguageSelector';

// Troca do idioma das explicações, aberta pelo cabeçalho do chat. A
// conversa continua de onde estava.
export default function ExplanationLanguageScreen() {
  const { t } = useTranslation();

  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LessonHeader title={t('practice.chat.explanationLanguage')} />
      <ExplanationLanguageSelector onDone={() => router.back()} />
    </SafeAreaView>
  );
}
