import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import type { ReactNode } from 'react';
import { Image, Linking, Pressable, Text, View } from 'react-native';

import {
  ActivityAudioProvider,
  AudioButton,
} from '@/components/activity/ActivityAudio';
import { EmptyState } from '@/components/lesson/EmptyState';
import { colors } from '@/constants/theme';
import type { LessonMaterial } from '@/services/lesson';

type Kind = 'pdf' | 'image' | 'audio' | 'video' | 'zip' | 'link' | 'file';

// Mesmas cores por tipo usadas na lista de materiais do site
const KINDS: Record<Kind, { label: string; box: string; text: string }> = {
  pdf: { label: 'PDF', box: 'bg-blue-100', text: 'text-blue-700' },
  image: { label: 'IMG', box: 'bg-pink-100', text: 'text-pink-700' },
  audio: { label: 'MP3', box: 'bg-yellow-100', text: 'text-yellow-700' },
  video: { label: 'VID', box: 'bg-purple-100', text: 'text-purple-700' },
  zip: { label: 'ZIP', box: 'bg-orange-100', text: 'text-orange-700' },
  link: { label: 'LINK', box: 'bg-green-100', text: 'text-green-700' },
  file: { label: 'ARQ', box: 'bg-purple-100', text: 'text-purple-700' },
};

const KIND_NAMES: Record<Kind, string> = {
  pdf: 'PDF',
  image: 'Imagem',
  audio: 'Áudio',
  video: 'Vídeo',
  zip: 'ZIP',
  link: 'Link',
  file: 'Arquivo',
};

function getKind(material: LessonMaterial): Kind {
  const mime = material.mimeType ?? '';

  if (material.type === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['img', 'gif'].includes(material.type) || mime.startsWith('image/')) {
    return 'image';
  }
  if (material.type === 'audio' || mime.startsWith('audio/')) return 'audio';
  if (material.type === 'video' || mime.startsWith('video/')) return 'video';
  if (mime.includes('zip')) return 'zip';
  if (material.type === 'hyperlink') return 'link';
  return 'file';
}

// 470424 -> "459 KB"; 2516582 -> "2,4 MB"
function formatFileSize(bytes: number | null) {
  if (!bytes) return null;

  const megabytes = bytes / (1024 * 1024);
  if (megabytes < 1) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${megabytes.toFixed(1).replace('.', ',')} MB`;
}

function getHost(url: string) {
  return url.match(/^https?:\/\/(?:www\.)?([^/?#]+)/i)?.[1] ?? null;
}

async function open(url: string) {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    // Esquemas que o navegador interno não abre (mailto:, etc.)
    await Linking.openURL(url).catch(() => undefined);
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="font-poppins-semibold text-base text-gray-900">
        {title}
      </Text>
      {children}
    </View>
  );
}

function MaterialRow({ material }: { material: LessonMaterial }) {
  const kind = getKind(material);
  const style = KINDS[kind];
  const isFile = material.type === 'file';
  // Áudio enviado como arquivo toca aqui mesmo, sem sair do app
  const playsInline = isFile && kind === 'audio';

  const details = isFile
    ? [KIND_NAMES[kind], formatFileSize(material.size)]
    : [getHost(material.url) ?? KIND_NAMES[kind]];

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={material.title}
      onPress={() => open(material.url)}
      className="flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 active:bg-gray-50"
    >
      {isFile && kind === 'image' ? (
        <Image
          source={{ uri: `${material.url}?w=120&h=120&fit=crop` }}
          className="h-12 w-12 rounded-xl bg-gray-100"
        />
      ) : (
        <View
          className={`h-12 w-12 items-center justify-center rounded-xl ${style.box}`}
        >
          {kind === 'link' ? (
            <Ionicons name="open-outline" size={20} color={colors.darkGreen} />
          ) : (
            <Text className={`font-poppins-bold text-xs ${style.text}`}>
              {style.label}
            </Text>
          )}
        </View>
      )}

      <View className="flex-1">
        <Text
          numberOfLines={2}
          className="font-poppins-semibold text-sm text-gray-900"
        >
          {material.title.trim()}
        </Text>
        <Text numberOfLines={1} className="font-poppins text-xs text-gray-500">
          {details.filter(Boolean).join(' · ')}
        </Text>
      </View>

      {playsInline ? <AudioButton url={material.url} /> : null}
      <Ionicons
        name={isFile ? 'download-outline' : 'chevron-forward'}
        size={22}
        color={colors.gray}
      />
    </Pressable>
  );
}

// Aba "Recursos" da aula: arquivos para baixar e links externos
export function LessonMaterials({
  materials,
}: {
  materials: LessonMaterial[];
}) {
  const files = materials.filter((material) => material.type === 'file');
  const links = materials.filter((material) => material.type !== 'file');

  return (
    <ActivityAudioProvider>
      <View className="gap-6">
        <View className="gap-1">
          <Text className="font-poppins-semibold text-xs tracking-widest text-gray-500">
            MATERIAIS DE APOIO
          </Text>
          <Text className="font-poppins-semibold text-2xl text-gray-900">
            Recursos da aula
          </Text>
          <Text className="font-poppins text-base text-gray-600">
            Salve os materiais e continue praticando fora do app.
          </Text>
        </View>

        {materials.length === 0 ? (
          <EmptyState
            title="Nenhum material de apoio disponível"
            text="Os materiais de apoio desta aula serão adicionados em breve."
          />
        ) : null}

        {files.length > 0 ? (
          <Section title="Documentos">
            {files.map((material) => (
              <MaterialRow key={material.id} material={material} />
            ))}
          </Section>
        ) : null}

        {links.length > 0 ? (
          <Section title="Links e atividades">
            {links.map((material) => (
              <MaterialRow key={material.id} material={material} />
            ))}
          </Section>
        ) : null}
      </View>
    </ActivityAudioProvider>
  );
}
