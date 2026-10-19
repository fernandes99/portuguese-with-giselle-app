import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { PRACTICE_MESSAGE_MAX_LENGTH } from '@/constants/config';
import { colors } from '@/constants/theme';

// A partir daqui, o campo mostra quantos caracteres já foram usados
const COUNTER_FROM = 400;

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
}

// Campo de mensagem fixo no rodapé do chat
export function ChatComposer({
  disabled,
  onSend,
  initialText = '',
  autoFocus = false,
  onVoice,
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
            accessibilityLabel="Responder falando"
            onPress={onVoice}
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="mic" size={22} color={colors.gray} />
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
