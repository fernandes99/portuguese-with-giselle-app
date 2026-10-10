import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import logo from '@assets/logo.png';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
}

// Moldura das telas de login e cadastro: logo, título e cartão branco.
export function AuthScreen({
  title,
  subtitle,
  error,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6 items-center">
            <Image
              source={logo}
              accessibilityLabel="Portuguese With Giselle"
              resizeMode="contain"
              className="h-14 w-64"
            />
            <Text className="mt-6 text-center font-poppins-bold text-3xl text-gray-900">
              {title}
            </Text>
            {subtitle && (
              <Text className="mt-2 text-center font-poppins text-base text-gray-600">
                {subtitle}
              </Text>
            )}
          </View>

          <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-6">
            {error ? (
              <View className="rounded-lg border border-red-200 bg-red-50 p-3">
                <Text className="font-poppins text-sm text-red-700">
                  {error}
                </Text>
              </View>
            ) : null}
            {children}
          </View>

          {footer && <View className="mt-6 items-center">{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
