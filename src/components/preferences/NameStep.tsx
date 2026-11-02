import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { NAME_MAX_LENGTH } from '@/utils/preferences';

interface NameStepProps {
  value: string;
  onChange: (value: string) => void;
  // "Próximo" do teclado
  onSubmit: () => void;
}

// Como o aluno quer ser chamado; o nome troca o nome da conta
export function NameStep({ value, onChange, onSubmit }: NameStepProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2">
      <TextField
        label={t('entry.preferences.nameLabel')}
        placeholder={t('entry.preferences.namePlaceholder')}
        value={value}
        onChangeText={onChange}
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        textContentType="name"
        maxLength={NAME_MAX_LENGTH}
        returnKeyType="next"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={onSubmit}
      />
      <Text className="font-poppins text-sm text-gray-500">
        {t('entry.preferences.nameHint')}
      </Text>
    </View>
  );
}
