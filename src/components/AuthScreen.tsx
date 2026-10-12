import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '@assets/logo.png';

import { colors } from '@/constants/theme';

interface AuthScreenProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
  // Mostra "Início" ao lado da logo, que leva de volta à introdução
  onBackToStart?: () => void;
}

// Moldura das telas de login e cadastro: logo, título e o formulário.
export function AuthScreen({
  eyebrow = 'Área do aluno',
  title,
  subtitle,
  error,
  children,
  footer,
  onBackToStart,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Anel decorativo no canto, o mesmo da introdução */}
      <View className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[22px] border-green-50" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-8 pt-3"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between">
            <Image
              source={logo}
              accessibilityLabel="Portuguese With Giselle"
              resizeMode="contain"
              className="h-9 w-40"
            />
            {onBackToStart ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar ao início"
                onPress={onBackToStart}
                hitSlop={12}
                className="flex-row items-center gap-1"
              >
                <Ionicons name="arrow-back" size={16} color={colors.gray} />
                <Text className="font-poppins-medium text-sm text-gray-500">
                  Início
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="flex-1 justify-center py-8">
            <View className="mb-8 items-center">
              <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
                {eyebrow}
              </Text>
              <Text className="mt-2 text-center font-poppins-semibold text-3xl leading-10 text-gray-900">
                {title}
              </Text>
              {subtitle && (
                <Text className="mt-2 text-center font-poppins text-base text-gray-600">
                  {subtitle}
                </Text>
              )}
            </View>

            <View className="gap-5">
              {error ? (
                <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <Text className="font-poppins text-sm text-red-700">
                    {error}
                  </Text>
                </View>
              ) : null}
              {children}
            </View>

            {footer && <View className="mt-8 items-center">{footer}</View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Linha com texto no meio, entre o botão do Google e o formulário
export function AuthDivider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-gray-200" />
      <Text className="font-poppins text-xs text-gray-500">{label}</Text>
      <View className="h-px flex-1 bg-gray-200" />
    </View>
  );
}
