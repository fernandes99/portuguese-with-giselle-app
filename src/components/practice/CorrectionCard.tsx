import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { PracticeCorrection } from '@/services/practice';
import { diffWords } from '@/utils/diffWords';

// Âmbar do título da correção (amber-500)
const SPARKLE_COLOR = '#f59e0b';

// Fica sob a mensagem do aluno: a frase com o que saiu riscado e o que
// entrou destacado, a explicação e o "Tentar de novo"; ou só o selo "Boa
// resposta" quando não há erros
export function CorrectionCard({
  original,
  correction,
  listen,
  onRedo,
}: {
  // A mensagem do aluno, para comparar com a corrigida
  original: string;
  correction: PracticeCorrection;
  // Botão de ouvir a frase corrigida
  listen?: ReactNode;
  // Só na última resposta do aluno, quando a Gisa não está respondendo
  onRedo?: () => void;
}) {
  if (!correction.hasErrors) {
    return (
      <View className="flex-row items-center gap-1.5 self-end rounded-full border border-green-200 bg-white px-3 py-1.5">
        <Ionicons name="checkmark" size={16} color={colors.green} />
        <Text className="font-poppins-medium text-xs text-green-700">
          Boa resposta
        </Text>
      </View>
    );
  }

  const parts = diffWords(original, correction.corrected);

  return (
    <View className="gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="sparkles" size={16} color={SPARKLE_COLOR} />
        <Text className="font-poppins-semibold text-sm text-amber-600">
          Correção
        </Text>
      </View>

      <View className="flex-row items-start gap-3">
        <Text
          accessibilityLabel={`Correção: ${correction.corrected}`}
          className="flex-1 font-poppins text-base leading-7 text-gray-900"
        >
          {parts.map((part, index) => (
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: as partes não mudam de ordem
              key={index}
            >
              {index > 0 ? ' ' : ''}
              {part.kind === 'removed' ? (
                <Text
                  className="text-gray-400"
                  style={{ textDecorationLine: 'line-through' }}
                >
                  {part.text}
                </Text>
              ) : part.kind === 'added' ? (
                <Text className="bg-green-100 font-poppins-semibold text-green-800">
                  {part.text}
                </Text>
              ) : (
                part.text
              )}
            </Text>
          ))}
        </Text>
        {listen}
      </View>

      {correction.explanation ? (
        <Text className="font-poppins text-sm leading-5 text-gray-600">
          {correction.explanation}
        </Text>
      ) : null}

      {onRedo ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Tira esta resposta para você responder de novo"
          onPress={onRedo}
          className="flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-background py-3 active:bg-gray-100"
        >
          <Ionicons name="refresh" size={18} color={colors.darkGreen} />
          <Text className="font-poppins-semibold text-sm text-green-700">
            Tentar de novo
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
