import { type Ref, useState } from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';

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
  // Abre o teclado ao aparecer. Falso quando o painel da resposta anterior
  // ainda está descendo: aí a atividade foca pelo inputRef quando ele some.
  autoFocus: boolean;
  inputRef: Ref<TextInputInstance>;
  onInteract: () => void;
  onChecked: (isCorrect: boolean) => void;
}

// Digitar a palavra em português, depois de ouvir ou de ler o significado
export function VocabularyWrite({
  question,
  exerciseType,
  autoFocus,
  inputRef,
  onInteract,
  onChecked,
}: VocabularyWriteProps) {
  const { stop } = useActivityAudio();
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = normalizeAnswer(typed) === '';

  function check() {
    if (isEmpty || result !== null) {
      return;
    }
    // O teclado sai para o painel aparecer inteiro
    Keyboard.dismiss();
    stop();
    const isCorrect = isAcceptedAnswer(question, typed);
    setResult(isCorrect);
    onChecked(isCorrect);
  }

  const border =
    result === null
      ? isFocused
        ? 'border-blue-500 bg-white'
        : 'border-gray-200 bg-white'
      : result
        ? 'border-green-600 bg-green-50'
        : 'border-red-500 bg-red-50';

  return (
    <View className="gap-6">
      <VocabularyPrompt
        prompt={question.prompt}
        autoPlay={exerciseType === 'listen_write'}
      />

      <View className="gap-2">
        <TextInput
          ref={inputRef}
          autoFocus={autoFocus}
          value={typed}
          onChangeText={(text) => {
            onInteract();
            setTyped(text);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={check}
          submitBehavior="submit"
          editable={result === null}
          placeholder="Escreva em português"
          placeholderTextColor={colors.gray}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          returnKeyType="done"
          accessibilityLabel="Sua resposta"
          className={`rounded-2xl border-2 px-4 py-4 text-center font-poppins-medium text-xl text-gray-900 ${border}`}
        />
        <Text className="text-center font-poppins text-xs text-gray-400">
          Acentos não contam.
        </Text>
      </View>

      <ActivityCheck disabled={isEmpty || result !== null} onCheck={check} />
    </View>
  );
}
