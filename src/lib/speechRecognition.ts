import { requireOptionalNativeModule } from 'expo';
import type { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

// O reconhecimento de fala do Android e do iPhone (expo-speech-recognition).
// Carregado como opcional: o Expo Go e um build antigo não têm o módulo
// nativo, e o import normal do pacote quebraria o app ao abrir. Sem ele, o
// valor é null e a pronúncia usa a gravação. Do pacote só vêm os tipos.
export const speechRecognition = requireOptionalNativeModule<
  typeof ExpoSpeechRecognitionModule
>('ExpoSpeechRecognition');

// O aparelho tem o módulo e um serviço de reconhecimento (no Android, o do
// app do Google)
export function isSpeechRecognitionAvailable() {
  try {
    return speechRecognition?.isRecognitionAvailable() ?? false;
  } catch {
    return false;
  }
}
