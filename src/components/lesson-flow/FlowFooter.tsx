import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import {
  FlowToast,
  type ToastMessage,
} from '@/components/lesson-flow/FlowToast';

interface FlowFooterProps {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  // Toque no botão desabilitado: a tela avisa o que falta para continuar
  onDisabledPress?: () => void;
  loading?: boolean;
  error?: string;
  // Aviso rápido mostrado logo acima do rodapé
  toast?: ToastMessage | null;
}

// Rodapé fixo da aula guiada, com o botão que avança
export function FlowFooter({
  label = 'Continuar',
  onPress,
  disabled,
  onDisabledPress,
  loading,
  error,
  toast = null,
}: FlowFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-2 border-t border-gray-100 bg-white px-5 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <FlowToast message={toast} />
      {error ? (
        <Text className="text-center font-poppins text-sm text-red-700">
          {error}
        </Text>
      ) : null}
      <Button
        size="lg"
        label={label}
        onPress={onPress}
        disabled={disabled}
        onDisabledPress={onDisabledPress}
        loading={loading}
      />
    </View>
  );
}
