import { cssInterop } from 'nativewind';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';

// Componentes de teclado do react-native-keyboard-controller. Com a tela
// cheia do Android (edge-to-edge), o sistema não encolhe mais a tela quando o
// teclado abre: o KeyboardAvoidingView e o automaticallyAdjustKeyboardInsets
// do React Native deixam os campos atrás do teclado. Use estes no lugar.
//
// - KeyboardAwareScrollView: telas que rolam. Leva o campo focado para cima
//   do teclado.
// - KeyboardAvoidingView com behavior="padding" e automaticOffset: telas com
//   um campo ou botão fixo no pé (chats, rodapé da boas-vindas), que sobe
//   junto com o teclado.
//
// O cssInterop faz o NativeWind aceitar className nos dois, como nos
// componentes do React Native.
cssInterop(KeyboardAvoidingView, { className: 'style' });
cssInterop(KeyboardAwareScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

// Distância entre o campo focado e o topo do teclado
export const KEYBOARD_BOTTOM_OFFSET = 24;

export { KeyboardAvoidingView, KeyboardAwareScrollView };
export {
  KeyboardProvider,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
