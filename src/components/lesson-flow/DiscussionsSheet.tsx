import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { LessonDiscussions } from '@/components/lesson/LessonDiscussions';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';
import {
  KEYBOARD_BOTTOM_OFFSET,
  KeyboardAwareScrollView,
} from '@/lib/keyboard';

interface DiscussionsSheetProps {
  visible: boolean;
  lessonId: string;
  onClose: () => void;
}

// Painel que sobe da barra inferior com as discussões da aula
export function DiscussionsSheet({
  visible,
  lessonId,
  onClose,
}: DiscussionsSheetProps) {
  const { t } = useTranslation();

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
          accessibilityLabel={t('lesson.guided.closeDiscussions')}
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="h-[85%] rounded-t-2xl bg-background px-5 pt-4"
          style={{ paddingBottom: bottomInset }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-base text-gray-900">
              {t('lesson.guided.discussions')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('lesson.guided.closeDiscussions')}
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={22} color={colors.gray} />
            </Pressable>
          </View>

          {/* Rola o campo do comentário para cima do teclado */}
          <KeyboardAwareScrollView
            bottomOffset={KEYBOARD_BOTTOM_OFFSET}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="pb-6"
          >
            <LessonDiscussions lessonId={lessonId} />
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}
