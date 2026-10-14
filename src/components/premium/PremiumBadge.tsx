import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';

// Etiqueta "Premium" com a coroa do Perfil: marca o que é exclusivo do plano
// para quem ainda não assina. Só visual; o toque é de quem a usa.
export function PremiumBadge() {
  return (
    <View
      // O texto da etiqueta entra no rótulo de quem a usa
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      className="flex-row items-center gap-1 self-start rounded-full bg-green-600 px-2 py-0.5"
    >
      <MaterialCommunityIcons name="crown" size={12} color={colors.crown} />
      <Text
        style={{ includeFontPadding: false }}
        className="font-poppins-semibold text-[11px] leading-4 text-white"
      >
        Premium
      </Text>
    </View>
  );
}
