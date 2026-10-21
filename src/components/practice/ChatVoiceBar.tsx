import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { HoldToTalkButton } from '@/components/vocabulary/HoldToTalkButton';
import { colors } from '@/constants/theme';
import type { HoldToTalkState } from '@/hooks/useHoldToTalk';

// Diâmetro do microfone no chat
const MIC_SIZE = 80;

// Quanto tempo o "Segure para falar" fica à vista depois de um toque rápido
const TAP_HINT_MS = 2500;

interface ChatVoiceBarProps {
  // A Gisa está respondendo, há uma falha ou uma gravação a caminho
  disabled: boolean;
  hold: {
    state: HoldToTalkState;
    metering: number | undefined;
    pressIn: () => void;
    release: (cancel: boolean) => void;
  };
  maxDurationMs: number;
  onKeyboard: () => void;
}

// Barra de baixo do chat no modo voz: teclado à esquerda e microfone de
// segurar para falar no centro. O "Segure para falar" só aparece depois de um
// toque rápido, que não chega a gravar.
export function ChatVoiceBar({
  disabled,
  hold,
  maxDurationMs,
  onKeyboard,
}: ChatVoiceBarProps) {
  const { state } = hold;
  const { phase } = state;
  const isHolding = phase === 'starting' || phase === 'recording';
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    if (state.phase !== 'idle' || state.hint !== 'too_short') {
      setShowTapHint(false);
      return;
    }
    setShowTapHint(true);
    const timeout = setTimeout(() => setShowTapHint(false), TAP_HINT_MS);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <View className="flex-row items-end justify-between bg-white px-8">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Digitar a resposta"
        accessibilityState={{ disabled: isHolding }}
        disabled={isHolding}
        onPress={onKeyboard}
        className={`mb-6 h-16 w-16 items-center justify-center rounded-full bg-surface active:bg-surface-pressed ${isHolding ? 'opacity-40' : ''}`}
      >
        <Ionicons name="keypad" size={26} color={colors.gray} />
      </Pressable>

      <HoldToTalkButton
        isHolding={isHolding}
        isRecording={phase === 'recording'}
        disabled={disabled || phase === 'sending'}
        metering={hold.metering}
        maxDurationMs={maxDurationMs}
        size={MIC_SIZE}
        compact
        showIdleHint={showTapHint}
        onPressIn={hold.pressIn}
        onRelease={hold.release}
      />

      {/* Mantém o microfone no centro */}
      <View className="w-14" />
    </View>
  );
}
