import { Text, View } from 'react-native';

import type { Badge, BadgeTone } from '@/utils/billing';

const TONES: Record<BadgeTone, { box: string; text: string }> = {
  green: { box: 'bg-green-50', text: 'text-green-700' },
  yellow: { box: 'bg-yellow-50', text: 'text-yellow-700' },
  red: { box: 'bg-red-50', text: 'text-red-700' },
  gray: { box: 'bg-gray-100', text: 'text-gray-600' },
};

// Etiqueta de situação de um pagamento ou da assinatura
export function StatusBadge({ badge }: { badge: Badge }) {
  const tone = TONES[badge.tone];

  return (
    <View className={`self-start rounded-full px-2.5 py-0.5 ${tone.box}`}>
      <Text className={`font-poppins-semibold text-xs ${tone.text}`}>
        {badge.label}
      </Text>
    </View>
  );
}
