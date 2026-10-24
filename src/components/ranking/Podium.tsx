import { Text, View } from 'react-native';

import type { RankingEntry } from '@/services/ranking';

import { RankingAvatar } from './RankingAvatar';
import { STUDENT_FALLBACK_NAME } from './RankingRow';

// Altura do degrau de cada posição
const STEP_HEIGHT: Record<number, number> = { 1: 88, 2: 64, 3: 48 };

// Os 3 primeiros, na ordem 2º, 1º, 3º, com o 1º no degrau mais alto
export function Podium({ entries }: { entries: RankingEntry[] }) {
  const [first, second, third] = entries;
  const places = [second, first, third].filter(
    (entry): entry is RankingEntry => entry !== undefined
  );

  return (
    <View className="flex-row items-end justify-center gap-3">
      {places.map((entry) => {
        const name = entry.name ?? STUDENT_FALLBACK_NAME;

        return (
          <View
            key={entry.position}
            accessible
            accessibilityLabel={`${entry.position}º lugar, ${name}${entry.isMe ? ' (você)' : ''}, ${entry.score} pontos`}
            // Os três dividem a largura, até 112 de cada, para caber no celular
            style={{ maxWidth: 112 }}
            className="flex-1 items-center"
          >
            <RankingAvatar
              name={entry.name}
              image={entry.image}
              size={entry.position === 1 ? 64 : 52}
            />
            <Text
              numberOfLines={1}
              className="mt-2 font-poppins-medium text-sm text-gray-900"
            >
              {name}
            </Text>
            <Text className="font-poppins-bold text-sm text-green-700">
              {entry.score}
            </Text>
            <View
              style={{ height: STEP_HEIGHT[entry.position] }}
              className={`mt-2 w-full items-center rounded-t-2xl border pt-2 ${
                entry.isMe
                  ? 'border-green-200 bg-green-50'
                  : 'border-blue-100 bg-blue-50'
              }`}
            >
              <Text
                className={`font-poppins-bold text-lg ${
                  entry.isMe ? 'text-green-700' : 'text-blue-600'
                }`}
              >
                {entry.position}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
