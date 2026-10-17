import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import {
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { colors } from '@/constants/theme';
import {
  type ChoiceAlternative,
  type ChoiceExercise,
  type ChoicePromptKind,
  getLetter,
  isAudio,
  isImage,
} from '@/utils/choice';

// selected: escolhida antes de verificar (azul, para não se confundir com o
// verde do acerto); faded: as que não importam depois de verificar. Valem
// também para os botões do verdadeiro ou falso.
export type AlternativeState =
  'idle' | 'selected' | 'correct' | 'wrong' | 'faded';

export const ALTERNATIVE_STYLES: Record<
  AlternativeState,
  { box: string; chip: string; letter: string; icon: string }
> = {
  idle: {
    box: 'border-gray-200 bg-white',
    chip: 'bg-gray-100',
    letter: 'text-gray-600',
    icon: colors.gray,
  },
  selected: {
    box: 'border-blue-500 bg-blue-50',
    chip: 'bg-blue-500',
    letter: 'text-white',
    icon: colors.blue,
  },
  correct: {
    box: 'border-green-600 bg-green-50',
    chip: 'bg-green-600',
    letter: 'text-white',
    icon: colors.green,
  },
  wrong: {
    box: 'border-red-500 bg-red-50',
    chip: 'bg-red-500',
    letter: 'text-white',
    icon: colors.red,
  },
  faded: {
    box: 'border-gray-200 bg-white opacity-50',
    chip: 'bg-gray-100',
    letter: 'text-gray-600',
    icon: colors.gray,
  },
};

export function getAlternativeState(
  isCorrect: boolean,
  isSelected: boolean,
  isChecked: boolean
): AlternativeState {
  if (!isChecked) return isSelected ? 'selected' : 'idle';
  // Depois de verificar, a correta fica sempre em verde
  if (isCorrect) return 'correct';
  return isSelected ? 'wrong' : 'faded';
}

function getAccessibilityLabel(
  alternative: ChoiceAlternative,
  position: number
) {
  const title = alternative.title.trim();
  return title
    ? `${getLetter(position)}: ${title}`
    : `Alternativa ${getLetter(position)}`;
}

interface ChoiceAlternativesProps {
  exercise: ChoiceExercise;
  kind: ChoicePromptKind;
  selected: string[];
  isChecked: boolean;
  allowsMultiple: boolean;
  onSelect: (alternativeId: string) => void;
}

// Alternativas de um exercício: em lista quando têm texto, ou em grade de
// cartões de áudio quando são só áudios
export function ChoiceAlternatives({
  exercise,
  kind,
  selected,
  isChecked,
  allowsMultiple,
  onSelect,
}: ChoiceAlternativesProps) {
  const { playingUrl, play } = useActivityAudio();
  const role = allowsMultiple ? 'checkbox' : 'radio';

  if (kind === 'pick-audio') {
    return (
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {exercise.alternatives.map((alternative, position) => {
          const isSelected = selected.includes(alternative.id);
          const style =
            ALTERNATIVE_STYLES[
              getAlternativeState(alternative.isCorrect, isSelected, isChecked)
            ];
          const url = alternative.file?.url ?? '';
          const isPlaying = playingUrl === url;

          return (
            <Pressable
              key={alternative.id}
              accessibilityRole={role}
              accessibilityLabel={getAccessibilityLabel(alternative, position)}
              accessibilityHint="Toca o áudio e escolhe esta alternativa"
              accessibilityState={{ checked: isSelected }}
              // Depois de verificar, o toque ainda toca o áudio
              onPress={() => {
                play(url);
                if (!isChecked) onSelect(alternative.id);
              }}
              className={`h-32 w-[48%] items-center justify-center rounded-2xl border-2 ${style.box}`}
            >
              <View
                className={`absolute left-3 top-3 h-7 w-7 items-center justify-center rounded-lg ${style.chip}`}
              >
                <Text className={`font-poppins-bold text-xs ${style.letter}`}>
                  {getLetter(position)}
                </Text>
              </View>
              <Ionicons
                name={isPlaying ? 'volume-high' : 'volume-high-outline'}
                size={40}
                color={style.icon}
              />
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="gap-3">
      {exercise.alternatives.map((alternative, position) => {
        const isSelected = selected.includes(alternative.id);
        const state = getAlternativeState(
          alternative.isCorrect,
          isSelected,
          isChecked
        );
        const style = ALTERNATIVE_STYLES[state];

        return (
          <Pressable
            key={alternative.id}
            accessibilityRole={role}
            accessibilityLabel={getAccessibilityLabel(alternative, position)}
            accessibilityState={{ checked: isSelected, disabled: isChecked }}
            disabled={isChecked}
            onPress={() => onSelect(alternative.id)}
            className={`gap-3 rounded-2xl border-2 p-4 ${style.box}`}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`h-9 w-9 items-center justify-center rounded-xl ${style.chip}`}
              >
                <Text className={`font-poppins-bold text-sm ${style.letter}`}>
                  {getLetter(position)}
                </Text>
              </View>
              <Text className="flex-1 font-poppins-medium text-base text-gray-900">
                {alternative.title}
              </Text>
              {isAudio(alternative.file) ? (
                <AudioButton url={alternative.file.url} />
              ) : null}
              {state === 'correct' ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.green}
                />
              ) : null}
              {state === 'wrong' ? (
                <Ionicons name="close-circle" size={24} color={colors.red} />
              ) : null}
            </View>
            {isImage(alternative.file) ? (
              <Image
                source={{
                  uri: `${alternative.file.url}?w=600&auto=compress`,
                }}
                resizeMode="contain"
                className="h-32 w-full rounded-lg bg-gray-100"
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// Resposta certa de um exercício, para o painel de erro
export function ChoiceAnswer({ exercise }: { exercise: ChoiceExercise }) {
  return exercise.alternatives.map((alternative, position) =>
    alternative.isCorrect ? (
      <View key={alternative.id} className="flex-row items-center gap-3">
        <Text className="flex-1 font-poppins-medium text-base text-gray-900">
          {alternative.title.trim() || `Alternativa ${getLetter(position)}`}
        </Text>
        {isAudio(alternative.file) ? (
          <AudioButton url={alternative.file.url} />
        ) : null}
      </View>
    ) : null
  );
}
