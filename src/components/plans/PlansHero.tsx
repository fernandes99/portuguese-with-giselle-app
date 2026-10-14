import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

// Bloco do alto da tela de planos: a chamada de venda e o botão de fechar
export function PlansHero({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 12 }}
      className="rounded-b-3xl bg-green-700 px-6 pb-8"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        onPress={onClose}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center self-end rounded-full bg-white/15 active:bg-white/25"
      >
        <Ionicons name="close" size={22} color={colors.white} />
      </Pressable>

      <View className="items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-white/15">
          <MaterialCommunityIcons name="crown" size={30} color={colors.crown} />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center font-poppins-bold text-[26px] leading-8 text-white"
        >
          Fale português com confiança
        </Text>
        <Text className="text-center font-poppins text-base leading-6 text-green-50">
          Aulas completas, prática todos os dias e a professora Giselle ao seu
          lado.
        </Text>
      </View>
    </View>
  );
}
