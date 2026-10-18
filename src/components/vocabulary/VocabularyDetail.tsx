import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActivityAudioProvider,
  AudioButton,
  useActivityAudio,
} from '@/components/activity/ActivityAudio';
import { CategoryLabel } from '@/components/vocabulary/CategoryLabel';
import { PronunciationPractice } from '@/components/vocabulary/PronunciationPractice';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';
import type { VocabularyCategory, VocabularyItem } from '@/services/vocabulary';

interface VocabularyDetailProps {
  // null fecha o detalhe
  item: VocabularyItem | null;
  getCategory: (item: VocabularyItem) => VocabularyCategory | undefined;
  savedIds: Set<string>;
  // Só assinantes verificam a pronúncia
  canCheckPronunciation: boolean;
  onClose: () => void;
  onToggleSaved: (id: string) => void;
  // Fecha o detalhe e abre a tela de planos
  onOpenPlans: () => void;
}

interface DetailContentProps {
  item: VocabularyItem;
  // false enquanto o Modal desce, depois de fechar
  isVisible: boolean;
  category: VocabularyCategory | undefined;
  isSaved: boolean;
  canCheckPronunciation: boolean;
  onClose: () => void;
  onToggleSaved: () => void;
  onOpenPlans: () => void;
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
  isVisible,
  category,
  isSaved,
  canCheckPronunciation,
  onClose,
  onToggleSaved,
  onOpenPlans,
}: DetailContentProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = useModalBottomInset();
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

      <ScrollView contentContainerClassName="flex-grow gap-4 px-5 pb-6 pt-2">
        <View className="gap-3 pb-2">
          <CategoryLabel category={category} />
          <View className="flex-row items-start gap-3">
            <View className="flex-1 gap-1">
              <Text className="font-poppins-bold text-4xl leading-tight text-gray-900">
                {item.term}
              </Text>
              {item.pronunciation ? (
                <Text className="font-poppins text-base text-gray-500">
                  {item.pronunciation}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isSaved ? 'Salvo. Tirar dos salvos' : 'Salvar'
              }
              accessibilityState={{ selected: isSaved }}
              onPress={onToggleSaved}
              hitSlop={6}
              className={`mt-1 h-11 w-11 items-center justify-center rounded-full border active:bg-gray-50 ${isSaved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? colors.green : colors.gray}
              />
            </Pressable>
          </View>
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

      {/* Embaixo, perto do polegar. A chave muda ao fechar: desmontar para a
          gravação e limpa o resultado */}
      <View
        className="border-t border-gray-100 bg-white px-4 pt-3"
        style={{ paddingBottom: bottomInset + 12 }}
      >
        <PronunciationPractice
          key={isVisible ? item.id : 'closed'}
          itemId={item.id}
          termAudioUrl={item.termAudioUrl}
          canCheck={canCheckPronunciation}
          onOpenPlans={onOpenPlans}
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
  canCheckPronunciation,
  onClose,
  onToggleSaved,
  onOpenPlans,
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
      {/* O Modal é outra janela: os gestos (o microfone) precisam da própria
          raiz */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        {current ? (
          <ActivityAudioProvider>
            <DetailContent
              item={current}
              isVisible={!!item}
              category={getCategory(current)}
              isSaved={savedIds.has(current.id)}
              canCheckPronunciation={canCheckPronunciation}
              onClose={onClose}
              onToggleSaved={() => onToggleSaved(current.id)}
              onOpenPlans={onOpenPlans}
            />
          </ActivityAudioProvider>
        ) : null}
      </GestureHandlerRootView>
    </Modal>
  );
}
