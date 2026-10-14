import { useEffect, useRef } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderButton, LessonHeader } from '@/components/lesson/ClassicLesson';
import {
  GisaBubble,
  GisaMessage,
  StudentMessage,
} from '@/components/practice/ChatBubble';
import { ChatComposer } from '@/components/practice/ChatComposer';
import { TypingIndicator } from '@/components/practice/TypingIndicator';
import { PremiumLock } from '@/components/premium/PremiumLock';
import { useAuth } from '@/contexts/AuthContext';
import { type ChatMessage, usePracticeChat } from '@/hooks/usePracticeChat';
import { canUsePractice } from '@/utils/practice';

const TITLE = 'Professora Gisa';

// Chat de texto com a Professora Gisa: ela corrige cada frase do aluno e
// continua a conversa com uma pergunta
export default function PracticeChatScreen() {
  const { user } = useAuth();
  const {
    messages,
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

  if (!canUsePractice(user) || isBlocked) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title={TITLE} />
        <PremiumLock description="Converse com a Professora Gisa e receba a correção de cada frase. O chat com IA faz parte do plano Premium." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader
        title={TITLE}
        right={
          <HeaderButton
            icon="refresh"
            label="Recomeçar conversa"
            onPress={confirmRestart}
          />
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
            isReplying ? (
              <GisaBubble>
                <TypingIndicator />
              </GisaBubble>
            ) : null
          }
        />

        <ChatComposer disabled={isReplying || hasFailed} onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
