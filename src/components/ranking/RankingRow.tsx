import { Text, View } from 'react-native';

import type { RankingEntry } from '@/services/ranking';
import { formatPosition, formatScore } from '@/utils/ranking';

import { RankingAvatar } from './RankingAvatar';
import { ScoreValue } from './ScoreValue';

// Nome mostrado para a conta sem nome
export const STUDENT_FALLBACK_NAME = 'Aluno';

// Uma linha do ranking: posição, foto, nome com os dias seguidos embaixo e o
// score. A do próprio aluno fica destacada.
export function RankingRow({ entry }: { entry: RankingEntry }) {
  const name = entry.name ?? STUDENT_FALLBACK_NAME;

  return (
    <View
      accessible
      accessibilityLabel={`${formatPosition(entry.position)} lugar, ${name}${entry.isMe ? ' (você)' : ''}, ${formatScore(entry.score)} pontos, ${entry.streak} dias seguidos`}
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
          {entry.isMe ? <Text className="text-gray-500"> (você)</Text> : null}
        </Text>
        <Text className="font-poppins text-xs text-orange-600">
          🔥 {entry.streak} {entry.streak === 1 ? 'dia' : 'dias'}
        </Text>
      </View>
      <ScoreValue score={entry.score} />
    </View>
  );
}
