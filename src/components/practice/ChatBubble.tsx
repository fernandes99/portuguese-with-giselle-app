import { Ionicons } from '@expo/vector-icons';
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { GisaAvatar } from '@/components/practice/GisaAvatar';
import { colors } from '@/constants/theme';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import { splitByMistakes } from '@/utils/practice';

// Amarelo do sublinhado dos erros no balão verde (yellow-300)
const MISTAKE_UNDERLINE = '#fde047';

const AVATAR_SIZE = 40;

// Foto da Gisa com um anel verde pulsando enquanto ela fala
function SpeakingAvatar({ speaking }: { speaking: boolean }) {
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (speaking && !reducedMotion) {
      pulse.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [speaking, reducedMotion, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.12 }],
    opacity: speaking ? 1 - pulse.value * 0.5 : 0,
  }));

  return (
    <View
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      className="items-center justify-center"
    >
      <Animated.View
        pointerEvents="none"
        className="absolute rounded-full border-2 border-green-500"
        style={[
          {
            width: AVATAR_SIZE + 6,
            height: AVATAR_SIZE + 6,
          },
          ringStyle,
        ]}
      />
      <GisaAvatar size={AVATAR_SIZE} />
    </View>
  );
}

// Balão da Gisa, com a foto ao lado. Enquanto ela fala, a borda fica verde e
// a foto ganha o anel pulsando. `avatar` troca a foto (a personagem das
// simulações).
export function GisaBubble({
  children,
  speaking = false,
  avatar,
}: {
  children: ReactNode;
  speaking?: boolean;
  avatar?: ReactNode;
}) {
  return (
    <View className="max-w-[88%] flex-row items-end gap-2 self-start">
      {avatar ?? <SpeakingAvatar speaking={speaking} />}
      <View
        accessibilityState={{ busy: speaking }}
        className={`shrink rounded-2xl rounded-bl-md border bg-white px-4 py-3 ${speaking ? 'border-green-500' : 'border-gray-200'}`}
      >
        {children}
      </View>
    </View>
  );
}

// O texto da fala, com a palavra `active` destacada (a que a Gisa está
// falando). As palavras são as partes separadas por espaço, como os tempos
// que vêm do backend.
function SpokenText({
  content,
  active,
}: {
  content: string;
  active: number | null;
}) {
  if (active === null) {
    return (
      <Text className="font-poppins text-[15px] leading-6 text-gray-900">
        {content}
      </Text>
    );
  }

  let word = -1;
  return (
    <Text className="font-poppins text-[15px] leading-6 text-gray-900">
      {content.split(/(\s+)/).map((part, index) => {
        if (part === '' || /^\s+$/.test(part)) {
          return part;
        }
        word += 1;
        return word === active ? (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: as partes não mudam de ordem
            key={index}
            className="bg-green-100 text-green-800"
          >
            {part}
          </Text>
        ) : (
          part
        );
      })}
    </Text>
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
  speaking = false,
  activeWord = null,
  avatar,
}: {
  content: string;
  translation?: string;
  // Botão de ouvir (ListenButton), quando a fala tem voz
  listen?: ReactNode;
  // A voz desta fala está tocando
  speaking?: boolean;
  // Índice da palavra que está sendo falada; null sem destaque
  activeWord?: number | null;
  // No lugar da foto da Gisa (a personagem das simulações)
  avatar?: ReactNode;
}) {
  const [isTranslated, setIsTranslated] = useState(false);

  return (
    <GisaBubble speaking={speaking} avatar={avatar}>
      <SpokenText content={content} active={activeWord} />

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
        className="max-w-[88%] self-end rounded-2xl rounded-br-md bg-green-600 px-4 py-3 opacity-60"
      >
        <Text className="font-poppins text-[15px] italic leading-6 text-white">
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
        className={`max-w-[88%] self-end rounded-2xl rounded-br-md bg-green-600 px-4 py-3 ${message.status === 'sending' ? 'opacity-60' : ''}`}
      >
        <Text className="font-poppins text-[15px] leading-6 text-white">
          {parts.map((part, index) =>
            part.isMistake ? (
              <Text
                // biome-ignore lint/suspicious/noArrayIndexKey: as partes não mudam de ordem
                key={index}
                className="text-white"
                style={{
                  textDecorationLine: 'underline',
                  textDecorationColor: MISTAKE_UNDERLINE,
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
