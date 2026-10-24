import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RankingEntry, RankingPeriod } from '@/services/ranking';

import { RankingRow } from './RankingRow';

// A linha do próprio aluno, presa no pé da tela, fora da rolagem
export function MyRankingBar({
  me,
  period,
}: {
  me: RankingEntry | null;
  period: RankingPeriod;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="border-t border-gray-200 bg-white px-4 pt-2"
    >
      {me ? (
        <RankingRow entry={me} />
      ) : (
        <Text className="py-3 text-center font-poppins text-sm text-gray-600">
          {period === 'month'
            ? 'Ganhe pontos neste mês para entrar no ranking'
            : 'Ganhe pontos para entrar no ranking'}
        </Text>
      )}
    </View>
  );
}
