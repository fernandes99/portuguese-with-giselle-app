import { Text, View } from 'react-native';

import { checkPassword, getPasswordStrength } from '@/utils/password';

export function PasswordRules({ password }: { password: string }) {
  const { rules, score } = checkPassword(password);
  const strength = getPasswordStrength(score);

  return (
    <View className="gap-2">
      <Text className="font-poppins text-xs text-gray-700">
        Força: {strength.label}
      </Text>
      <View className="h-2 w-full rounded bg-gray-200">
        <View
          className={`h-2 rounded ${strength.className}`}
          style={{ width: `${(score / rules.length) * 100}%` }}
        />
      </View>
      <View className="gap-1">
        {rules.map((rule) => (
          <Text
            key={rule.label}
            className={`font-poppins text-xs ${rule.passed ? 'text-green-600' : 'text-gray-500'}`}
          >
            • {rule.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
