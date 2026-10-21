import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';

import { colors } from '@/constants/theme';

// A personagem de uma simulação: o avatar do cenário num círculo, no lugar da
// foto da Gisa, para ficar claro que é outra pessoa da cena. Sem avatar, um
// ícone de pessoa num círculo verde-claro.
export function SimulationAvatar({
  avatarUrl,
  size = 40,
}: {
  avatarUrl: string | null;
  size?: number;
}) {
  return (
    <View
      // A imagem não diz nada ao leitor de tela
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center overflow-hidden bg-green-100"
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          resizeMode="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.green} />
      )}
    </View>
  );
}
