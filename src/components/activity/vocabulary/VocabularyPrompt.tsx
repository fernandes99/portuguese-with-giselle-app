import { useEffect } from 'react';
import { Text, View } from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { ListenButton } from '@/components/activity/ChoicePrompt';
import type { VocabularyPrompt as VocabularyPromptData } from '@/services/lesson';

interface VocabularyPromptProps {
  prompt: VocabularyPromptData;
  // Nos tipos de ouvir, o áudio é a pergunta e toca ao abrir
  autoPlay: boolean;
  // A pronúncia, embaixo da palavra (só no "Fale a palavra")
  hint?: string | null;
}

// O que o aluno vê ou ouve. Só com áudio, o botão grande de ouvir no centro;
// com texto, a palavra em destaque e o botão redondo de ouvir ao lado.
export function VocabularyPrompt({
  prompt,
  autoPlay,
  hint,
}: VocabularyPromptProps) {
  const { play } = useActivityAudio();

  // biome-ignore lint/correctness/useExhaustiveDependencies: toca só quando a pergunta aparece
  useEffect(() => {
    if (autoPlay && prompt.audioUrl) {
      play(prompt.audioUrl);
    }
  }, []);

  if (!prompt.text) {
    return prompt.audioUrl ? (
      <View className="items-center py-2">
        <ListenButton url={prompt.audioUrl} />
      </View>
    ) : null;
  }

  return (
    <View className="min-h-36 items-center justify-center gap-2 rounded-3xl border border-gray-100 bg-gray-50 px-5 py-6">
      <View className="flex-row items-center justify-center gap-3">
        <Text className="shrink text-center font-poppins-bold text-3xl text-gray-900">
          {prompt.text}
        </Text>
        {prompt.audioUrl ? <AudioButton url={prompt.audioUrl} /> : null}
      </View>
      {hint ? (
        <Text className="text-center font-poppins text-base text-gray-500">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
