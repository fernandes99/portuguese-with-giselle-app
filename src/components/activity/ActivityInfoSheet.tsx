import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { HtmlContent } from '@/components/lesson/HtmlContent';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';

interface ActivityInfoSheetProps {
  visible: boolean;
  title: string;
  // HTML com o enunciado da atividade
  content: string | null;
  onClose: () => void;
}

// Painel com o título e o enunciado completo de uma atividade, que não cabem
// na tela de cada exercício
export function ActivityInfoSheet({
  visible,
  title,
  content,
  onClose,
}: ActivityInfoSheetProps) {
  const bottomInset = useModalBottomInset();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar as instruções"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="max-h-[85%] gap-4 rounded-t-2xl bg-background px-5 pt-4"
          style={{ paddingBottom: bottomInset + 16 }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 font-poppins-semibold text-lg text-gray-900">
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar as instruções"
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={22} color={colors.gray} />
            </Pressable>
          </View>

          {content ? (
            <ScrollView>
              <HtmlContent html={content} />
            </ScrollView>
          ) : null}

          <Button label="Entendi" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
