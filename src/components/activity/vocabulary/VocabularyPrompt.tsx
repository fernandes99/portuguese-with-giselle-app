import { useEffect } from 'react';
import { Text, View } from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import type { VocabularyPrompt as VocabularyPromptData } from '@/services/lesson';

interface VocabularyPromptProps {
  prompt: VocabularyPromptData;
  // Nos tipos de ouvir, o áudio é a pergunta e toca ao abrir
  autoPlay: boolean;
  audioLabel: string;
}

// O que o aluno vê ou ouve: a palavra ou o significado, e o botão de ouvir
export function VocabularyPrompt({
  prompt,
  autoPlay,
  audioLabel,
}: VocabularyPromptProps) {
  const { play } = useActivityAudio();

  // biome-ignore lint/correctness/useExhaustiveDependencies: toca só quando a pergunta aparece
  useEffect(() => {
    if (autoPlay && prompt.audioUrl) {
      play(prompt.audioUrl);
    }
  }, []);

  return (
    <View className="items-start gap-3 rounded-2xl bg-gray-50 p-5">
      {prompt.text ? (
        <Text className="font-poppins-bold text-2xl text-gray-900">
          {prompt.text}
        </Text>
      ) : null}
      {prompt.audioUrl ? (
        <AudioButton url={prompt.audioUrl} label={audioLabel} />
      ) : null}
    </View>
  );
}
