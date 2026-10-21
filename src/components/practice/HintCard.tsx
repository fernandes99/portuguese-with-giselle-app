import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BubbleAction } from '@/components/practice/ChatBubble';
import { colors } from '@/constants/theme';

// Dica no fim da conversa: fechada, é a pílula "O que dizer?"; aberta, uma
// resposta possível à última pergunta da Gisa, só para ler. O aluno responde
// do jeito dele.
export function HintCard({
  text,
  translation,
  isOpen,
  onOpen,
  onClose,
}: {
  text: string;
  translation?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [isTranslated, setIsTranslated] = useState(false);

  if (!isOpen) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="O que eu deveria dizer?"
        accessibilityState={{ expanded: false }}
        onPress={onOpen}
        className="flex-row items-center gap-2 self-end rounded-full bg-green-100 px-5 py-3 active:opacity-70"
      >
        <Ionicons name="bulb" size={20} color={colors.green} />
        <Text className="font-poppins-semibold text-base text-green-700">
          O que dizer?
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="max-w-[88%] gap-2 self-end rounded-3xl bg-green-50 p-4">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="bulb" size={16} color={colors.green} />
        <Text className="flex-1 font-poppins-semibold text-sm text-green-700">
          O que eu deveria dizer?
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar a dica"
          onPress={onClose}
          hitSlop={8}
        >
          <Ionicons name="close" size={20} color={colors.gray} />
        </Pressable>
      </View>

      <Text className="font-poppins text-[15px] leading-6 text-gray-900">
        {text}
      </Text>

      {translation && isTranslated ? (
        <Text className="font-poppins text-sm leading-5 text-gray-600">
          {translation}
        </Text>
      ) : null}

      {translation ? (
        <BubbleAction
          icon="language"
          label={isTranslated ? 'Esconder tradução' : 'Traduzir'}
          active={isTranslated}
          onPress={() => setIsTranslated((current) => !current)}
        />
      ) : null}
    </View>
  );
}
