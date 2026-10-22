import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { AudioButton } from '@/components/activity/ActivityAudio';
import { colors } from '@/constants/theme';
import type {
  PronunciationEvaluation,
  PronunciationWord,
} from '@/services/vocabulary';

// Certa: normal; trocada: a ouvida riscada e a certa ao lado; faltando: a
// certa em vermelho, sublinhada
function HeardWord({ word }: { word: PronunciationWord }) {
  if (word.status === 'ok') {
    return (
      <Text className="font-poppins text-xl text-gray-900">
        {word.expected}
      </Text>
    );
  }

  if (word.status === 'wrong') {
    return (
      <Text className="font-poppins text-xl">
        <Text className="text-red-500 line-through">{word.heard}</Text>
        <Text> </Text>
        <Text className="font-poppins-semibold text-green-700">
          {word.expected}
        </Text>
      </Text>
    );
  }

  return (
    <Text
      accessibilityLabel={`${word.expected}, faltou`}
      className="font-poppins text-xl text-red-500 underline"
    >
      {word.expected}
    </Text>
  );
}

export function PronunciationResult({
  evaluation,
  termAudioUrl,
}: {
  evaluation: PronunciationEvaluation;
  termAudioUrl: string | null;
}) {
  if (evaluation.result === 'correct') {
    return (
      <View className="flex-row items-center gap-3 rounded-2xl bg-green-50 p-4">
        <Ionicons name="checkmark-circle" size={28} color={colors.darkGreen} />
        <Text className="flex-1 font-poppins-semibold text-base text-green-700">
          Muito bem! Um brasileiro entenderia você.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3 rounded-2xl bg-gray-50 p-4">
      {evaluation.result === 'incorrect' ? (
        <View className="gap-1">
          <Text className="font-poppins text-sm text-gray-500">
            Entendemos:
          </Text>
          <View className="flex-row flex-wrap items-baseline gap-x-2 gap-y-1">
            {evaluation.words.map((word, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de um resultado não mudam de ordem e podem se repetir
              <HeardWord key={index} word={word} />
            ))}
          </View>
        </View>
      ) : (
        <Text className="font-poppins text-base text-gray-700">
          Não conseguimos ouvir. Fale mais perto do microfone e tente de novo.
        </Text>
      )}
      {termAudioUrl ? (
        <AudioButton url={termAudioUrl} label="Ouvir a pronúncia" />
      ) : null}
    </View>
  );
}
