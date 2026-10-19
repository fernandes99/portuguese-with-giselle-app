import { Image } from 'react-native';

import gisaAvatar from '@assets/gisa-avatar.png';

// Ilustração da Gisa, usada ao lado das falas dela, no cabeçalho do chat e
// no cartão da aba Praticar. Sem rótulo: o nome já aparece ao lado.
export function GisaAvatar({ size }: { size: number }) {
  return (
    <Image
      source={gisaAvatar}
      accessibilityIgnoresInvertColors
      importantForAccessibility="no"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}
