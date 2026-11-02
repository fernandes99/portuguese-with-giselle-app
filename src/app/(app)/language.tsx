import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { ChoiceCard } from '@/components/preferences/ChoiceCard';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { APP_LANGUAGES, type AppLanguage, changeAppLanguage } from '@/lib/i18n';
import { saveAppLanguage } from '@/services/preferences';

// Troca o idioma do app, aberta pelo Perfil. O app só muda depois que a conta
// gravou, para os dois não ficarem diferentes.
export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const { token, updateUser } = useAuth();
  const [saving, setSaving] = useState<AppLanguage | null>(null);
  const [error, setError] = useState('');

  async function choose(language: AppLanguage) {
    if (!token || saving || language === i18n.language) {
      return;
    }

    setSaving(language);
    setError('');
    try {
      await saveAppLanguage(token, language);
      await changeAppLanguage(language);
      await updateUser({ appLanguage: language });
    } catch (err) {
      setError(getErrorMessage(err, t('language.saveError')));
    } finally {
      setSaving(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title={t('language.title')} />
      <ScrollView contentContainerClassName="gap-5 px-5 pb-8 pt-4">
        <Text className="font-poppins text-base text-gray-600">
          {t('language.description')}
        </Text>

        <View accessibilityRole="radiogroup" className="gap-3">
          {APP_LANGUAGES.map((option) => (
            <ChoiceCard
              key={option.id}
              title={option.title}
              emoji={option.emoji}
              selected={(saving ?? i18n.language) === option.id}
              onPress={() => choose(option.id)}
            />
          ))}
        </View>

        {error ? (
          <View className="rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
