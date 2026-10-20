import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Linking, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderButton, LessonHeader } from '@/components/lesson/ClassicLesson';
import {
  GisaBubble,
  GisaMessage,
  StudentMessage,
} from '@/components/practice/ChatBubble';
import { ChatComposer } from '@/components/practice/ChatComposer';
import { ChatNotice, ChatStopNotice } from '@/components/practice/ChatNotice';
import { ChatSettingsSheet } from '@/components/practice/ChatSettingsSheet';
import { ChatStyleSelector } from '@/components/practice/ChatStyleSelector';
import { ChatVoiceBar } from '@/components/practice/ChatVoiceBar';
import { GisaAvatar } from '@/components/practice/GisaAvatar';
import { HintCard } from '@/components/practice/HintCard';
import { ListenButton } from '@/components/practice/ListenButton';
import { TypingIndicator } from '@/components/practice/TypingIndicator';
import { PremiumLock } from '@/components/premium/PremiumLock';
import { useAuth } from '@/contexts/AuthContext';
import { useGisaVoice } from '@/hooks/useGisaVoice';
import { useHoldToTalk } from '@/hooks/useHoldToTalk';
import { type ChatMessage, usePracticeChat } from '@/hooks/usePracticeChat';
import { KeyboardAvoidingView } from '@/lib/keyboard';
import { PRACTICE_AUDIO_ERROR_CODES } from '@/services/practice';
import {
  canUsePractice,
  getRemainingLabel,
  REMAINING_WARNING_AT,
} from '@/utils/practice';

const TITLE = 'Gisa';
const SUBTITLE = 'Parceira de conversação com IA';
const AI_NOTICE =
  'A Gisa é uma IA e pode errar. Não compartilhe dados pessoais sensíveis.';
// A resposta falada é enviada sozinha depois disso
const MAX_VOICE_MS = 30_000;
// Quanto tempo o aviso acima da barra fica à vista
const VOICE_NOTICE_MS = 4000;

// Campo de texto com uma `key` própria: trocar a `key` aplica o texto novo
interface ComposerSeed {
  key: number;
  text: string;
}

