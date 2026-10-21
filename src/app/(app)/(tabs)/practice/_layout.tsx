import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

// Pilha da aba Praticar: as telas daqui ficam com o menu de baixo e a aba
// Praticar em destaque. Por enquanto, só a lista de simulações; os detalhes e
// a conversa de uma simulação ficam em tela cheia, fora das abas. Tocar em
// Praticar com a lista aberta volta para o começo da aba.
export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
