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
  return (
    <View className="gap-2">
      <TextField
        label="Seu nome"
        placeholder="Digite seu nome"
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
        É assim que a professora vai te chamar nas aulas e no app.
      </Text>
    </View>
  );
}
