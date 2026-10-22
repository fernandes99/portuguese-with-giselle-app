import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { useActivityAudio } from '@/components/activity/ActivityAudio';
import { ActivityCheck } from '@/components/activity/ActivityFooter';
import { VocabularyPrompt } from '@/components/activity/vocabulary/VocabularyPrompt';
import { colors } from '@/constants/theme';
import type {
  VocabularyExerciseType,
  VocabularyQuestion,
} from '@/services/lesson';
import { isAcceptedAnswer, normalizeAnswer } from '@/utils/vocabularyActivity';

interface VocabularyWriteProps {
  question: Extract<VocabularyQuestion, { kind: 'write' }>;
  exerciseType: VocabularyExerciseType;
  onInteract: () => void;
  onChecked: (isCorrect: boolean) => void;
}

// Digitar a palavra em português, depois de ouvir ou de ler o significado
export function VocabularyWrite({
  question,
  exerciseType,
  onInteract,
  onChecked,
}: VocabularyWriteProps) {
  const { stop } = useActivityAudio();
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const isEmpty = normalizeAnswer(typed) === '';

  function check() {
    if (isEmpty || result !== null) {
      return;
    }
    stop();
    const isCorrect = isAcceptedAnswer(question, typed);
    setResult(isCorrect);
    onChecked(isCorrect);
  }

  const border =
    result === null
      ? 'border-gray-200 bg-white'
      : result
        ? 'border-green-600 bg-green-50'
        : 'border-red-500 bg-red-50';

  return (
    <View className="gap-5">
      <VocabularyPrompt
        prompt={question.prompt}
        autoPlay={exerciseType === 'listen_write'}
        audioLabel="Ouvir a palavra"
      />

      <TextInput
        value={typed}
        onChangeText={(text) => {
          onInteract();
          setTyped(text);
        }}
        onSubmitEditing={check}
        editable={result === null}
        placeholder="Escreva em português"
        placeholderTextColor={colors.gray}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
        returnKeyType="done"
        accessibilityLabel="Sua resposta"
        className={`rounded-2xl border-2 px-4 py-4 font-poppins text-lg text-gray-900 ${border}`}
      />

      <ActivityCheck disabled={isEmpty || result !== null} onCheck={check} />
    </View>
  );
}
