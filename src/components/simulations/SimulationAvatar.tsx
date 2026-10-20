import { Text, View } from 'react-native';

// A personagem de uma simulação: o emoji do cenário num círculo, no lugar da
// foto da Gisa, para ficar claro que é outra pessoa da cena
export function SimulationAvatar({
  emoji,
  size = 40,
}: {
  emoji: string;
  size?: number;
}) {
  return (
    <View
      // O emoji não diz nada ao leitor de tela
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-green-100"
    >
      <Text
        style={{ fontSize: size * 0.5, includeFontPadding: false }}
        className="text-center"
      >
        {emoji}
      </Text>
    </View>
  );
}
