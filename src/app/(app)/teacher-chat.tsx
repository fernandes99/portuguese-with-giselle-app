import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
import { KeyboardAvoidingView } from '@/lib/keyboard';
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
  const { t } = useTranslation();

  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 border-b border-gray-200 px-4 py-2">
      <HeaderButton
        icon="arrow-back"
        label={t('common.back')}
        onPress={() => router.back()}
      />
      <TeacherAvatar size={40} />
      <View className="flex-1">
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="font-poppins-semibold text-base text-gray-900"
        >
          {t('entry.preferences.teacherSignature')}
        </Text>
        <Text className="font-poppins text-xs text-gray-600">
          {t('account.teacher.role')}
        </Text>
      </View>
    </View>
  );
}

// Chat de texto do aluno assinante com a professora Giselle. Ela responde
// pelo painel do site; aqui as mensagens novas chegam a cada 30 segundos ou
// ao puxar a lista.
export default function TeacherChatScreen() {
  const { t } = useTranslation();

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
        <PremiumLock description={t('account.teacher.premiumLock')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ChatHeader />

      {/* O campo de mensagem sobe junto com o teclado */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        automaticOffset
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
                  label={t('common.retry')}
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
            // A lista encolhe aos poucos quando o teclado abre: quem estava
            // no fim continua vendo a última mensagem
            onLayout={() => {
              if (atBottom.current) {
                listRef.current?.scrollToEnd({ animated: false });
              }
            }}
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
                  label={t(
                    isLoadingOlder
                      ? 'account.teacher.loading'
                      : 'account.teacher.older'
                  )}
                  onPress={loadOlder}
                  disabled={isLoadingOlder}
                />
              ) : undefined
            }
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center gap-4 px-6">
                <TeacherAvatar size={88} />
                <Text className="text-center font-poppins text-base text-gray-600">
                  {t('account.teacher.empty')}
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
