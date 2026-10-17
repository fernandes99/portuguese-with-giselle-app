import { Text } from 'react-native';

import { type SentencePart, toPlainText } from '@/utils/sentence';

// Frase completa com as respostas certas em destaque, para o painel de erro
// do arrastar e do preencher lacunas
export function SentenceAnswer({ parts }: { parts: SentencePart[] }) {
  return (
    <Text className="font-poppins text-base text-gray-900">
      {parts.map((part, partIndex) =>
        part.type === 'text' ? (
          toPlainText(part.text)
        ) : (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: as partes de uma frase não mudam de ordem
            key={partIndex}
            className="font-poppins-semibold text-green-700"
          >
            {part.answer}
          </Text>
        )
      )}
    </Text>
  );
}
