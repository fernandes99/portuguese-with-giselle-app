import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { DurationBadge } from '@/components/lesson/DurationBadge';
import { colors } from '@/constants/theme';
import type { Lesson } from '@/services/lesson';
import logo from '@assets/logo.png';

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
    <View className="absolute inset-0 items-center justify-center gap-3 bg-gray-100">
      <ActivityIndicator color={colors.gray} />
      <Text className="font-poppins-medium text-sm text-gray-500">
        Carregando o vídeo...
      </Text>
    </View>
  );
}

// Vídeo da aula (Veed) ou, sem vídeo, a apresentação do Canva. O player só
// é carregado depois do toque no botão de play.
export function LessonMedia({ lesson }: { lesson: Lesson }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = getEmbedUrl(lesson);

  if (!embedUrl) {
    return null;
  }

  if (isPlaying) {
    return (
      <View className="aspect-video w-full bg-gray-100">
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
      accessibilityRole="button"
      accessibilityLabel={`Reproduzir ${lesson.title}`}
      onPress={() => setIsPlaying(true)}
      className="aspect-video w-full bg-green-50"
    >
      {lesson.imageUrl ? (
        <Image
          source={{ uri: `${lesson.imageUrl}?w=1000&auto=compress` }}
          resizeMode="cover"
          className="h-full w-full"
        />
      ) : (
        <View className="h-full w-full justify-end p-5">
          <Image
            source={logo}
            resizeMode="contain"
            className="absolute right-4 top-3 h-10 w-36"
          />
          {lesson.duration ? <DurationBadge minutes={lesson.duration} /> : null}
          <Text
            numberOfLines={2}
            className="mt-2 font-poppins-bold text-2xl text-gray-900"
          >
            {lesson.title}
          </Text>
          {lesson.description ? (
            <Text
              numberOfLines={2}
              className="mt-1 font-poppins text-sm text-gray-600"
            >
              {lesson.description}
            </Text>
          ) : null}
        </View>
      )}

      <View className="absolute inset-0 items-center justify-center bg-black/30">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/90">
          <Ionicons
            name="play"
            size={26}
            color="#000000"
            style={{ marginLeft: 3 }}
          />
        </View>
      </View>
    </Pressable>
  );
}