// Chat com a Gisa, parceira de conversação com IA: ela corrige cada frase do
// aluno e continua a conversa com uma pergunta, no estilo que ele escolheu.
// O aluno responde segurando o microfone ou pelo teclado, ouve as falas
// dela e pode pedir uma dica.
export default function PracticeChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    messages,
    isOpening,
    isReplying,
    isTranscribing,
    isBlocked,
    hasFailed,
    limit,
    remainingToday,
    lastSuggestion,
    isEmpty,
    send,
    sendVoice,
    retry,
    redo,
    restart,
    addNotice,
  } = usePracticeChat();
  const voice = useGisaVoice();
  // Fora de foco (idioma, estilo), a voz para e a voz automática não toca
  const isFocusedRef = useRef(true);
  const stopVoiceRef = useRef(voice.stop);
  stopVoiceRef.current = voice.stop;
  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
        stopVoiceRef.current();
      };
    }, [])
  );
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'keyboard'>('voice');
  const [composer, setComposer] = useState<ComposerSeed>({
    key: 0,
    text: '',
  });
  // O aluno trocou do microfone para o teclado: o teclado abre junto
  const [focusComposer, setFocusComposer] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canChat =
    canUsePractice(user) && !isBlocked && user?.chatStyle !== null;
  const isBusy =
    isOpening || isReplying || isTranscribing || hasFailed || !!limit;

  const showVoiceNotice = useCallback((message: string) => {
    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    setVoiceNotice(message);
    noticeTimer.current = setTimeout(
      () => setVoiceNotice(null),
      VOICE_NOTICE_MS
    );
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    },
    []
  );

  const hold = useHoldToTalk({
    maxDurationMs: MAX_VOICE_MS,
    onRecorded: async (uri) => {
      const result = await sendVoice(uri);
      if (result.ok) {
        return;
      }
      showVoiceNotice(result.message);
      if (result.code === PRACTICE_AUDIO_ERROR_CODES.transcriptionLimit) {
        setInputMode('keyboard');
      }
    },
  });
  const { requestPermission } = hold;

  // O microfone é pedido ao abrir o chat, não ao segurar o botão. Negado, a
  // barra abre no teclado.
  useEffect(() => {
    if (!canChat) {
      return;
    }
    requestPermission().then((granted) => {
      if (!granted) {
        setInputMode('keyboard');
      }
    });
  }, [canChat, requestPermission]);

  // A última mensagem fica sempre à vista
  // biome-ignore lint/correctness/useExhaustiveDependencies: rola a cada mensagem nova e quando a Gisa começa a digitar
  useEffect(() => {
    const timeout = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(timeout);
  }, [messages, isReplying, isHintOpen]);

  // Voz automática: cada fala nova da Gisa toca quando chega, se o aluno não
  // estiver gravando. As que já tocaram (ou já estavam na tela) não tocam de
  // novo, nem quando o "Tentar de novo" traz a pergunta anterior de volta.
  const spokenRef = useRef(new Set<string>());
  let lastAssistant: Extract<ChatMessage, { role: 'assistant' }> | undefined;
  for (const message of messages) {
    if (message.role === 'assistant') {
      lastAssistant = message;
    }
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: toca só quando chega uma fala nova
  useEffect(() => {
    if (!lastAssistant) {
      // Conversa recomeçando: a abertura nova tem o mesmo id da anterior
      spokenRef.current.clear();
      return;
    }
    if (spokenRef.current.has(lastAssistant.id)) {
      return;
    }
    spokenRef.current.add(lastAssistant.id);
    const phase = hold.state.phase;
    if (
      lastAssistant.signature &&
      isFocusedRef.current &&
      phase !== 'starting' &&
      phase !== 'recording'
    ) {
      voice.autoplay(
        lastAssistant.id,
        lastAssistant.content,
        lastAssistant.signature
      );
    }
  }, [lastAssistant?.id]);

  // A voz parou pelo limite: o chat avisa uma vez, e a conversa segue por
  // texto
  // biome-ignore lint/correctness/useExhaustiveDependencies: avisa só quando a mensagem do limite aparece
  useEffect(() => {
    if (voice.speechLimitMessage) {
      addNotice(voice.speechLimitMessage);
    }
  }, [voice.speechLimitMessage]);

  // Uma fala nova troca a dica
  // biome-ignore lint/correctness/useExhaustiveDependencies: fecha a dica quando ela muda
  useEffect(() => {
    setIsHintOpen(false);
  }, [lastSuggestion?.text]);

  function handlePressIn() {
    // A voz da Gisa entraria na gravação
    voice.stop();
    setIsHintOpen(false);
    hold.pressIn();
  }

  function handleSend(text: string) {
    setIsHintOpen(false);
    send(text);
  }

  function openKeyboard() {
    setFocusComposer(true);
    setInputMode('keyboard');
  }

  async function openVoice() {
    if (await requestPermission()) {
      setInputMode('voice');
      return;
    }

    Alert.alert(
      'Microfone bloqueado',
      'Permita o acesso ao microfone nas configurações para responder falando.',
      [
        { text: 'Agora não', style: 'cancel' },
        {
          text: 'Abrir configurações',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  function handleRedo() {
    voice.stop();
    const text = redo();
    if (text !== null && inputMode === 'keyboard') {
      setFocusComposer(true);
      setComposer((current) => ({ key: current.key + 1, text }));
    }
  }

  function confirmRestart() {
    if (isEmpty) {
      return;
    }

    Alert.alert(
      'Recomeçar a conversa?',
      'As mensagens desta conversa serão apagadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recomeçar',
          style: 'destructive',
          onPress: () => {
            voice.stop();
            restart();
          },
        },
      ]
    );
  }

  // Trocar o estilo recomeça a conversa: com mensagens do aluno, pergunta
  // antes
  function openStyle() {
    if (isEmpty) {
      voice.stop();
      router.push('/practice/style');
      return;
    }

    Alert.alert(
      'Trocar o estilo da Gisa?',
      'Trocar o estilo recomeça a conversa. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            voice.stop();
            router.push('/practice/style');
          },
        },
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

  let lastUserId: string | null = null;
  for (const message of messages) {
    if (message.role === 'user') {
      lastUserId = message.id;
    }
  }
  const canRedo = !isOpening && !isReplying && !isTranscribing;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader
        title={TITLE}
        subtitle={SUBTITLE}
        avatar={<GisaAvatar size={32} />}
        right={
          <HeaderButton
            icon="settings-outline"
            label="Configurações do chat"
            onPress={() => setIsSettingsOpen(true)}
          />
        }
      />

      {/* O campo de mensagem sobe junto com o teclado */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        automaticOffset
      >
        <FlatList
          ref={listRef}
          // A lista encolhe aos poucos quando o teclado abre: a última
          // mensagem continua à vista
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          data={messages}
          // Os botões de ouvir mudam sem a lista mudar
          extraData={voice}
          keyExtractor={(message) => message.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-4 px-4 py-4"
          ListHeaderComponent={<ChatNotice text={AI_NOTICE} />}
          renderItem={({ item }) => {
            if (item.role === 'notice') {
              return <ChatNotice text={item.content} />;
            }

            if (item.role === 'assistant') {
              const { signature } = item;
              return (
                <GisaMessage
                  content={item.content}
                  translation={item.translation}
                  speaking={voice.stateOf(item.id) === 'playing'}
                  activeWord={voice.activeWordOf(item.id)}
                  listen={
                    signature ? (
                      <ListenButton
                        state={voice.stateOf(item.id)}
                        label="Ouvir a Gisa"
                        onPress={() =>
                          voice.toggle(item.id, item.content, signature)
                        }
                      />
                    ) : undefined
                  }
                />
              );
            }

            const { correctedSignature, correction } = item;
            const correctedKey = `${item.id}-corrected`;
            return (
              <StudentMessage
                message={item}
                canRedo={canRedo && item.id === lastUserId}
                listenCorrected={
                  correctedSignature && correction ? (
                    <ListenButton
                      state={voice.stateOf(correctedKey)}
                      label="Ouvir a correção"
                      onPress={() =>
                        voice.toggle(
                          correctedKey,
                          correction.corrected,
                          correctedSignature
                        )
                      }
                    />
                  ) : undefined
                }
                onRetry={retry}
                onRedo={handleRedo}
              />
            );
          }}
          ListFooterComponent={
            // A Gisa "digita" enquanto a abertura e as respostas não chegam
            isOpening || isReplying ? (
              <GisaBubble>
                <TypingIndicator />
              </GisaBubble>
            ) : null
          }
        />

        {limit ? (
          <ChatStopNotice
            message={limit.message}
            onRestart={
              limit.kind === 'restart'
                ? () => {
                    voice.stop();
                    restart();
                  }
                : undefined
            }
          />
        ) : (
          <>
            {remainingToday !== null &&
            remainingToday <= REMAINING_WARNING_AT ? (
              <Text className="bg-amber-50 px-4 py-1.5 text-center font-poppins text-xs text-amber-800">
                {getRemainingLabel(remainingToday)}
              </Text>
            ) : null}
            {voiceNotice ? (
              <Text
                accessibilityLiveRegion="polite"
                className="px-4 pb-2 text-center font-poppins text-sm text-red-700"
              >
                {voiceNotice}
              </Text>
            ) : null}
            {isHintOpen && lastSuggestion ? (
              <HintCard
                text={lastSuggestion.text}
                translation={lastSuggestion.translation}
                onClose={() => setIsHintOpen(false)}
              />
            ) : null}
            {inputMode === 'voice' ? (
              <View>
                <ChatVoiceBar
                  disabled={isBusy}
                  hold={{ ...hold, pressIn: handlePressIn }}
                  maxDurationMs={MAX_VOICE_MS}
                  hasHint={!!lastSuggestion}
                  isHintOpen={isHintOpen}
                  onKeyboard={openKeyboard}
                  onHint={() => setIsHintOpen((current) => !current)}
                />
              </View>
            ) : (
              <ChatComposer
                key={composer.key}
                initialText={composer.text}
                autoFocus={focusComposer}
                disabled={isBusy}
                onSend={handleSend}
                onVoice={openVoice}
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>

      <ChatSettingsSheet
        visible={isSettingsOpen}
        autoplay={voice.autoplayEnabled}
        onAutoplayChange={voice.setAutoplayEnabled}
        canRestart={!isEmpty}
        onLanguage={() => router.push('/practice/language')}
        onStyle={openStyle}
        onRestart={confirmRestart}
        onClose={() => setIsSettingsOpen(false)}
      />
    </SafeAreaView>
  );
}
