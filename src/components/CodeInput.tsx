import { Text, TextInput, View } from 'react-native';

const CODE_LENGTH = 6;
const SLOTS = Array.from({ length: CODE_LENGTH }, (_, index) => index);

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
}

// Um único campo invisível por cima das caixas: mantém o teclado numérico,
// o colar e o preenchimento automático do código funcionando.
export function CodeInput({ value, onChange }: CodeInputProps) {
  return (
    <View>
      <View className="flex-row justify-center gap-2">
        {SLOTS.map((slot) => (
          <View
            key={slot}
            className={`h-14 w-11 items-center justify-center rounded-lg border-2 bg-white ${slot === value.length ? 'border-green-500' : 'border-gray-200'}`}
          >
            <Text className="font-poppins-bold text-2xl text-gray-900">
              {value[slot] ?? ''}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Código de verificação"
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(/\D/g, '').slice(0, CODE_LENGTH))
        }
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        autoFocus
        caretHidden
        className="absolute inset-0 opacity-0"
      />
    </View>
  );
}
