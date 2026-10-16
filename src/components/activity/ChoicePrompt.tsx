import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { SentenceText } from '@/components/activity/SentenceText';
import { colors } from '@/constants/theme';
import {
  type ChoiceExercise,
  type ChoicePromptKind,
  isAudio,
  isImage,
  PROMPT_INSTRUCTIONS,
} from '@/utils/choice';

// Botão grande, no centro, para ouvir o áudio da pergunta
function ListenButton({ url }: { url: string }) {
  const { playingUrl, toggle } = useActivityAudio();
  const isPlaying = playingUrl === url;

  return (
    <View className="items-center gap-2">
      <View className="h-36 w-36 items-center justify-center rounded-full bg-green-100">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Ouvir áudio'}
          onPress={() => toggle(url)}
          className="h-28 w-28 items-center justify-center rounded-full bg-green-600 active:bg-green-700"
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'volume-high'}
            size={44}
            color={colors.white}
          />
        </Pressable>
      </View>
      <Text className="font-poppins text-sm text-gray-500">
        {isPlaying ? 'Tocando...' : 'Toque para ouvir'}
      </Text>
    </View>
  );
}

interface ChoicePromptProps {
  exercise: ChoiceExercise;
  kind: ChoicePromptKind;
  allowsMultiple: boolean;
}

// Enunciado de um exercício: a instrução curta, o áudio ou a imagem e o texto
// da pergunta, quando houver
export function ChoicePrompt({
  exercise,
  kind,
  allowsMultiple,
}: ChoicePromptProps) {
  const question = exercise.question.trim();
  // Sem áudio nem imagem, a própria pergunta é o destaque
  const hasMedia = kind === 'listen' || kind === 'look';

  return (
    <View className="items-center gap-5">
      <View className="items-center gap-1">
        <Text className="text-center font-poppins-bold text-xl text-gray-900">
          {PROMPT_INSTRUCTIONS[kind]}
        </Text>
        {allowsMultiple ? (
          <Text className="text-center font-poppins text-sm text-gray-500">
            Há mais de uma resposta certa.
          </Text>
        ) : null}
      </View>

      {kind === 'listen' && isAudio(exercise.file) ? (
        <ListenButton url={exercise.file.url} />
      ) : null}

      {kind === 'look' && isImage(exercise.file) ? (
        <Image
          source={{ uri: `${exercise.file.url}?w=800&auto=compress` }}
          resizeMode="contain"
          className="h-56 w-full rounded-2xl bg-gray-100"
        />
      ) : null}

      {question ? (
        <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1">
          <SentenceText text={question} size={hasMedia ? 'base' : 'lg'} />
        </View>
      ) : null}
    </View>
  );
}
