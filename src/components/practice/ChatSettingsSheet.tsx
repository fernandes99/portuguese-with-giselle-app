import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, Switch, Text, View } from 'react-native';

import { UsageToday } from '@/components/practice/UsageToday';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';

// Tempo da animação de fechar a folha
const CLOSE_DELAY_MS = 350;

interface ChatSettingsSheetProps {
  visible: boolean;
  autoplay: boolean;
  onAutoplayChange: (enabled: boolean) => void;
  // Sem mensagens do aluno, não há o que recomeçar
  canRestart: boolean;
  onLanguage: () => void;
  onStyle: () => void;
  onRestart: () => void;
  onClose: () => void;
}

function SettingsRow({
  icon,
  title,
  disabled = false,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center gap-3 border-t border-gray-200 py-4 active:opacity-70 ${disabled ? 'opacity-40' : ''}`}
    >
      <Ionicons name={icon} size={20} color={colors.gray} />
      <Text className="flex-1 font-poppins-medium text-base text-gray-900">
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.gray} />
    </Pressable>
  );
}

// Configurações do chat com a Gisa, abertas pela engrenagem do cabeçalho:
// voz automática, idioma das explicações, estilo e recomeçar
export function ChatSettingsSheet({
  visible,
  autoplay,
  onAutoplayChange,
  canRestart,
  onLanguage,
  onStyle,
  onRestart,
  onClose,
}: ChatSettingsSheetProps) {
  const bottomInset = useModalBottomInset();

  // Fecha a folha e só depois sai da tela ou abre a confirmação: no iPhone,
  // um alerta aberto enquanto a folha fecha pode não aparecer
  function closeThen(action: () => void) {
    return () => {
      onClose();
      setTimeout(action, CLOSE_DELAY_MS);
    };
  }

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
          accessibilityLabel="Fechar as configurações"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="rounded-t-2xl bg-background px-5 pt-4"
          style={{ paddingBottom: bottomInset + 8 }}
        >
          <View className="flex-row items-center justify-between gap-3 pb-2">
            <Text
              accessibilityRole="header"
              className="flex-1 font-poppins-semibold text-lg text-gray-900"
            >
              Configurações do chat
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            >
              <Ionicons name="close" size={20} color={colors.gray} />
            </Pressable>
          </View>

          <UsageToday />

          <View className="flex-row items-center gap-3 py-4">
            <Ionicons name="volume-medium" size={20} color={colors.gray} />
            <View className="flex-1 gap-0.5">
              <Text className="font-poppins-medium text-base text-gray-900">
                Voz automática
              </Text>
              <Text className="font-poppins text-sm text-gray-500">
                A Gisa lê cada resposta em voz alta.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Voz automática"
              value={autoplay}
              onValueChange={onAutoplayChange}
              trackColor={{ true: colors.green, false: colors.lightGray }}
              thumbColor={colors.white}
            />
          </View>

          <SettingsRow
            icon="language-outline"
            title="Idioma das explicações"
            onPress={closeThen(onLanguage)}
          />
          <SettingsRow
            icon="color-palette-outline"
            title="Estilo da Gisa"
            onPress={closeThen(onStyle)}
          />
          <SettingsRow
            icon="refresh"
            title="Recomeçar conversa"
            disabled={!canRestart}
            onPress={closeThen(onRestart)}
          />
        </View>
      </View>
    </Modal>
  );
}
