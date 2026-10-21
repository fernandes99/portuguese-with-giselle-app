import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { colors } from '@/constants/theme';
import type { Simulation } from '@/services/simulations';
import { getCardBadge } from '@/utils/simulations';

// Degradê escuro de baixo para cima, para o título branco ler sobre qualquer
// foto. O React Native já desenha o linear-gradient, sem biblioteca.
const SHADE = {
  experimental_backgroundImage:
    'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 60%)',
};

// Um cenário na grade de simulações: a foto inteira, o título e a categoria
// sobre o degradê e, no alto, "Feita" ou a etiqueta Premium. Quem chama
// decide para onde o toque leva.
export function SimulationCard({
  simulation,
  onPress,
}: {
  simulation: Simulation;
  onPress: () => void;
}) {
  const badge = getCardBadge(simulation);
  const label = [
    simulation.title,
    simulation.category.title,
    badge === 'premium' ? 'exclusivo do plano Premium' : null,
    badge === 'done' ? 'feita' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        badge === 'premium' ? 'Abre a tela do plano Premium' : undefined
      }
      onPress={onPress}
      className="h-[210px] overflow-hidden rounded-3xl bg-gray-700 active:opacity-80"
    >
      {/* Enquanto carrega, ou se falhar, fica o fundo escuro do cartão, que
      deixa o título branco legível */}
      <Image
        source={{ uri: simulation.thumbnailUrl }}
        resizeMode="cover"
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0" style={SHADE} />

      {badge ? (
        <View className="absolute right-2.5 top-2.5">
          {badge === 'premium' ? (
            <PremiumBadge />
          ) : (
            <View className="flex-row items-center gap-1 rounded-full bg-white px-2 py-0.5">
              <Ionicons name="checkmark" size={12} color={colors.green} />
              <Text
                style={{ includeFontPadding: false }}
                className="font-poppins-semibold text-[11px] leading-4 text-green-700"
              >
                Feita
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View className="absolute bottom-3 left-3 right-3 gap-2">
        <Text
          numberOfLines={2}
          className="font-poppins-bold text-[15px] leading-5 text-white"
        >
          {simulation.title}
        </Text>
        <View className="max-w-full self-start rounded-full bg-white/90 px-2.5 py-0.5">
          <Text
            numberOfLines={1}
            style={{ includeFontPadding: false }}
            className="font-poppins-semibold text-[11px] leading-4 text-gray-900"
          >
            {simulation.category.title}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
