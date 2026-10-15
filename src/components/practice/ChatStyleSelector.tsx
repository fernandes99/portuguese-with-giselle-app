import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { StyleCard } from '@/components/practice/StyleCard';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getErrorMessage } from '@/lib/api';
import {
  type ChatStyle,
  getPreferences,
  saveChatStyle,
} from '@/services/preferences';

const LOAD_ERROR = 'Não foi possível carregar os estilos.';
const SAVE_ERROR = 'Não foi possível salvar o estilo.';

// Escolha de como a Gisa conversa. `first`: a primeira vez no chat, antes
// da conversa; `edit`: troca pelo chat ou pelo Perfil. O estilo salvo vai
// para a sessão, e o chat recomeça nele.
export function ChatStyleSelector({
  mode,
  onDone,
}: {
  mode: 'first' | 'edit';
  onDone: () => void;
}) {
  const { token, user, updateUser } = useAuth();
  const { data, error, refresh } = useApiQuery(getPreferences, LOAD_ERROR);
  const [selected, setSelected] = useState<ChatStyle | null>(
    user?.chatStyle ?? null
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  async function save() {
    if (!token || !selected) {
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const { chatStyle } = await saveChatStyle(token, selected);
      await updateUser({ chatStyle });
      onDone();
    } catch (err) {
      setSaveError(getErrorMessage(err, SAVE_ERROR));
    } finally {
      setSaving(false);
    }
  }

  const options = data?.options.chatStyles;

  if (!options) {
    return (
      <View className="flex-1 justify-center px-6">
        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : (
          <ActivityIndicator color={colors.green} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-4">
        <View className="gap-1">
          <Text
            accessibilityRole="header"
            className="font-poppins-bold text-2xl text-gray-900"
          >
            Como você quer que a Gisa seja?
          </Text>
          <Text className="font-poppins text-base text-gray-600">
            A Gisa é uma IA que conversa com você em português. Escolha o jeito
            dela; você pode mudar quando quiser.
          </Text>
        </View>

        <View accessibilityRole="radiogroup" className="gap-3">
          {options.map((option) => (
            <StyleCard
              key={option.id}
              option={option}
              selected={selected === option.id}
              onPress={() => setSelected(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <FlowFooter
        label={mode === 'first' ? 'Começar' : 'Salvar'}
        onPress={save}
        disabled={!selected}
        loading={saving}
        error={saveError}
      />
    </View>
  );
}
