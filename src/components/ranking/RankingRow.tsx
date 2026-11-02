import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { RankingEntry } from '@/services/ranking';
import { formatStreak } from '@/utils/format';
import { formatPosition, formatScore } from '@/utils/ranking';

import { RankingAvatar } from './RankingAvatar';
import { ScoreValue } from './ScoreValue';

// Uma linha do ranking: posição, foto, nome com os dias seguidos embaixo e o
// score. A do próprio aluno fica destacada.
export function RankingRow({ entry }: { entry: RankingEntry }) {
  const { t } = useTranslation();

  const name = entry.name ?? t('lesson.discussions.student');

  return (
    <View
      accessible
      accessibilityLabel={t('account.ranking.entryLabel', {
        position: formatPosition(entry.position),
        name,
        you: entry.isMe ? t('account.ranking.you') : '',
        score: formatScore(entry.score),
        streak: entry.streak,
      })}
      className={`flex-row items-center gap-3 rounded-2xl px-3 py-3 ${
        entry.isMe ? 'border border-green-200 bg-green-50' : ''
      }`}
    >
      <Text className="w-9 font-poppins-semibold text-sm text-gray-500">
        {formatPosition(entry.position)}
      </Text>
      <RankingAvatar name={entry.name} image={entry.image} size={44} />
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="font-poppins-medium text-base text-gray-900"
        >
          {name}
          {entry.isMe ? (
            <Text className="text-gray-500">{t('account.ranking.you')}</Text>
          ) : null}
        </Text>
        <Text className="font-poppins text-xs text-orange-600">
          🔥 {formatStreak(entry.streak)}
        </Text>
      </View>
      <ScoreValue score={entry.score} />
    </View>
  );
}
