import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { HoldToTalkButton } from '@/components/vocabulary/HoldToTalkButton';
import { PronunciationResult } from '@/components/vocabulary/PronunciationResult';
import { colors } from '@/constants/theme';
import {
  MAX_RECORDING_MS,
  usePronunciationRecorder,
} from '@/hooks/usePronunciationRecorder';
import type { PronunciationEngine } from '@/services/vocabulary';

interface PronunciationPracticeProps {
  itemId: string;
  termAudioUrl: string | null;
  // Só assinantes verificam; o gratuito vai para a tela de planos
  canCheck: boolean;
  // Quem transcreve: a gravação ou o reconhecimento do aparelho
  engine: PronunciationEngine;
  onOpenPlans: () => void;
}

// Box "Verificar pronúncia" do detalhe. Fechado, mostra o convite (com o selo
// Premium para o gratuito); aberto, o microfone de segurar para falar e o
// resultado. Fica dentro do ActivityAudioProvider do detalhe.
export function PronunciationPractice({
  itemId,
  termAudioUrl,
  canCheck,
  engine,
  onOpenPlans,
}: PronunciationPracticeProps) {
  const { t } = useTranslation();

  const { playingUrl, stop: stopAudio } = useActivityAudio();
  const { state, metering, requestPermission, pressIn, release } =
    usePronunciationRecorder(itemId, { engine });
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
            ? t('practice.pronunciation.title')
            : t('practice.pronunciation.titleLocked')
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
            {t('practice.pronunciation.title')}
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            {t('practice.pronunciation.description')}
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
          {t('practice.pronunciation.title')}
        </Text>
        <Text className="font-poppins text-sm text-gray-500">
          {t('practice.pronunciation.instruction')}
        </Text>
      </View>

      {state.phase === 'denied' ? (
        <View className="gap-3">
          <Text className="font-poppins text-sm text-red-500">
            {t('practice.pronunciation.micDenied')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              onPress={() => Linking.openSettings()}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="settings-outline" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                {t('lesson.vocabulary.openSettings')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 active:bg-gray-200"
            >
              <Ionicons name="refresh" size={18} color={colors.gray} />
              <Text className="font-poppins-semibold text-sm text-gray-700">
                {t('common.retry')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {state.phase === 'result' ? (
            <PronunciationResult
              evaluation={state.evaluation}
              termAudioUrl={termAudioUrl}
            />
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
              {t(`lesson.vocabulary.hints.${state.hint}`)}
            </Text>
          ) : null}
          {state.phase === 'result' ? (
            <Text className="text-center font-poppins text-sm text-gray-500">
              {t('practice.pronunciation.tryAgainHint')}
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}
