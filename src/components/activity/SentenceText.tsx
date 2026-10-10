import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { tokenizeText } from '@/utils/sentence';

// Termo com tradução: toque para mostrar ou esconder o significado
function TipWord({ text, tip }: { text: string; tip: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Text
      accessibilityRole="button"
      accessibilityHint="Mostra a tradução"
      onPress={() => setIsOpen((value) => !value)}
      className="font-poppins text-base text-cyan-700 underline"
    >
      {text}
      {isOpen ? (
        <Text className="font-poppins text-sm text-gray-500 no-underline">
          {' '}
          ({tip})
        </Text>
      ) : null}
    </Text>
  );
}

// Trecho de texto de uma frase, palavra por palavra. Precisa ficar dentro de
// um container flex-row flex-wrap, ao lado das lacunas.
export function SentenceText({ text }: { text: string }) {
  const tokens = useMemo(() => tokenizeText(text), [text]);

  return tokens.map((token, index) =>
    token.type === 'tip' ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
      <TipWord key={index} text={token.text} tip={token.tip} />
    ) : (
      <Text
        // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
        key={index}
        className="font-poppins text-base text-gray-900"
      >
        {token.text}
      </Text>
    )
  );
}
