import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { RankingEntry, RankingPeriod } from '@/services/ranking';

import { RankingRow } from './RankingRow';

// A linha do próprio aluno, presa no pé da tela, fora da rolagem. O menu de
// baixo vem logo depois e já cuida da área segura.
export function MyRankingBar({
  me,
  period,
}: {
  me: RankingEntry | null;
  period: RankingPeriod;
}) {
  const { t } = useTranslation();

  return (
    <View className="border-t border-gray-200 bg-white px-4 py-2">
      {me ? (
        <RankingRow entry={me} />
      ) : (
        <Text className="py-3 text-center font-poppins text-sm text-gray-600">
          {t(
            period === 'month'
              ? 'account.ranking.earnMonth'
              : 'account.ranking.earn'
          )}
        </Text>
      )}
    </View>
  );
}
