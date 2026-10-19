import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { GisaAvatar } from '@/components/practice/GisaAvatar';
import { colors } from '@/constants/theme';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import { splitByMistakes } from '@/utils/practice';

// Balão da Gisa, com a foto ao lado
export function GisaBubble({ children }: { children: ReactNode }) {
  return (
    <View className="max-w-[88%] flex-row items-end gap-2 self-start">
      <GisaAvatar size={40} />
      <View className="shrink rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3">
        {children}
      </View>
    </View>
  );
}

// Botão redondo da linha de ações de um balão (traduzir)
export function BubbleAction({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      className={`h-8 w-8 items-center justify-center rounded-full active:opacity-70 ${active ? 'bg-green-100' : 'bg-gray-100'}`}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? colors.green : colors.gray}
      />
    </Pressable>
  );
}

// Fala da Gisa, com os botões de traduzir e de ouvir. A tradução só aparece
// quando o aluno toca no botão.
export function GisaMessage({
  content,
  translation,
  listen,
}: {
  content: string;
  translation?: string;
  // Botão de ouvir (ListenButton), quando a fala tem voz
  listen?: ReactNode;
}) {
  const [isTranslated, setIsTranslated] = useState(false);

  return (
    <GisaBubble>
      <Text className="font-poppins text-[15px] leading-6 text-gray-900">
        {content}
      </Text>

      {translation && isTranslated ? (
        <Text className="mt-2 border-t border-gray-200 pt-2 font-poppins text-sm leading-5 text-gray-600">
          {translation}
        </Text>
      ) : null}

      {translation || listen ? (
        <View className="mt-2 flex-row gap-2">
          {translation ? (
            <BubbleAction
              icon="language"
              label={isTranslated ? 'Esconder tradução' : 'Traduzir'}
              active={isTranslated}
              onPress={() => setIsTranslated((current) => !current)}
            />
          ) : null}
          {listen}
        </View>
      ) : null}
    </GisaBubble>
  );
}

// Mensagem do aluno, com os erros sublinhados, a correção e a falha de envio
export function StudentMessage({
  message,
  canRedo,
  listenCorrected,
  onRetry,
  onRedo,
}: {
  message: Extract<ChatMessage, { role: 'user' }>;
  // É a última resposta do aluno e a Gisa não está respondendo
  canRedo: boolean;
  // Botão de ouvir a frase corrigida, quando ela tem voz
  listenCorrected?: ReactNode;
  onRetry: () => void;
  onRedo: () => void;
}) {
  const { correction } = message;

  if (message.status === 'transcribing') {
    return (
      <View
        accessibilityLabel="Ouvindo sua resposta"
        className="max-w-[88%] self-end rounded-2xl rounded-br-md border border-green-200 bg-green-50 px-4 py-3 opacity-60"
      >
        <Text className="font-poppins text-[15px] italic leading-6 text-gray-700">
          Ouvindo...
        </Text>
      </View>
    );
  }

  const parts = splitByMistakes(
    message.content,
    correction?.hasErrors ? correction.mistakes : []
  );

  return (
    <View className="gap-2">
      <View
        accessible
        // O leitor de tela não depende do sublinhado para saber da correção
        accessibilityLabel={
          correction?.hasErrors
            ? `${message.content}. Correção: ${correction.corrected}`
            : message.content
        }
        className={`max-w-[88%] self-end rounded-2xl rounded-br-md border border-green-200 bg-green-50 px-4 py-3 ${message.status === 'sending' ? 'opacity-60' : ''}`}
      >
        <Text className="font-poppins text-[15px] leading-6 text-gray-900">
          {parts.map((part, index) =>
            part.isMistake ? (
              <Text
                // biome-ignore lint/suspicious/noArrayIndexKey: as partes não mudam de ordem
                key={index}
                className="text-red-700"
                style={{
                  textDecorationLine: 'underline',
                  textDecorationColor: colors.red,
                }}
              >
                {part.text}
              </Text>
            ) : (
              part.text
            )
          )}
        </Text>
      </View>

      {correction ? (
        <CorrectionCard
          original={message.content}
          correction={correction}
          listen={listenCorrected}
          onRedo={canRedo ? onRedo : undefined}
        />
      ) : null}

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
