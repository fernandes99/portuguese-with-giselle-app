import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Espaço de baixo para o conteúdo de um Modal. No Android, o Modal já termina
// acima da barra de navegação: somar insets.bottom deixaria uma faixa vazia.
// Ligar navigationBarTranslucent no Modal não serve: o conteúdo passa a ser
// medido sem a barra e o pé fica cortado embaixo dela. No iPhone, o Modal vai
// até o fim da tela e precisa da área do indicador.
export function useModalBottomInset() {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' ? 0 : insets.bottom;
}
