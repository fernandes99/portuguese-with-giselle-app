import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { TabTopBar } from '@/components/TabTopBar';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { canUsePractice } from '@/utils/practice';

interface PracticeOptionProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  // Exclusiva do plano Premium e a conta não assina: mostra a etiqueta, e o
  // toque leva à tela de planos (quem chama decide para onde)
  isPremiumOnly?: boolean;
  onPress: () => void;
}

function PracticeOption({
  icon,
  title,
  description,
  isPremiumOnly = false,
  onPress,
}: PracticeOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isPremiumOnly ? `${title}, exclusivo do plano Premium` : title
      }
      accessibilityHint={
        isPremiumOnly ? 'Abre a tela do plano Premium' : undefined
      }
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <Ionicons name={icon} size={22} color={colors.green} />
      </View>
      <View className="flex-1 gap-0.5">
        {isPremiumOnly ? <PremiumBadge /> : null}
        <Text className="font-poppins-semibold text-base text-gray-900">
          {title}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </Pressable>
  );
}

// Formas de praticar o idioma: o chat com a IA, os flashcards, o vocabulário
// e as aulas particulares com a professora
export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow gap-5 px-5 pb-8 pt-3">
        <TabTopBar />
        <View>
          <Text className="font-poppins-bold text-3xl text-gray-900">
            Praticar
          </Text>
          <Text className="mt-1 font-poppins text-base text-gray-600">
            Escolha como treinar seu português.
          </Text>
        </View>

        <View className="gap-3">
          <PracticeOption
            icon="chatbubbles"
            title="Chat com IA"
            description="Converse com a Gisa, sua parceira de conversação com IA, e receba correções a cada frase."
            isPremiumOnly={!canUsePractice(user)}
            onPress={() =>
              router.push(canUsePractice(user) ? '/practice/chat' : '/plans')
            }
          />
          <PracticeOption
            icon="albums"
            title="Flashcards"
            description="Memorize palavras e frases virando os cards."
            onPress={() => router.push('/practice/flashcards')}
          />
          <PracticeOption
            icon="language"
            title="Vocabulário"
            description="Gírias e expressões do dia a dia, com áudio."
            onPress={() => router.push('/practice/vocabulary')}
          />
          <PracticeOption
            icon="calendar"
            title="Aulas particulares"
            description="Aulas individuais com a professora Giselle."
            onPress={() => router.push('/practice/private-lessons')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
