import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { tokenizeText } from '@/utils/sentence';

// lg: frase em destaque, como o enunciado de uma pergunta
type SentenceSize = 'base' | 'lg';

const SIZE_CLASS_NAMES: Record<SentenceSize, string> = {
  base: 'font-poppins text-base',
  lg: 'font-poppins-semibold text-2xl',
};

// Termo com tradução: toque para mostrar ou esconder o significado
function TipWord({
  text,
  tip,
  size,
}: {
  text: string;
  tip: string;
  size: SentenceSize;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Text
      accessibilityRole="button"
      accessibilityHint="Mostra a tradução"
      onPress={() => setIsOpen((value) => !value)}
      className={`${SIZE_CLASS_NAMES[size]} text-cyan-700 underline`}
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
export function SentenceText({
  text,
  size = 'base',
}: {
  text: string;
  size?: SentenceSize;
}) {
  const tokens = useMemo(() => tokenizeText(text), [text]);

  return tokens.map((token, index) =>
    token.type === 'tip' ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
      <TipWord key={index} text={token.text} tip={token.tip} size={size} />
    ) : (
      <Text
        // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
        key={index}
        className={`${SIZE_CLASS_NAMES[size]} text-gray-900`}
      >
        {token.text}
      </Text>
    )
  );
}
