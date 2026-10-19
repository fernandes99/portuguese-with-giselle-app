import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';

import { HoldToTalkButton } from '@/components/vocabulary/HoldToTalkButton';
import { colors } from '@/constants/theme';
import type { HoldToTalkState } from '@/hooks/useHoldToTalk';

// Diâmetro do microfone no chat
const MIC_SIZE = 80;

function SideButton({
  icon,
  label,
  active = false,
  disabled = false,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, expanded: active }}
      disabled={disabled}
      onPress={onPress}
      className={`mb-9 h-12 w-12 items-center justify-center rounded-full border ${active ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white active:bg-gray-100'} ${disabled ? 'opacity-40' : ''}`}
    >
      <Ionicons
        name={icon}
        size={22}
        color={active ? '#d97706' : colors.gray}
      />
    </Pressable>
  );
}

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
  // A última fala da Gisa tem dica
  hasHint: boolean;
  isHintOpen: boolean;
  onKeyboard: () => void;
  onHint: () => void;
}

// Barra de baixo do chat no modo voz: teclado, microfone de segurar para
// falar e dica. Sem dica, o lugar do botão fica vazio, e o microfone continua
// no centro.
export function ChatVoiceBar({
  disabled,
  hold,
  maxDurationMs,
  hasHint,
  isHintOpen,
  onKeyboard,
  onHint,
}: ChatVoiceBarProps) {
  const { phase } = hold.state;
  const isHolding = phase === 'starting' || phase === 'recording';

  return (
    <View className="flex-row items-end justify-between border-t border-gray-200 bg-white px-8 pt-1">
      <SideButton
        icon="keypad-outline"
        label="Digitar a resposta"
        disabled={isHolding}
        onPress={onKeyboard}
      />

      <HoldToTalkButton
        isHolding={isHolding}
        isRecording={phase === 'recording'}
        disabled={disabled || phase === 'sending'}
        metering={hold.metering}
        maxDurationMs={maxDurationMs}
        size={MIC_SIZE}
        compact
        onPressIn={hold.pressIn}
        onRelease={hold.release}
      />

      {hasHint ? (
        <SideButton
          icon="bulb-outline"
          label="O que eu deveria dizer?"
          active={isHintOpen}
          disabled={disabled || isHolding}
          onPress={onHint}
        />
      ) : (
        <View className="w-12" />
      )}
    </View>
  );
}
