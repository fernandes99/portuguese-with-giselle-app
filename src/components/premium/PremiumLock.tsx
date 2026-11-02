import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { canSeePlans } from '@/utils/plans';

// Aviso de conteúdo exclusivo do plano Premium, com a coroa do Perfil e o
// botão que leva à tela de planos. Ocupa o espaço da tela que ele bloqueia.
export function PremiumLock({ description }: { description: string }) {
  const { t } = useTranslation();

  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-green-600">
        <MaterialCommunityIcons name="crown" size={40} color={colors.crown} />
      </View>
      <Text
        accessibilityRole="header"
        className="text-center font-poppins-bold text-xl text-gray-900"
      >
        {t('account.plans.lockTitle')}
      </Text>
      <Text className="text-center font-poppins text-base leading-6 text-gray-600">
        {description}
      </Text>
      {/* Quem já tem o plano (o bloqueio veio de uma sessão desatualizada)
          não tem o que assinar */}
      {canSeePlans(user) ? (
        <View className="mt-2 self-stretch">
          <Button
            size="lg"
            label={t('entry.profile.premium')}
            onPress={() => router.push('/plans')}
          />
        </View>
      ) : null}
    </View>
  );
}
