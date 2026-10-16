import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { ChoiceCard } from '@/components/preferences/ChoiceCard';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getErrorMessage } from '@/lib/api';
import {
  type ExplanationLanguage,
  getPreferences,
  saveExplanationLanguage,
} from '@/services/preferences';

const LOAD_ERROR = 'Não foi possível carregar os idiomas.';
const SAVE_ERROR = 'Não foi possível salvar o idioma.';

// Escolha do idioma em que a Gisa explica os erros e traduz as falas. A
// conversa continua em português e não recomeça: o idioma novo vale a
// partir da próxima resposta.
export function ExplanationLanguageSelector({
  onDone,
}: {
  onDone: () => void;
}) {
  const { token } = useAuth();
  const { data, error, refresh } = useApiQuery(getPreferences, LOAD_ERROR);
  // null até o aluno tocar numa opção: vale o idioma atual
  const [choice, setChoice] = useState<ExplanationLanguage | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const selected = choice ?? data?.preferences?.explanationLanguage ?? null;

  async function save() {
    if (!token || !selected) {
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      await saveExplanationLanguage(token, selected);
      onDone();
    } catch (err) {
      setSaveError(getErrorMessage(err, SAVE_ERROR));
    } finally {
      setSaving(false);
    }
  }

  const options = data?.options.explanationLanguages;

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
        <Text className="font-poppins text-base text-gray-600">
          A Gisa sempre conversa em português. Escolha em que idioma ela explica
          seus erros e traduz as mensagens.
        </Text>

        <View accessibilityRole="radiogroup" className="gap-3">
          {options.map((option) => (
            <ChoiceCard
              key={option.id}
              title={option.title}
              description={option.description}
              emoji={option.emoji}
              selected={selected === option.id}
              onPress={() => setChoice(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <FlowFooter
        label="Salvar"
        onPress={save}
        disabled={!selected}
        loading={saving}
        error={saveError}
      />
    </View>
  );
}
