import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';

// A partir de quantos caracteres restantes o contador aparece
const COUNTER_THRESHOLD = 200;

interface MessageComposerProps {
  maxLength: number;
  onSend: (text: string) => void;
}

// Campo de mensagem fixo no rodapé. Nunca trava: uma mensagem em envio não
// impede a próxima.
export function MessageComposer({ maxLength, onSend }: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim() !== '';
  const remaining = maxLength - text.length;

  function handleSend() {
    if (!canSend) {
      return;
    }

    onSend(text);
    setText('');
  }

  return (
    <View className="border-t border-gray-200 bg-white px-4 py-3">
      <View className="flex-row items-end gap-2">
        <TextInput
          accessibilityLabel="Mensagem"
          value={text}
          onChangeText={setText}
          placeholder="Escreva sua mensagem..."
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={maxLength}
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

      {remaining <= COUNTER_THRESHOLD ? (
        <Text className="mt-1 text-right font-poppins text-[11px] text-gray-500">
          {remaining} caracteres restantes
        </Text>
      ) : null}
    </View>
  );
}
