import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { RankingEntry } from '@/services/ranking';
import { formatPosition, formatScore } from '@/utils/ranking';

import { RankingAvatar } from './RankingAvatar';
import { STUDENT_FALLBACK_NAME } from './RankingRow';
import { ScoreValue } from './ScoreValue';

// A medalha de cada posição: ouro, prata e bronze
const MEDALS: Record<number, { circle: string; text: string }> = {
  1: { circle: 'bg-yellow-300', text: 'text-yellow-900' },
  2: { circle: 'bg-gray-200', text: 'text-gray-700' },
  3: { circle: 'bg-orange-300', text: 'text-orange-900' },
};

// Os 3 primeiros, na ordem 2º, 1º, 3º. O 1º fica mais alto, com a foto maior,
// o anel verde e a coroa.
export function Podium({ entries }: { entries: RankingEntry[] }) {
  const [first, second, third] = entries;
  const places = [second, first, third].filter(
    (entry): entry is RankingEntry => entry !== undefined
  );

  return (
    <View className="flex-row items-start justify-center gap-2">
      {places.map((entry) => {
        const isFirst = entry.position === 1;
        const medal = MEDALS[entry.position];
        const name = entry.name ?? STUDENT_FALLBACK_NAME;

        return (
          <View
            key={entry.position}
            accessible
            accessibilityLabel={`${formatPosition(entry.position)} lugar, ${name}${entry.isMe ? ' (você)' : ''}, ${formatScore(entry.score)} pontos, ${entry.streak} dias seguidos`}
            // Os três dividem a largura, até 120 de cada, para caber no celular
            style={{ maxWidth: 120 }}
            className={`flex-1 items-center ${isFirst ? '' : 'mt-8'}`}
          >
            <View
              className={`mb-3 h-9 w-9 items-center justify-center rounded-full ${medal.circle}`}
            >
              <Text className={`font-poppins-bold text-xs ${medal.text}`}>
                {formatPosition(entry.position)}
              </Text>
            </View>

            <View>
              <View
                className={
                  isFirst ? 'rounded-full border-4 border-green-500 p-0.5' : ''
                }
              >
                <RankingAvatar
                  name={entry.name}
                  image={entry.image}
                  size={isFirst ? 84 : 60}
                />
              </View>
              {isFirst ? (
                <View className="absolute -bottom-3 left-0 right-0 items-center">
                  <View className="h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-600">
                    <MaterialCommunityIcons
                      name="crown"
                      size={16}
                      color={colors.crown}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            <Text
              numberOfLines={1}
              className={`font-poppins-semibold text-gray-900 ${
                isFirst ? 'mt-5 text-lg' : 'mt-3 text-base'
              }`}
            >
              {name}
            </Text>
            <Text className="font-poppins text-xs text-orange-600">
              🔥 {entry.streak}
              {entry.isMe ? ' · você' : ''}
            </Text>
            <View className="mt-1">
              <ScoreValue score={entry.score} size={isFirst ? 'md' : 'sm'} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
