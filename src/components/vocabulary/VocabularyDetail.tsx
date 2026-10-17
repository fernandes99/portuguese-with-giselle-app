import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActivityAudioProvider,
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { Button } from '@/components/Button';
import { CategoryLabel } from '@/components/vocabulary/CategoryLabel';
import { colors } from '@/constants/theme';
import type { VocabularyCategory, VocabularyItem } from '@/services/vocabulary';

interface VocabularyDetailProps {
  // null fecha o detalhe
  item: VocabularyItem | null;
  getCategory: (item: VocabularyItem) => VocabularyCategory | undefined;
  savedIds: Set<string>;
  onClose: () => void;
  onToggleSaved: (id: string) => void;
}

interface DetailContentProps {
  item: VocabularyItem;
  category: VocabularyCategory | undefined;
  isSaved: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="font-poppins-bold text-[11px] uppercase tracking-widest text-green-700">
      {children}
    </Text>
  );
}

function DetailContent({
  item,
  category,
  isSaved,
  onClose,
  onToggleSaved,
}: DetailContentProps) {
  const insets = useSafeAreaInsets();
  const { stop } = useActivityAudio();

  // Fechar o detalhe para o áudio
  function close() {
    stop();
    onClose();
  }

  return (
    // O Modal é outra janela: a área segura vem da tela de fora
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={close}
          hitSlop={6}
          className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white active:bg-gray-50"
        >
          <Ionicons name="close" size={22} color={colors.gray} />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="flex-grow gap-5 px-5 pb-6 pt-2">
        <View className="gap-2">
          <CategoryLabel category={category} />
          <Text className="font-poppins-bold text-3xl text-gray-900">
            {item.term}
          </Text>
          {item.pronunciation ? (
            <Text className="font-poppins text-base text-gray-500">
              {item.pronunciation}
            </Text>
          ) : null}
          {item.termAudioUrl ? (
            <AudioButton url={item.termAudioUrl} label="Ouvir" />
          ) : null}
        </View>

        <View className="gap-2 rounded-2xl border border-gray-200 bg-white p-4">
          <SectionLabel>Significado</SectionLabel>
          <Text className="font-poppins text-base text-gray-800">
            {item.meaning}
          </Text>
        </View>

        {item.example ? (
          <View className="gap-2 rounded-2xl border border-gray-200 bg-white p-4">
            <SectionLabel>Exemplo</SectionLabel>
            <Text className="font-poppins-semibold text-lg text-gray-900">
              “{item.example}”
            </Text>
            {item.exampleTranslation ? (
              <Text className="font-poppins text-sm text-gray-500">
                {item.exampleTranslation}
              </Text>
            ) : null}
            {item.exampleAudioUrl ? (
              <AudioButton url={item.exampleAudioUrl} label="Ouvir exemplo" />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-gray-100 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          variant={isSaved ? 'outline' : 'primary'}
          label={isSaved ? 'Salvo' : 'Salvar'}
          accessibilityLabel={isSaved ? 'Salvo. Tirar dos salvos' : 'Salvar'}
          onPress={onToggleSaved}
        />
      </View>
    </View>
  );
}

// Detalhe de um item em tela cheia, aberto pela lista
export function VocabularyDetail({
  item,
  getCategory,
  savedIds,
  onClose,
  onToggleSaved,
}: VocabularyDetailProps) {
  // Guarda o último item para o conteúdo não sumir enquanto o Modal desce
  const [shownItem, setShownItem] = useState(item);
  useEffect(() => {
    if (item) {
      setShownItem(item);
    }
  }, [item]);

  const current = item ?? shownItem;

  return (
    <Modal
      visible={!!item}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {current ? (
        <ActivityAudioProvider>
          <DetailContent
            item={current}
            category={getCategory(current)}
            isSaved={savedIds.has(current.id)}
            onClose={onClose}
            onToggleSaved={() => onToggleSaved(current.id)}
          />
        </ActivityAudioProvider>
      ) : null}
    </Modal>
  );
}
