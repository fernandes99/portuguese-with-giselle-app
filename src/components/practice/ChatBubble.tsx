import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { colors } from '@/constants/theme';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import { splitByMistakes } from '@/utils/practice';

// Balão da Professora Gisa, com o avatar ao lado
export function GisaBubble({ children }: { children: ReactNode }) {
  return (
    <View className="max-w-[88%] flex-row items-end gap-2 self-start">
      <View className="h-8 w-8 items-center justify-center rounded-full bg-green-100">
        <Text className="font-poppins-bold text-sm text-green-700">G</Text>
      </View>
      <View className="shrink rounded-2xl rounded-bl-md bg-green-600 px-4 py-3">
        {children}
      </View>
    </View>
  );
}

// Fala da Gisa. A tradução só aparece quando o aluno toca no botão.
export function GisaMessage({
  content,
  translation,
}: {
  content: string;
  translation?: string;
}) {
  const [isTranslated, setIsTranslated] = useState(false);

  return (
    <GisaBubble>
      <Text className="font-poppins text-[15px] leading-6 text-white">
        {content}
      </Text>

      {translation && isTranslated ? (
        <Text className="mt-2 border-t border-white/30 pt-2 font-poppins text-sm leading-5 text-green-50">
          {translation}
        </Text>
      ) : null}

      {translation ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isTranslated ? 'Esconder tradução' : 'Traduzir'}
          onPress={() => setIsTranslated((current) => !current)}
          hitSlop={8}
          className={`mt-2 h-8 w-8 items-center justify-center rounded-full active:opacity-70 ${isTranslated ? 'bg-white' : 'bg-white/20'}`}
        >
          <Ionicons
            name="language"
            size={16}
            color={isTranslated ? colors.green : colors.white}
          />
        </Pressable>
      ) : null}
    </GisaBubble>
  );
}

// Mensagem do aluno, com os erros grifados, a correção e a falha de envio
export function StudentMessage({
  message,
  onRetry,
}: {
  message: Extract<ChatMessage, { role: 'user' }>;
  onRetry: () => void;
}) {
  const { correction } = message;
  const parts = splitByMistakes(
    message.content,
    correction?.hasErrors ? correction.mistakes : []
  );

  return (
    <View className="max-w-[88%] gap-2 self-end">
      <View
        accessible
        // O leitor de tela não depende do grifo para saber da correção
        accessibilityLabel={
          correction?.hasErrors
            ? `${message.content}. Correção: ${correction.corrected}`
            : message.content
        }
        className={`self-end rounded-2xl rounded-br-md border border-gray-200 bg-white px-4 py-3 ${message.status === 'sending' ? 'opacity-60' : ''}`}
      >
        <Text className="font-poppins text-[15px] leading-6 text-gray-900">
          {parts.map((part, index) =>
            part.isMistake ? (
              <Text
                // biome-ignore lint/suspicious/noArrayIndexKey: as partes não mudam de ordem
                key={index}
                className="bg-red-100 text-red-700 underline"
              >
                {part.text}
              </Text>
            ) : (
              part.text
            )
          )}
        </Text>
      </View>

      {correction ? <CorrectionCard correction={correction} /> : null}

      {message.status === 'failed' ? (
        <View className="items-end gap-1">
          <Text className="text-right font-poppins text-xs text-red-700">
            {message.error ?? 'Não foi possível enviar.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
            <Text className="font-poppins-semibold text-sm text-green-700">
              Tentar de novo
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
