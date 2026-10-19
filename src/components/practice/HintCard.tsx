import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BubbleAction } from '@/components/practice/ChatBubble';
import { colors } from '@/constants/theme';

// Âmbar da lâmpada (amber-600)
const BULB_COLOR = '#d97706';

// Dica acima da barra: uma resposta possível à última pergunta da Gisa, só
// para ler; o aluno responde do jeito dele
export function HintCard({
  text,
  translation,
  onClose,
}: {
  text: string;
  translation?: string;
  onClose: () => void;
}) {
  const [isTranslated, setIsTranslated] = useState(false);

  return (
    <View className="mx-4 mb-2 gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="bulb" size={16} color={BULB_COLOR} />
        <Text className="flex-1 font-poppins-semibold text-sm text-amber-700">
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
