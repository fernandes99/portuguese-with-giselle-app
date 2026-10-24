import { Text, View } from 'react-native';

import type { RankingEntry } from '@/services/ranking';

import { RankingAvatar } from './RankingAvatar';

// Nome mostrado para a conta sem nome
export const STUDENT_FALLBACK_NAME = 'Aluno';

// Uma linha do ranking: posição, foto, nome, dias seguidos e score. A do
// próprio aluno fica destacada.
export function RankingRow({ entry }: { entry: RankingEntry }) {
  const name = entry.name ?? STUDENT_FALLBACK_NAME;

  return (
    <View
      accessible
      accessibilityLabel={`${entry.position}º lugar, ${name}${entry.isMe ? ' (você)' : ''}, ${entry.score} pontos, ${entry.streak} dias seguidos`}
      className={`flex-row items-center gap-3 rounded-2xl border px-3 py-2.5 ${
        entry.isMe ? 'border-green-200 bg-green-50' : 'border-transparent'
      }`}
    >
      <Text className="w-8 text-center font-poppins-bold text-sm text-gray-500">
        {entry.position}
      </Text>
      <RankingAvatar name={entry.name} image={entry.image} size={36} />
      <Text
        numberOfLines={1}
        className="flex-1 font-poppins-medium text-sm text-gray-900"
      >
        {name}
        {entry.isMe ? <Text className="text-gray-500"> (você)</Text> : null}
      </Text>
      <Text className="font-poppins text-xs text-orange-600">
        🔥 {entry.streak}
      </Text>
      <Text className="w-12 text-right font-poppins-bold text-sm text-green-700">
        {entry.score}
      </Text>
    </View>
  );
}
