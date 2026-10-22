import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ALTERNATIVE_STYLES } from '@/components/activity/ChoiceAlternatives';
import type { VocabularyQuestion } from '@/services/lesson';

interface VocabularyPairsProps {
  question: Extract<VocabularyQuestion, { kind: 'pairs' }>;
  onInteract: () => void;
  // Todos ligados: a atividade abre o painel de acerto
  onFinished: (hadMistake: boolean) => void;
}

type Side = 'term' | 'meaning';

interface Piece {
  vocabularyId: string;
  text: string;
}

// Tempo que o par errado fica vermelho
const MISTAKE_FLASH_MS = 600;

function shuffle<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Ligar cada palavra ao significado. O par errado pisca e as peças voltam a
// ficar soltas; o grupo acaba quando todos estão ligados.
export function VocabularyPairs({
  question,
  onInteract,
  onFinished,
}: VocabularyPairsProps) {
  const [terms] = useState<Piece[]>(() =>
    shuffle(
      question.pairs.map((pair) => ({
        vocabularyId: pair.vocabularyId,
        text: pair.term,
      }))
    )
  );
  const [meanings] = useState<Piece[]>(() =>
    shuffle(
      question.pairs.map((pair) => ({
        vocabularyId: pair.vocabularyId,
        text: pair.meaning,
      }))
    )
  );
  const [selected, setSelected] = useState<Record<Side, string | null>>({
    term: null,
    meaning: null,
  });
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<Record<Side, string> | null>(null);
  const [hadMistake, setHadMistake] = useState(false);

  // O par errado volta ao normal depois de piscar
  useEffect(() => {
    if (!wrong) {
      return;
    }
    const timer = setTimeout(() => setWrong(null), MISTAKE_FLASH_MS);
    return () => clearTimeout(timer);
  }, [wrong]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: avisa só quando o último par é ligado
  useEffect(() => {
    if (matched.length === question.pairs.length) {
      onFinished(hadMistake);
    }
  }, [matched.length]);

  function pick(side: Side, vocabularyId: string) {
    if (matched.includes(vocabularyId)) {
      return;
    }
    onInteract();

    const next = { ...selected, [side]: vocabularyId };
    if (!next.term || !next.meaning) {
      setSelected(next);
      return;
    }

    // Uma peça de cada lado: confere o par e solta as duas
    setSelected({ term: null, meaning: null });
    if (next.term === next.meaning) {
      setMatched((previous) => [...previous, vocabularyId]);
      return;
    }
    setHadMistake(true);
    setWrong({ term: next.term, meaning: next.meaning });
  }

  function renderColumn(side: Side, pieces: Piece[]) {
    return (
      <View className="flex-1 gap-3">
        {pieces.map((piece) => {
          const isMatched = matched.includes(piece.vocabularyId);
          const isSelected = selected[side] === piece.vocabularyId;
          const state = isMatched
            ? 'correct'
            : wrong?.[side] === piece.vocabularyId
              ? 'wrong'
              : isSelected
                ? 'selected'
                : 'idle';
          return (
            <Pressable
              key={piece.vocabularyId}
              accessibilityRole="button"
              accessibilityLabel={piece.text}
              accessibilityState={{ selected: isSelected, disabled: isMatched }}
              onPress={() => pick(side, piece.vocabularyId)}
              disabled={isMatched}
              className={`min-h-14 justify-center rounded-2xl border-2 p-3 ${ALTERNATIVE_STYLES[state].box}`}
            >
              <Text className="font-poppins text-sm text-gray-900">
                {piece.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      {renderColumn('term', terms)}
      {renderColumn('meaning', meanings)}
    </View>
  );
}
