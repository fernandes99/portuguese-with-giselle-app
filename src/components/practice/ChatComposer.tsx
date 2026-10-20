import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { PRACTICE_MESSAGE_MAX_LENGTH } from '@/constants/config';
import { colors } from '@/constants/theme';

// A partir daqui, o campo mostra quantos caracteres já foram usados
const COUNTER_FROM = 400;

// Âmbar da lâmpada da dica aberta (amber-600), como na barra de voz
const BULB_COLOR = '#d97706';

interface ChatComposerProps {
  // Enquanto a Gisa responde ou há uma mensagem com falha de envio
  disabled: boolean;
  onSend: (text: string) => void;
  // Texto já no campo ao aparecer ("Tentar de novo" da correção); para
  // trocar depois, quem usa remonta o campo com outra `key`
  initialText?: string;
  // Abre o teclado ao aparecer (o aluno trocou do microfone para o teclado)
  autoFocus?: boolean;
  // Volta para o microfone; sem ele, o botão não aparece
  onVoice?: () => void;
  // O microfone é do Premium: o botão leva a coroa, e o toque (onVoice) leva
  // aos planos
  isVoiceLocked?: boolean;
  // Botão da dica ao lado do campo; sem ele, o botão não aparece
  onHint?: () => void;
  isHintOpen?: boolean;
}

// Campo de mensagem fixo no rodapé do chat
export function ChatComposer({
  disabled,
  onSend,
  initialText = '',
  autoFocus = false,
  onVoice,
  isVoiceLocked = false,
  onHint,
  isHintOpen = false,
}: ChatComposerProps) {
  const [text, setText] = useState(initialText);
  const canSend = !disabled && text.trim() !== '';

  function handleSend() {
    if (!canSend) {
      return;
    }

    onSend(text);
    setText('');
  }

  return (
    <View className="gap-1 border-t border-gray-200 bg-white px-4 py-3">
      {text.length >= COUNTER_FROM ? (
        <Text className="self-end font-poppins text-xs text-gray-500">
          {text.length}/{PRACTICE_MESSAGE_MAX_LENGTH}
        </Text>
      ) : null}
      <View className="flex-row items-end gap-2">
        {onVoice ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isVoiceLocked
                ? 'Responder falando, exclusivo do plano Premium'
                : 'Responder falando'
            }
            accessibilityHint={
              isVoiceLocked ? 'Abre a tela do plano Premium' : undefined
            }
            onPress={onVoice}
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="mic" size={22} color={colors.gray} />
            {isVoiceLocked ? (
              <View className="absolute -right-0.5 -top-0.5 h-5 w-5 items-center justify-center rounded-full bg-green-600">
                <MaterialCommunityIcons
                  name="crown"
                  size={12}
                  color={colors.crown}
                />
              </View>
            ) : null}
          </Pressable>
        ) : null}
        {onHint ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="O que eu deveria dizer?"
            accessibilityState={{ expanded: isHintOpen, disabled }}
            disabled={disabled}
            onPress={onHint}
            className={`h-11 w-11 items-center justify-center rounded-full ${isHintOpen ? 'bg-amber-50' : 'bg-gray-100 active:bg-gray-200'} ${disabled ? 'opacity-40' : ''}`}
          >
            <Ionicons
              name="bulb-outline"
              size={22}
              color={isHintOpen ? BULB_COLOR : colors.gray}
            />
          </Pressable>
        ) : null}
        <TextInput
          accessibilityLabel="Mensagem"
          value={text}
          onChangeText={setText}
          placeholder="Escreva em português..."
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={PRACTICE_MESSAGE_MAX_LENGTH}
          editable={!disabled}
          autoFocus={autoFocus}
          // Cresce até cerca de quatro linhas e depois rola
          className="max-h-28 min-h-11 flex-1 rounded-2xl border border-gray-200 bg-background px-4 py-2.5 font-poppins text-[15px] text-gray-900 focus:border-green-600"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={handleSend}
          className={`h-11 w-11 items-center justify-center rounded-full ${canSend ? 'bg-green-600 active:bg-green-700' : 'bg-gray-200'}`}
        >
          <Ionicons
            name="arrow-up"
            size={22}
            color={canSend ? colors.white : colors.gray}
          />
        </Pressable>
      </View>
    </View>
  );
}
