import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { APP_VERSION } from '@/constants/version';
import { useAuth } from '@/contexts/AuthContext';

// Por enquanto só identifica a conta e permite sair
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-2 px-6">
        <View className="mb-2 h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Text className="font-poppins-bold text-3xl text-green-700">
            {initial}
          </Text>
        </View>
        {user?.name ? (
          <Text className="font-poppins-bold text-2xl text-gray-900">
            {user.name}
          </Text>
        ) : null}
        <Text className="font-poppins text-base text-gray-600">
          {user?.email}
        </Text>
      </View>
      <View className="p-6">
        <Button variant="link" label="Sair" onPress={signOut} />
        <Text className="mt-2 text-center font-poppins text-[11px] text-gray-400">
          v{APP_VERSION}
        </Text>
      </View>
    </SafeAreaView>
  );
}
