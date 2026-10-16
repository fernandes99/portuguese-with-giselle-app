import { Text, View } from 'react-native';

import { Button } from '@/components/Button';

// Aviso centralizado no meio da conversa: o de IA no topo e a troca de
// idioma pedida à Gisa
export function ChatNotice({ text }: { text: string }) {
  return (
    <Text className="self-center px-6 text-center font-poppins text-xs text-gray-500">
      {text}
    </Text>
  );
}

// Aviso no lugar do campo de mensagem, quando o chat parou: limite de uso
// ou conversa longa demais (com o botão de recomeçar)
export function ChatStopNotice({
  message,
  onRestart,
}: {
  message: string;
  onRestart?: () => void;
}) {
  return (
    <View className="gap-2 border-t border-gray-200 bg-white px-4 py-4">
      <Text className="text-center font-poppins text-sm text-gray-700">
        {message}
      </Text>
      {onRestart ? (
        <Button variant="link" label="Recomeçar" onPress={onRestart} />
      ) : null}
    </View>
  );
}
