import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

// Pilha da aba Progresso: as telas daqui ficam com o menu de baixo e a aba
// Progresso em destaque, como a lista de simulações na aba Praticar. Por
// enquanto, só o ranking. Tocar em Progresso com o ranking aberto volta para o
// começo da aba.
export default function ProgressLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
