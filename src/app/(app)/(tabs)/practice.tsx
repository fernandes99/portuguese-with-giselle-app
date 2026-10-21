import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GisaAvatar } from '@/components/practice/GisaAvatar';
import { TabTopBar } from '@/components/TabTopBar';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { canUsePractice } from '@/utils/practice';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Ícone sólido num círculo branco, sobre o cinza dos cartões
function OptionIcon({ icon }: { icon: IconName }) {
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
      <Ionicons name={icon} size={24} color={colors.green} />
    </View>
  );
}

// Cartão verde do chat com IA, no topo. Sem o plano, leva a coroa e o toque
// vai para a tela de planos.
function ChatCard({
  isPremiumOnly,
  onPress,
}: {
  isPremiumOnly: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isPremiumOnly
          ? 'Chat com IA, exclusivo do plano Premium'
          : 'Chat com IA'
      }
      accessibilityHint={
        isPremiumOnly ? 'Abre a tela do plano Premium' : undefined
      }
      onPress={onPress}
      className="gap-4 rounded-3xl bg-green-600 p-5 active:bg-green-700"
    >
      <View className="flex-row items-center gap-4">
        <GisaAvatar size={64} />
        <View className="flex-1 gap-1">
          {isPremiumOnly ? (
            <View className="flex-row items-center gap-1 self-start rounded-full bg-white/20 px-2 py-0.5">
              <MaterialCommunityIcons
                name="crown"
                size={12}
                color={colors.crown}
              />
              <Text
                style={{ includeFontPadding: false }}
                className="font-poppins-semibold text-[11px] leading-4 text-white"
              >
                Premium
              </Text>
            </View>
          ) : null}
          <Text className="font-poppins-bold text-xl text-white">
            Chat com IA
          </Text>
          <Text className="font-poppins text-sm leading-5 text-white/90">
            Converse com a Gisa, sua parceira de conversação com IA, e receba
            correções a cada frase.
          </Text>
        </View>
      </View>
      <View className="h-12 items-center justify-center rounded-2xl bg-white">
        <Text className="font-poppins-semibold text-base text-green-700">
          {isPremiumOnly ? 'Ver Premium' : 'Conversar'}
        </Text>
      </View>
    </Pressable>
  );
}

// Cartão cinza na largura toda: ícone, título, descrição e seta
function WideOption({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-3xl bg-surface p-4 active:bg-surface-pressed"
    >
      <OptionIcon icon={icon} />
      <View className="flex-1 gap-0.5">
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

// Cartão cinza de meia largura, para dois lado a lado
function HalfOption({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-1 gap-3 rounded-3xl bg-surface p-4 active:bg-surface-pressed"
    >
      <OptionIcon icon={icon} />
      <View className="gap-0.5">
        <Text className="font-poppins-semibold text-base text-gray-900">
          {title}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

// Formas de praticar o idioma: o chat com a IA em destaque, depois as
// simulações, os flashcards, o vocabulário e as aulas particulares com a
// professora
export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const canChat = canUsePractice(user);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
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
          <ChatCard
            isPremiumOnly={!canChat}
            onPress={() => router.push(canChat ? '/practice/chat' : '/plans')}
          />
          <WideOption
            icon="people"
            title="Simulações"
            description="Pratique situações do dia a dia, como pedir um café, e cumpra as tarefas."
            onPress={() => router.push('/practice/simulations')}
          />
          <View className="flex-row gap-3">
            <HalfOption
              icon="albums"
              title="Flashcards"
              description="Vire os cards e memorize"
              onPress={() => router.push('/practice/flashcards')}
            />
            <HalfOption
              icon="language"
              title="Vocabulário"
              description="Gírias e expressões com áudio"
              onPress={() => router.push('/practice/vocabulary')}
            />
          </View>
          <WideOption
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
