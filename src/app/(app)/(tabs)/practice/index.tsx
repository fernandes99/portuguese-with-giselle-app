import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isPremiumOnly
          ? t('practice.home.chatLocked')
          : t('practice.home.chatTitle')
      }
      accessibilityHint={
        isPremiumOnly ? t('practice.home.chatLockedHint') : undefined
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
            {t('practice.home.chatTitle')}
          </Text>
          <Text className="font-poppins text-sm leading-5 text-white/90">
            {t('practice.home.chatDescription')}
          </Text>
        </View>
      </View>
      <View className="h-12 items-center justify-center rounded-2xl bg-white">
        <Text className="font-poppins-semibold text-base text-green-700">
          {t(isPremiumOnly ? 'practice.home.seePremium' : 'practice.home.talk')}
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
  const { t } = useTranslation();

  const router = useRouter();
  const { user } = useAuth();
  const canChat = canUsePractice(user);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow gap-5 px-5 pb-8 pt-3">
        <TabTopBar />
        <View>
          <Text className="font-poppins-bold text-3xl text-gray-900">
            {t('entry.tabs.practice')}
          </Text>
          <Text className="mt-1 font-poppins text-base text-gray-600">
            {t('practice.home.subtitle')}
          </Text>
        </View>

        <View className="gap-3">
          <ChatCard
            isPremiumOnly={!canChat}
            onPress={() => router.push(canChat ? '/practice/chat' : '/plans')}
          />
          <WideOption
            icon="people"
            title={t('practice.home.simulations')}
            description={t('practice.home.simulationsDescription')}
            onPress={() => router.push('/practice/simulations')}
          />
          <View className="flex-row gap-3">
            <HalfOption
              icon="albums"
              title={t('practice.home.flashcards')}
              description={t('practice.home.flashcardsDescription')}
              onPress={() => router.push('/practice/flashcards')}
            />
            <HalfOption
              icon="language"
              title={t('practice.home.vocabulary')}
              description={t('practice.home.vocabularyDescription')}
              onPress={() => router.push('/practice/vocabulary')}
            />
          </View>
          <WideOption
            icon="calendar"
            title={t('practice.home.privateLessons')}
            description={t('practice.home.privateLessonsDescription')}
            onPress={() => router.push('/practice/private-lessons')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
