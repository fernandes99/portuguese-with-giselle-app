import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonTranscriptionUrl } from '@/services/lesson';

const ERROR_MESSAGE = 'Não foi possível baixar a transcrição. Tente de novo.';

interface TranscriptionButtonProps {
  lessonId: string;
}

// Abre o PDF da transcrição no navegador, de onde o aluno salva ou
// compartilha. A URL é assinada e expira em 60 segundos, por isso é pedida
// só no toque.
export function TranscriptionButton({ lessonId }: TranscriptionButtonProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePress = async () => {
    if (!token || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const { url } = await getLessonTranscriptionUrl(token, lessonId);
      await WebBrowser.openBrowserAsync(url);
    } catch {
      setError(ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Baixar a transcrição da aula em PDF"
        accessibilityState={{ busy: isLoading, disabled: isLoading }}
        disabled={isLoading}
        onPress={handlePress}
        className={`flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 active:bg-gray-50 ${isLoading ? 'opacity-60' : ''}`}
      >
        <View className="h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Ionicons
            name="document-text-outline"
            size={22}
            color={colors.blue}
          />
        </View>

        <View className="flex-1">
          <Text className="font-poppins-semibold text-sm text-gray-900">
            Transcrição da aula
          </Text>
          <Text className="font-poppins text-xs text-gray-500">
            PDF com o texto completo, vocabulário e gramática.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.gray} />
        ) : (
          <Ionicons name="download-outline" size={22} color={colors.gray} />
        )}
      </Pressable>

      {error ? (
        <Text className="font-poppins text-sm text-red-700">{error}</Text>
      ) : null}
    </View>
  );
}
