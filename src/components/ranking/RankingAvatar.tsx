import { Image, Text, View } from 'react-native';

// Iniciais de "Maria S." (MS); sem nome, A de Aluno
function getInitials(name: string | null) {
  const words = name?.split(/\s+/).filter(Boolean) ?? [];
  if (words.length === 0) {
    return 'A';
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

// Foto do aluno num círculo ou, na falta dela, as iniciais
export function RankingAvatar({
  name,
  image,
  size = 40,
}: {
  name: string | null;
  image: string | null;
  size?: number;
}) {
  return (
    <View
      // A foto não diz nada ao leitor de tela; o nome está ao lado
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center overflow-hidden bg-green-600"
    >
      {image ? (
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <Text
          style={{ fontSize: size * 0.36 }}
          className="font-poppins-semibold text-white"
        >
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
