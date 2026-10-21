import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { ChatStyleSelector } from '@/components/practice/ChatStyleSelector';

// Troca do estilo da Gisa, aberta pelas configurações do chat. O chat
// recomeça a conversa quando o estilo da sessão muda.
export default function ChatStyleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LessonHeader title="Estilo da Gisa" />
      <ChatStyleSelector mode="edit" onDone={() => router.back()} />
    </SafeAreaView>
  );
}
