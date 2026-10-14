import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { HeaderButton } from '@/components/lesson/ClassicLesson';
import { DaySeparator } from '@/components/teacherChat/DaySeparator';
import {
  StudentMessage,
  TeacherAvatar,
  TeacherMessage,
} from '@/components/teacherChat/MessageBubble';
import { MessageComposer } from '@/components/teacherChat/MessageComposer';
import { PremiumLock } from '@/components/premium/PremiumLock';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { type PendingMessage, useTeacherChat } from '@/hooks/useTeacherChat';
import type { TeacherChatMessage } from '@/services/teacherChat';
import {
  canUseTeacherChat,
  formatDayLabel,
  isSameDay,
} from '@/utils/teacherChat';

// Distância do fim em que a conversa ainda conta como "no fim"
const BOTTOM_SLACK = 80;

type ChatItem =
  | { kind: 'day'; id: string; label: string }
  | { kind: 'message'; id: string; message: TeacherChatMessage }
  | { kind: 'pending'; id: string; message: PendingMessage };

// Mensagens em ordem, com a data abrindo cada dia; as que ainda estão em
// envio ou falharam ficam no fim
function buildItems(
  messages: TeacherChatMessage[],
  pending: PendingMessage[]
): ChatItem[] {
  const items: ChatItem[] = [];

  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    if (!previous || !isSameDay(previous.createdAt, message.createdAt)) {
      items.push({
        kind: 'day',
        id: `day-${message.id}`,
        label: formatDayLabel(message.createdAt),
      });
    }
    items.push({ kind: 'message', id: message.id, message });
  });

  for (const message of pending) {
    items.push({ kind: 'pending', id: message.localId, message });
  }

  return items;
}

// Cabeçalho com a foto e o nome da professora
function ChatHeader() {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 py-2">
      <HeaderButton
        icon="arrow-back"
        label="Voltar"
        onPress={() => router.back()}
      />
      <TeacherAvatar size={40} />
      <View className="flex-1">
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="font-poppins-semibold text-base text-gray-900"
        >
          Professora Giselle
        </Text>
        <Text className="font-poppins text-xs text-gray-600">
          Sua professora
        </Text>
      </View>
    </View>
  );
}

// Chat de texto do aluno assinante com a professora Giselle. Ela responde
// pelo painel do site; aqui as mensagens novas chegam a cada 30 segundos ou
// ao puxar a lista.
export default function TeacherChatScreen() {
  const { user } = useAuth();
  const canUse = canUseTeacherChat(user);
  const {
    messages,
    pending,
    hasMore,
    maxLength,
    error,
    isBlocked,
    refreshing,
    isLoadingOlder,
    refresh,
    loadOlder,
    send,
    retry,
  } = useTeacherChat(canUse);

  const listRef = useRef<FlatList<ChatItem>>(null);
  // A lista acompanha a última mensagem só se o aluno já estava no fim
  const atBottom = useRef(true);
  const hasScrolled = useRef(false);

  const items = useMemo(
    () => buildItems(messages ?? [], pending),
    [messages, pending]
  );
  const lastId = items[items.length - 1]?.id;

  useEffect(() => {
    if (!lastId || !atBottom.current) {
      return;
    }

    const animated = hasScrolled.current;
    hasScrolled.current = true;
    const timeout = setTimeout(
      () => listRef.current?.scrollToEnd({ animated }),
      50
    );
    return () => clearTimeout(timeout);
  }, [lastId]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    atBottom.current =
      contentSize.height - contentOffset.y - layoutMeasurement.height <
      BOTTOM_SLACK;
  }

  function handleSend(text: string) {
    // A própria mensagem sempre leva a conversa para o fim
    atBottom.current = true;
    send(text);
  }

  if (!canUse || isBlocked) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ChatHeader />
        <PremiumLock description="Tire suas dúvidas direto com a professora Giselle. O chat com a professora faz parte do plano Premium." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ChatHeader />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages === null ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            {error ? (
              <>
                <Text className="text-center font-poppins text-base text-red-700">
                  {error}
                </Text>
                <Button
                  variant="link"
                  label="Tentar de novo"
                  onPress={refresh}
                />
              </>
            ) : (
              <ActivityIndicator size="large" color={colors.green} />
            )}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="flex-grow gap-3 px-4 py-4"
            onScroll={handleScroll}
            scrollEventThrottle={100}
            // Mensagens antigas entram no topo sem tirar a leitura do lugar
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.green]}
                tintColor={colors.green}
              />
            }
            ListHeaderComponent={
              hasMore ? (
                <Button
                  variant="link"
                  label={
                    isLoadingOlder
                      ? 'Carregando...'
                      : 'Ver mensagens anteriores'
                  }
                  onPress={loadOlder}
                  disabled={isLoadingOlder}
                />
              ) : null
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center gap-4 px-6">
                <TeacherAvatar size={88} />
                <Text className="text-center font-poppins text-base text-gray-600">
                  Mande uma mensagem para a professora Giselle. Ela responde por
                  aqui.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              if (item.kind === 'day') {
                return <DaySeparator label={item.label} />;
              }

              if (item.kind === 'pending') {
                return (
                  <StudentMessage
                    content={item.message.content}
                    status={item.message.status}
                    onRetry={() => retry(item.message.localId)}
                  />
                );
              }

              return item.message.fromTeacher ? (
                <TeacherMessage
                  content={item.message.content}
                  createdAt={item.message.createdAt}
                />
              ) : (
                <StudentMessage
                  content={item.message.content}
                  status="sent"
                  createdAt={item.message.createdAt}
                />
              );
            }}
          />
        )}

        <MessageComposer maxLength={maxLength} onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
