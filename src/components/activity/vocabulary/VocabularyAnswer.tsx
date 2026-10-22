import { Text, View } from 'react-native';

import { AudioButton } from '@/components/activity/ActivityAudio';
import type { VocabularyAnswer as VocabularyAnswerData } from '@/services/lesson';

interface VocabularyAnswerProps {
  answer: VocabularyAnswerData;
  // No "Entender a frase", o exemplo e a tradução
  showExample: boolean;
}

// A resposta certa no painel de erro: a palavra, o significado e o áudio
export function VocabularyAnswer({
  answer,
  showExample,
}: VocabularyAnswerProps) {
  return (
    <View className="gap-2">
      <View className="gap-0.5">
        <Text className="font-poppins-bold text-lg text-gray-900">
          {answer.term}
        </Text>
        {answer.meaningShort ? (
          <Text className="font-poppins-semibold text-base text-gray-800">
            {answer.meaningShort}
          </Text>
        ) : null}
        <Text className="font-poppins text-base text-gray-700">
          {answer.meaning}
        </Text>
      </View>
      {showExample ? (
        <View className="gap-0.5">
          <Text className="font-poppins text-base italic text-gray-900">
            {answer.example}
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            {answer.exampleTranslation}
          </Text>
        </View>
      ) : null}
      {answer.termAudioUrl ? (
        <AudioButton url={answer.termAudioUrl} label="Ouvir" />
      ) : null}
    </View>
  );
}
