import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderButton, LessonHeader } from '@/components/lesson/ClassicLesson';
import {
  GisaBubble,
  GisaMessage,
  StudentMessage,
} from '@/components/practice/ChatBubble';
import { ChatComposer } from '@/components/practice/ChatComposer';
import { ChatStyleSelector } from '@/components/practice/ChatStyleSelector';
import { TypingIndicator } from '@/components/practice/TypingIndicator';
import { PremiumLock } from '@/components/premium/PremiumLock';
import { useAuth } from '@/contexts/AuthContext';
import { type ChatMessage, usePracticeChat } from '@/hooks/usePracticeChat';
import { canUsePractice } from '@/utils/practice';

const TITLE = 'Gisa';
const SUBTITLE = 'Parceira de conversação com IA';

// Chat de texto com a Gisa, parceira de conversação com IA: ela corrige
// cada frase do aluno e continua a conversa com uma pergunta, no estilo que
// ele escolheu
export default function PracticeChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    messages,
    isOpening,
    isReplying,
    isBlocked,
    hasFailed,
    isEmpty,
    send,
    retry,
    restart,
  } = usePracticeChat();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // A última mensagem fica sempre à vista
  // biome-ignore lint/correctness/useExhaustiveDependencies: rola a cada mensagem nova e quando a Gisa começa a digitar
  useEffect(() => {
    const timeout = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(timeout);
  }, [messages, isReplying]);

  function confirmRestart() {
    if (isEmpty) {
      return;
    }

    Alert.alert(
      'Recomeçar a conversa?',
      'As mensagens desta conversa serão apagadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recomeçar', style: 'destructive', onPress: restart },
      ]
    );
  }

  // Trocar o estilo recomeça a conversa: com mensagens do aluno, pergunta
  // antes
  function openStyle() {
    if (isEmpty) {
      router.push('/practice/style');
      return;
    }

    Alert.alert(
      'Trocar o estilo da Gisa?',
      'Trocar o estilo recomeça a conversa. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => router.push('/practice/style') },
      ]
    );
  }

  if (!canUsePractice(user) || isBlocked) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title={TITLE} subtitle={SUBTITLE} />
        <PremiumLock description="Converse com a Gisa, sua parceira de conversação com IA, e receba a correção de cada frase. O chat com IA faz parte do plano Premium." />
      </SafeAreaView>
    );
  }

  // Primeira vez no chat: o aluno escolhe o estilo antes da conversa
  if (user?.chatStyle === null) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <LessonHeader title={TITLE} subtitle={SUBTITLE} />
        <ChatStyleSelector mode="first" onDone={() => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader
        title={TITLE}
        subtitle={SUBTITLE}
        right={
          <View className="flex-row gap-2">
            <HeaderButton
              icon="color-palette-outline"
              label="Estilo da Gisa"
              onPress={openStyle}
            />
            <HeaderButton
              icon="refresh"
              label="Recomeçar conversa"
              onPress={confirmRestart}
            />
          </View>
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-4 px-4 py-4"
          renderItem={({ item }) =>
            item.role === 'assistant' ? (
              <GisaMessage
                content={item.content}
                translation={item.translation}
              />
            ) : (
              <StudentMessage message={item} onRetry={retry} />
            )
          }
          ListFooterComponent={
            // A Gisa "digita" enquanto a abertura e as respostas não chegam
            isOpening || isReplying ? (
              <GisaBubble>
                <TypingIndicator />
              </GisaBubble>
            ) : null
          }
        />

        <ChatComposer
          disabled={isOpening || isReplying || hasFailed}
          onSend={send}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
