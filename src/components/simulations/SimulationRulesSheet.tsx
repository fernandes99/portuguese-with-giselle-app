import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Rule({
  icon,
  color,
  tint,
  title,
  text,
}: {
  icon: IconName;
  // Cor do ícone e fundo do quadrado
  color: string;
  tint: string;
  title: string;
  text: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View
        className={`h-9 w-9 items-center justify-center rounded-xl ${tint}`}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-poppins-semibold text-sm text-gray-900">
          {title}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">{text}</Text>
      </View>
    </View>
  );
}

// Regras da simulação, abertas pelo "i" e pelo "Como funciona" da tela de
// detalhes. Os números vêm da rota, para não ficarem desatualizados.
export function SimulationRulesSheet({
  visible,
  maxMessages,
  maxDeviations,
  onClose,
}: {
  visible: boolean;
  maxMessages: number;
  maxDeviations: number;
  onClose: () => void;
}) {
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
          accessibilityLabel={t('practice.simulations.rules.close')}
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="gap-5 rounded-t-3xl bg-white px-5 pt-5"
          style={{ paddingBottom: bottomInset + 24 }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="font-poppins-bold text-lg text-gray-900"
            >
              {t('practice.simulations.rules.title')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('practice.simulations.rules.close')}
              onPress={onClose}
              hitSlop={12}
              className="h-9 w-9 items-center justify-center rounded-full bg-surface active:bg-surface-pressed"
            >
              <Ionicons name="close" size={20} color={colors.gray} />
            </Pressable>
          </View>

          <View className="gap-4">
            <Rule
              icon="flag-outline"
              color={colors.green}
              tint="bg-green-100"
              title={t('practice.simulations.rules.goalsTitle')}
              text={t('practice.simulations.rules.goalsText')}
            />
            <Rule
              icon="chatbubbles-outline"
              color={colors.orange}
              tint="bg-orange-100"
              title={t('practice.simulations.rules.sceneTitle')}
              text={t('practice.simulations.rules.sceneText')}
            />
            <Rule
              icon="warning-outline"
              color={colors.red}
              tint="bg-red-100"
              title={t('practice.simulations.rules.warningsTitle', {
                max: maxDeviations,
              })}
              text={t('practice.simulations.rules.warningsText', {
                max: maxDeviations,
              })}
            />
            <Rule
              icon="time-outline"
              color={colors.blue}
              tint="bg-blue-100"
              title={t('practice.simulations.rules.messagesTitle', {
                max: maxMessages,
              })}
              text={t('practice.simulations.rules.messagesText')}
            />
          </View>

          <Button label={t('lesson.exercise.gotIt')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
