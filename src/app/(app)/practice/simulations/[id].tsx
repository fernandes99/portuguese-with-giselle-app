import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import {
  GisaBubble,
  GisaMessage,
  StudentMessage,
} from '@/components/practice/ChatBubble';
import { ChatComposer } from '@/components/practice/ChatComposer';
import { ChatNotice } from '@/components/practice/ChatNotice';
import { ChatVoiceBar } from '@/components/practice/ChatVoiceBar';
import { GoalReminder } from '@/components/simulations/GoalReminder';
import { HintCard } from '@/components/practice/HintCard';
import { ListenButton } from '@/components/practice/ListenButton';
import { TypingIndicator } from '@/components/practice/TypingIndicator';
import { SimulationAvatar } from '@/components/simulations/SimulationAvatar';
import { SimulationIntro } from '@/components/simulations/SimulationIntro';
import { SimulationSummary } from '@/components/simulations/SimulationSummary';
import { TaskStrip } from '@/components/simulations/TaskStrip';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useGisaVoice } from '@/hooks/useGisaVoice';
import { useHoldToTalk } from '@/hooks/useHoldToTalk';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import { useSimulation } from '@/hooks/useSimulation';
import { KeyboardAvoidingView } from '@/lib/keyboard';
import { PRACTICE_AUDIO_ERROR_CODES } from '@/services/practice';
import { getCachedSimulation, getSimulations } from '@/services/simulations';
import { canUsePractice } from '@/utils/practice';
import {
  getRemainingMessagesLabel,
  REMAINING_MESSAGES_WARNING_AT,
} from '@/utils/simulations';

const AI_NOTICE =
  'A personagem é uma IA e pode errar. Não compartilhe dados pessoais sensíveis.';
const DAILY_LIMIT_MESSAGE =
  'Você fez todas as simulações de hoje. Volte amanhã!';
// A resposta falada é enviada sozinha depois disso, como no chat
const MAX_VOICE_MS = 30_000;
const VOICE_NOTICE_MS = 4000;
// Sem voz, a última fala fica este tempo à vista antes do resumo
const FINISH_DELAY_MS = 1500;
// Com voz, se ela não começar a tocar neste tempo, o resumo aparece assim
// mesmo; e nunca espera mais que o segundo número
const SPEECH_START_TIMEOUT_MS = 5000;
const SPEECH_MAX_WAIT_MS = 30_000;

