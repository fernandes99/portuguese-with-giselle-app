import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import { TeacherAvatar } from '@/components/teacherChat/MessageBubble';
import { getWelcomeTitle } from '@/utils/preferences';

// Fim do primeiro acesso: a professora dá as boas-vindas com uma frase de
// incentivo, antes do "Começar"
export function WelcomeStep({ name }: { name: string }) {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerClassName="flex-grow items-center justify-center gap-5 px-8 py-8">
      <TeacherAvatar size={96} />
      <Text
        accessibilityRole="header"
        className="text-center font-poppins-semibold text-2xl text-gray-900"
      >
        {getWelcomeTitle(name)}
      </Text>
      <Text className="text-center font-poppins text-base leading-7 text-gray-700">
        {t('entry.preferences.welcomeMessage')}
      </Text>
      <Text className="font-poppins-medium text-sm text-gray-500">
        {t('entry.preferences.teacherSignature')}
      </Text>
    </ScrollView>
  );
}
