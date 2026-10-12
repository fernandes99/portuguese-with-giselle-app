import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { canUsePractice } from '@/utils/practice';

interface PracticeOptionProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  // Exclusiva para assinantes e a conta não é de assinante
  isLocked?: boolean;
  onPress: () => void;
}

function PracticeOption({
  icon,
  title,
  description,
  isLocked = false,
  onPress,
}: PracticeOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isLocked ? `${title}, exclusivo para assinantes` : title
      }
      accessibilityState={{ disabled: isLocked }}
      disabled={isLocked}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-full ${isLocked ? 'bg-gray-100' : 'bg-green-100'}`}
      >
        <Ionicons
          name={isLocked ? 'lock-closed' : icon}
          size={22}
          color={isLocked ? colors.placeholder : colors.green}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          className={`font-poppins-semibold text-base ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}
        >
          {title}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">
          {description}
        </Text>
        {isLocked ? (
          <Text className="mt-1 font-poppins-semibold text-xs text-gray-500">
            Exclusivo para assinantes
          </Text>
        ) : null}
      </View>
      {isLocked ? null : (
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      )}
    </Pressable>
  );
}

// Formas de praticar o idioma: o chat com a IA, os flashcards e as aulas
// particulares com a professora
export default function PracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow gap-5 px-5 pb-8 pt-6">
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
            description="Converse com a Professora Gisa e receba correções a cada frase."
            isLocked={!canUsePractice(user)}
            onPress={() => router.push('/practice/chat')}
          />
          <PracticeOption
            icon="albums"
            title="Flashcards"
            description="Memorize palavras e frases virando os cards."
            onPress={() => router.push('/practice/flashcards')}
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
