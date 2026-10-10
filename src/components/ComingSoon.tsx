import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

interface ComingSoonProps {
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

// Conteúdo provisório das abas que ainda não foram construídas
export function ComingSoon({ title, icon }: ComingSoonProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Ionicons name={icon} size={48} color={colors.green} />
        <Text className="font-poppins-bold text-2xl text-gray-900">
          {title}
        </Text>
        <Text className="font-poppins text-base text-gray-600">Em breve</Text>
      </View>
    </SafeAreaView>
  );
}
