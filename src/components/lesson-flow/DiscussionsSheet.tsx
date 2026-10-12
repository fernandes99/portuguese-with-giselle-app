import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonDiscussions } from '@/components/lesson/LessonDiscussions';
import { colors } from '@/constants/theme';

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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable
          accessibilityLabel="Fechar as discussões"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="h-[85%] rounded-t-2xl bg-background px-5 pt-4"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-base text-gray-900">
              Discussões
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar as discussões"
              onPress={onClose}
              hitSlop={12}
            >
              <Ionicons name="chevron-down" size={22} color={colors.gray} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="pb-6"
          >
            <LessonDiscussions lessonId={lessonId} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
