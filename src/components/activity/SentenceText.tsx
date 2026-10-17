import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { tokenizeText } from '@/utils/sentence';

// md: frase com lacunas em destaque; lg: enunciado de uma pergunta
export type SentenceSize = 'base' | 'md' | 'lg';

// Fonte normal e em negrito de cada tamanho
const SIZE_CLASS_NAMES: Record<SentenceSize, [string, string]> = {
  base: ['font-poppins text-base', 'font-poppins-bold text-base'],
  md: ['font-poppins text-xl', 'font-poppins-bold text-xl'],
  lg: ['font-poppins-semibold text-2xl', 'font-poppins-bold text-2xl'],
};

function getFontClassName(size: SentenceSize, bold: boolean) {
  return SIZE_CLASS_NAMES[size][bold ? 1 : 0];
}

// Termo com tradução: toque para mostrar ou esconder o significado
function TipWord({
  text,
  tip,
  className,
}: {
  text: string;
  tip: string;
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Text
      accessibilityRole="button"
      accessibilityHint="Mostra a tradução"
      onPress={() => setIsOpen((value) => !value)}
      className={`${className} text-cyan-700 underline`}
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

  return tokens.map((token, index) => {
    if (token.type === 'break') {
      // Ocupa a linha inteira do flex-wrap: o que vem depois desce
      // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
      return <View key={index} className="w-full" />;
    }

    const className = getFontClassName(size, token.bold);

    return token.type === 'tip' ? (
      <TipWord
        // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
        key={index}
        text={token.text}
        tip={token.tip}
        className={className}
      />
    ) : (
      <Text
        // biome-ignore lint/suspicious/noArrayIndexKey: as palavras de uma frase não mudam de ordem
        key={index}
        className={`${className} text-gray-900`}
      >
        {token.text}
      </Text>
    );
  });
}
