import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/lesson/EmptyState';
import { colors } from '@/constants/theme';
import type { LessonMaterial } from '@/services/lesson';

type IconName = ComponentProps<typeof Ionicons>['name'];

function getIcon(material: LessonMaterial): IconName {
  const mime = material.mimeType ?? '';

  if (material.type === 'pdf' || mime === 'application/pdf') {
    return 'document-text-outline';
  }
  if (['img', 'gif'].includes(material.type) || mime.startsWith('image/')) {
    return 'image-outline';
  }
  if (material.type === 'audio' || mime.startsWith('audio/')) {
    return 'volume-high-outline';
  }
  if (material.type === 'video' || mime.startsWith('video/')) {
    return 'videocam-outline';
  }
  if (material.type === 'hyperlink') {
    return 'link-outline';
  }
  return 'document-outline';
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function open(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    // Esquemas que o navegador interno não abre (mailto:, etc.)
    await Linking.openURL(url).catch(() => undefined);
  }
}

export function LessonMaterials({
  materials,
}: {
  materials: LessonMaterial[];
}) {
  if (materials.length === 0) {
    return (
      <EmptyState
        title="No supporting material available"
        text="The supporting materials for this lesson will be added soon."
      />
    );
  }

  return (
    <View className="gap-3">
      {materials.map((material) => {
        const isLink = material.type !== 'file';
        const size = formatFileSize(material.size);

        return (
          <Pressable
            key={material.id}
            accessibilityRole="link"
            onPress={() => open(material.url)}
            className="flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 active:bg-gray-50"
          >
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Ionicons
                name={getIcon(material)}
                size={20}
                color={colors.blue}
              />
            </View>
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className="font-poppins-medium text-sm text-gray-900"
              >
                {material.title}
              </Text>
              {size ? (
                <Text className="font-poppins text-xs text-gray-500">
                  {size}
                </Text>
              ) : null}
            </View>
            <Ionicons
              name={isLink ? 'open-outline' : 'download-outline'}
              size={20}
              color={colors.gray}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