// Um cenário das simulações: a apresentação, a conversa com a personagem e
// o resumo do fim. O cenário vem da lista; sem ela (link direto ou o app
// reaberto aqui), a lista carrega de novo. Na conversa, o aluno responde
// segurando o microfone ou pelo teclado, como no chat; o aluno gratuito
// conversa só por texto.
export default function SimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const isPremium = canUsePractice(user);

  // `simulation` vem null quando o cenário saiu da lista (despublicado)
  const fetchSimulation = useCallback(
    async (token: string) => {
      const list = await getSimulations(token);
      return {
        simulation: list.simulations.find((item) => item.id === id) ?? null,
        remainingToday: list.remainingToday,
      };
    },
    [id]
  );
  const { data, error, refresh, reload } = useApiQuery(
    fetchSimulation,
    'Não foi possível carregar a simulação.'
  );
  const simulation = data ? data.simulation : getCachedSimulation(id);

  const sim = useSimulation(id);
  const voice = useGisaVoice();
  // Fora de foco (tela de planos), a voz para e a voz automática não toca
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
  const [inputMode, setInputMode] = useState<'voice' | 'keyboard'>(
    isPremium ? 'voice' : 'keyboard'
  );
  const [focusComposer, setFocusComposer] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlaying = sim.phase === 'playing';

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
      const result = await sim.sendVoice(uri);
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

  // O microfone é pedido quando a conversa começa. Negado, a barra abre no
  // teclado.
  useEffect(() => {
    if (!isPlaying || !isPremium) {
      return;
    }
    requestPermission().then((granted) => {
      if (!granted) {
        setInputMode('keyboard');
      }
    });
  }, [isPlaying, isPremium, requestPermission]);

  // A última mensagem fica sempre à vista
  // biome-ignore lint/correctness/useExhaustiveDependencies: rola a cada mensagem nova e quando a personagem começa a digitar
  useEffect(() => {
    const timeout = setTimeout(
      () => listRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(timeout);
  }, [sim.messages, sim.isReplying, isHintOpen]);

  // Voz automática, como no chat: cada fala nova toca uma vez, se o aluno
  // não estiver gravando. Só no Premium: a voz é do plano.
  const spokenRef = useRef(new Set<string>());
  let lastAssistant: Extract<ChatMessage, { role: 'assistant' }> | undefined;
  for (const message of sim.messages) {
    if (message.role === 'assistant') {
      lastAssistant = message;
    }
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: toca só quando chega uma fala nova ou o aviso de desvio fecha
  useEffect(() => {
    if (!lastAssistant) {
      // Simulação recomeçando: a abertura nova tem o mesmo id da anterior
      spokenRef.current.clear();
      return;
    }
    // Com o aviso de desvio aberto, a fala espera o aluno fechar
    if (spokenRef.current.has(lastAssistant.id) || sim.goalReminder) {
      return;
    }
    spokenRef.current.add(lastAssistant.id);
    const phase = hold.state.phase;
    if (
      isPremium &&
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
  }, [lastAssistant?.id, sim.goalReminder]);

  // A voz parou pelo limite: a conversa avisa uma vez e segue por texto
  // biome-ignore lint/correctness/useExhaustiveDependencies: avisa só quando a mensagem do limite aparece
  useEffect(() => {
    if (voice.speechLimitMessage) {
      sim.addNotice(voice.speechLimitMessage);
    }
  }, [voice.speechLimitMessage]);

  // Uma fala nova troca a dica
  // biome-ignore lint/correctness/useExhaustiveDependencies: fecha a dica quando ela muda
  useEffect(() => {
    setIsHintOpen(false);
  }, [sim.lastSuggestion?.text]);

  // A simulação acabou: o resumo aparece depois que a última fala toca (ou
  // logo, sem voz). O aluno também pode abrir pelo botão "Ver resultado".
  const finalState =
    sim.isOver && lastAssistant ? voice.stateOf(lastAssistant.id) : 'idle';
  const sawSpeechRef = useRef(false);
  const willSpeak =
    isPremium &&
    voice.autoplayEnabled &&
    !voice.speechLimitMessage &&
    !!lastAssistant?.signature;
  // biome-ignore lint/correctness/useExhaustiveDependencies: reage ao fim e ao estado da voz da última fala
  useEffect(() => {
    if (!isPlaying || !sim.isOver) {
      sawSpeechRef.current = false;
      return;
    }
    if (finalState !== 'idle') {
      sawSpeechRef.current = true;
      const cap = setTimeout(sim.finish, SPEECH_MAX_WAIT_MS);
      return () => clearTimeout(cap);
    }
    const delay = sawSpeechRef.current
      ? FINISH_DELAY_MS / 2
      : willSpeak
        ? SPEECH_START_TIMEOUT_MS
        : FINISH_DELAY_MS;
    const timer = setTimeout(sim.finish, delay);
    return () => clearTimeout(timer);
  }, [isPlaying, sim.isOver, finalState]);

  // Sair no meio pede confirmação: a simulação já contou e a conversa não é
  // salva
  usePreventRemove(isPlaying && !sim.isOver, ({ data: event }) => {
    Alert.alert(
      'Sair da simulação?',
      'A conversa não é salva, e esta simulação conta como uma das de hoje.',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            voice.stop();
            navigation.dispatch(event.action);
          },
        },
      ]
    );
  });

  async function handleStart() {
    const { locked } = await sim.start();
    if (locked) {
      router.push('/plans');
    }
  }

  function handleRestart() {
    voice.stop();
    sim.restart();
    // O que resta hoje mudou
    reload();
  }

  function goToList() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/practice/simulations');
    }
  }

  function handlePressIn() {
    // A voz da personagem entraria na gravação
    voice.stop();
    setIsHintOpen(false);
    hold.pressIn();
  }

  function handleSend(text: string) {
    setIsHintOpen(false);
    sim.send(text);
  }

  function openKeyboard() {
    setFocusComposer(true);
    setInputMode('keyboard');
  }

  async function openVoice() {
    if (!isPremium) {
      router.push('/plans');
      return;
    }
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

  if (!simulation) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title="Simulação" />
        {error ? (
          <View className="m-5 gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : data ? (
          <View className="p-5">
            <EmptyState title="Esta simulação não está mais disponível." />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (sim.phase === 'intro' || sim.phase === 'starting') {
    const limitMessage = sim.startError?.isDailyLimit
      ? sim.startError.message
      : data?.remainingToday === 0
        ? DAILY_LIMIT_MESSAGE
        : null;
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title={simulation.title} />
        <SimulationIntro
          simulation={simulation}
          isStarting={sim.phase === 'starting'}
          limitMessage={limitMessage}
          error={sim.startError?.message ?? null}
          onStart={handleStart}
        />
      </SafeAreaView>
    );
  }

  if (sim.phase === 'finished') {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title={simulation.title} />
        <SimulationSummary
          simulation={simulation}
          status={sim.status}
          endReason={sim.endReason}
          feedback={sim.feedback}
          endNotice={sim.endNotice}
          completedTasks={sim.completedTasks}
          messages={sim.messages}
          onRetry={handleRestart}
          onOther={goToList}
        />
      </SafeAreaView>
    );
  }

  const avatar = <SimulationAvatar emoji={simulation.emoji} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LessonHeader
        title={simulation.title}
        avatar={<SimulationAvatar emoji={simulation.emoji} size={32} />}
        filled
      />
      <TaskStrip
        tasks={simulation.tasks}
        completed={sim.completedTasks}
        highlight={sim.lastCompleted}
        warnings={sim.deviationCount}
      />

      {/* O campo de mensagem sobe junto com o teclado */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        automaticOffset
      >
        <FlatList
          ref={listRef}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          data={sim.messages}
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
                  avatar={avatar}
                  speaking={voice.stateOf(item.id) === 'playing'}
                  activeWord={voice.activeWordOf(item.id)}
                  listen={
                    isPremium && signature ? (
                      <ListenButton
                        state={voice.stateOf(item.id)}
                        label="Ouvir a personagem"
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
                // Refazer a resposta desfaria tarefas já contadas no backend
                canRedo={false}
                listenCorrected={
                  isPremium && correctedSignature && correction ? (
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
                onRetry={sim.retry}
                onRedo={() => {}}
              />
            );
          }}
          ListFooterComponent={
            sim.isReplying ? (
              <GisaBubble avatar={avatar}>
                <TypingIndicator />
              </GisaBubble>
            ) : sim.lastSuggestion && !sim.isBusy && !sim.isOver ? (
              <HintCard
                text={sim.lastSuggestion.text}
                translation={sim.lastSuggestion.translation}
                isOpen={isHintOpen}
                onOpen={() => setIsHintOpen(true)}
                onClose={() => setIsHintOpen(false)}
              />
            ) : null
          }
        />

        {sim.isOver ? (
          <View className="bg-white px-5 py-4">
            <Button label="Ver resultado" onPress={sim.finish} />
          </View>
        ) : (
          <>
            {sim.remainingMessages <= REMAINING_MESSAGES_WARNING_AT ? (
              <Text className="bg-amber-50 px-4 py-1.5 text-center font-poppins text-xs text-amber-800">
                {getRemainingMessagesLabel(sim.remainingMessages)}
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
            {inputMode === 'voice' ? (
              <ChatVoiceBar
                disabled={sim.isBusy}
                hold={{ ...hold, pressIn: handlePressIn }}
                maxDurationMs={MAX_VOICE_MS}
                onKeyboard={openKeyboard}
              />
            ) : (
              <ChatComposer
                autoFocus={focusComposer}
                disabled={sim.isBusy}
                onSend={handleSend}
                onVoice={openVoice}
                isVoiceLocked={!isPremium}
              />
            )}
          </>
        )}
      </KeyboardAvoidingView>

      <GoalReminder
        reminder={sim.goalReminder}
        tasks={simulation.tasks}
        pendingTasks={simulation.tasks
          .map((_, task) => task)
          .filter((task) => !sim.completedTasks.includes(task))}
        onClose={sim.dismissReminder}
      />
    </SafeAreaView>
  );
}
