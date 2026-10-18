import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { HoldToTalkButton } from '@/components/vocabulary/HoldToTalkButton';
import { colors } from '@/constants/theme';
import {
  MAX_RECORDING_MS,
  type RecorderHint,
  usePronunciationRecorder,
} from '@/hooks/usePronunciationRecorder';
import type {
  PronunciationEvaluation,
  PronunciationWord,
} from '@/services/vocabulary';

interface PronunciationPracticeProps {
  itemId: string;
  termAudioUrl: string | null;
  // Só assinantes verificam; o gratuito vai para a tela de planos
  canCheck: boolean;
  onOpenPlans: () => void;
}

const HINTS: Record<Exclude<RecorderHint, null>, string> = {
  too_short: 'Segure o botão enquanto fala.',
  cancelled: 'Gravação cancelada.',
};

// Certa: normal; trocada: a ouvida riscada e a certa ao lado; faltando: a
// certa em vermelho, sublinhada
function HeardWord({ word }: { word: PronunciationWord }) {
  if (word.status === 'ok') {
    return (
      <Text className="font-poppins text-xl text-gray-900">
        {word.expected}
      </Text>
    );
  }

  if (word.status === 'wrong') {
    return (
      <Text className="font-poppins text-xl">
        <Text className="text-red-500 line-through">{word.heard}</Text>
        <Text> </Text>
        <Text className="font-poppins-semibold text-green-700">
          {word.expected}
        </Text>
      </Text>
    );
  }

  return (
    <Text
      accessibilityLabel={`${word.expected}, faltou`}
      className="font-poppins text-xl text-red-500 underline"
    >
      {word.expected}
    </Text>
  );
}

function Result({
  evaluation,
  termAudioUrl,
}: {
  evaluation: PronunciationEvaluation;
  termAudioUrl: string | null;
}) {
  if (evaluation.result === 'correct') {
    return (
      <View className="flex-row items-center gap-3 rounded-2xl bg-green-50 p-4">
        <Ionicons name="checkmark-circle" size={28} color={colors.darkGreen} />
        <Text className="flex-1 font-poppins-semibold text-base text-green-700">
          Muito bem! Um brasileiro entenderia você.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-2xl bg-gray-50 p-4">
      {evaluation.result === 'incorrect' ? (
        <View className="gap-1">
          <Text className="font-poppins text-sm text-gray-500">
            Entendemos:
          </Text>
          <View className="flex-row flex-wrap items-baseline gap-x-2 gap-y-1">
            {evaluation.words.map((word, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de um resultado não mudam de ordem e podem se repetir
              <HeardWord key={index} word={word} />
            ))}
          </View>
        </View>
      ) : (
        <Text className="font-poppins text-base text-gray-700">
          Não conseguimos ouvir. Fale mais perto do microfone e tente de novo.
        </Text>
      )}
      {termAudioUrl ? (
        <AudioButton url={termAudioUrl} label="Ouvir a pronúncia" />
      ) : null}
    </View>
  );
}

// Box "Verificar pronúncia" do detalhe. Fechado, mostra o convite (com o selo
// Premium para o gratuito); aberto, o microfone de segurar para falar e o
// resultado. Fica dentro do ActivityAudioProvider do detalhe.
export function PronunciationPractice({
  itemId,
  termAudioUrl,
  canCheck,
  onOpenPlans,
}: PronunciationPracticeProps) {
  const { playingUrl, stop: stopAudio } = useActivityAudio();
  const { state, metering, requestPermission, pressIn, release } =
    usePronunciationRecorder(itemId);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Começar a tocar um áudio durante a gravação cancela a gravação. Compara
  // com o valor anterior: o áudio parado ao começar a gravar pode ainda
  // aparecer como tocando por um instante.
  const previousPlayingUrlRef = useRef(playingUrl);
  useEffect(() => {
    const startedPlaying =
      playingUrl !== null && playingUrl !== previousPlayingUrlRef.current;
    previousPlayingUrlRef.current = playingUrl;
    if (startedPlaying && state.phase === 'recording') {
      release(true);
    }
  }, [playingUrl, state.phase, release]);

  async function open() {
    if (!canCheck) {
      onOpenPlans();
      return;
    }

    // Sem a permissão, o box abre com o aviso e o atalho das configurações
    setIsOpening(true);
    await requestPermission();
    setIsOpening(false);
    setIsOpen(true);
  }

  function handlePressIn() {
    // O áudio tocando entraria na gravação
    stopAudio();
    pressIn();
  }

  const isHolding = state.phase === 'starting' || state.phase === 'recording';

  if (!isOpen) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          canCheck
            ? 'Verificar pronúncia'
            : 'Verificar pronúncia, exclusivo do Premium'
        }
        onPress={open}
        disabled={isOpening}
        className="flex-row items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 active:bg-green-100"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-green-600">
          <Ionicons name="mic" size={24} color="#ffffff" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="font-poppins-semibold text-base text-gray-900">
            Verificar pronúncia
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            Fale a expressão e veja se um brasileiro entenderia.
          </Text>
        </View>
        {isOpening ? (
          <ActivityIndicator color={colors.darkGreen} />
        ) : canCheck ? (
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        ) : (
          <PremiumBadge />
        )}
      </Pressable>
    );
  }

  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text className="font-poppins-semibold text-base text-gray-900">
          Verificar pronúncia
        </Text>
        <Text className="font-poppins text-sm text-gray-500">
          Segure o microfone, fale a expressão e solte.
        </Text>
      </View>

      {state.phase === 'denied' ? (
        <View className="gap-3">
          <Text className="font-poppins text-sm text-red-500">
            Permita o acesso ao microfone nas configurações para verificar a
            pronúncia.
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="settings-outline" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                Abrir configurações
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="refresh" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                Tentar de novo
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {state.phase === 'result' ? (
            <Result evaluation={state.evaluation} termAudioUrl={termAudioUrl} />
          ) : null}

          {state.phase === 'checking' ? (
            <View className="h-14 flex-row items-center justify-center gap-2">
              <ActivityIndicator color={colors.darkGreen} />
              <Text className="font-poppins-semibold text-sm text-gray-500">
                Conferindo...
              </Text>
            </View>
          ) : null}

          <HoldToTalkButton
            isHolding={isHolding}
            isRecording={state.phase === 'recording'}
            disabled={state.phase === 'checking'}
            metering={metering}
            maxDurationMs={MAX_RECORDING_MS}
            onPressIn={handlePressIn}
            onRelease={release}
          />

          {state.phase === 'idle' && state.hint ? (
            <Text className="text-center font-poppins text-sm text-gray-500">
              {HINTS[state.hint]}
            </Text>
          ) : null}
          {state.phase === 'result' ? (
            <Text className="text-center font-poppins text-sm text-gray-500">
              Segure o microfone para tentar de novo.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}
