import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors } from '@/constants/theme';
import type { Lesson } from '@/services/lesson';

interface LessonMediaProps {
  lesson: Lesson;
  // "AULA 04", mostrado sobre a capa
  label: string | null;
  // Capa usada quando a aula não tem imagem própria
  fallbackImageUrl: string | null;
}

function getEmbedUrl(lesson: Lesson) {
  if (lesson.videoId) {
    return `https://www.veed.io/embed/${lesson.videoId}?watermark=0&color=green&sharing=0&title=0`;
  }
  if (lesson.canvaUrl) {
    return `${lesson.canvaUrl}?embed`;
  }
  return null;
}

function Loading() {
  return (
    <View className="absolute inset-0 items-center justify-center gap-3 bg-gray-900">
      <ActivityIndicator color={colors.white} />
      <Text className="font-poppins-medium text-sm text-white">
        Carregando o vídeo...
      </Text>
    </View>
  );
}

// Capa da aula de ponta a ponta no topo da tela. O player (Veed, ou a
// apresentação do Canva quando não há vídeo) só carrega depois do play.
export function LessonMedia({
  lesson,
  label,
  fallbackImageUrl,
}: LessonMediaProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(lesson);
  const imageUrl = lesson.imageUrl ?? fallbackImageUrl;

  if (isPlaying && embedUrl) {
    return (
      <View className="aspect-video w-full bg-gray-900">
        <WebView
          source={{ uri: embedUrl }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
          renderLoading={Loading}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={embedUrl ? 'button' : 'image'}
      accessibilityLabel={
        embedUrl ? `Reproduzir ${lesson.title}` : lesson.title
      }
      onPress={() => setIsPlaying(true)}
      disabled={!embedUrl}
      className="aspect-video w-full bg-green-700"
    >
      {imageUrl ? (
        <Image
          source={{ uri: `${imageUrl}?w=1000&auto=compress` }}
          resizeMode="cover"
          className="absolute inset-0 h-full w-full"
        />
      ) : null}

      {/* Escurece a capa para o texto branco continuar legível */}
      <View className="absolute inset-0 bg-black/45" />

      <View className="px-5 pt-5">
        {label ? (
          <Text className="font-poppins-semibold text-xs tracking-widest text-yellow-300">
            {label}
          </Text>
        ) : null}
        <Text
          numberOfLines={2}
          className="mt-1 font-poppins-bold text-2xl leading-8 text-white"
        >
          {lesson.title}
        </Text>
      </View>

      {embedUrl ? (
        <View className="absolute inset-x-0 bottom-5 items-center">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-green-500">
            <Ionicons
              name="play"
              size={24}
              color={colors.white}
              style={{ marginLeft: 3 }}
            />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
