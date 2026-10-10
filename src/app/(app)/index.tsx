import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';

// Tela inicial da área logada. Em branco por enquanto; o botão de sair
// existe só para poder voltar ao login.
export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1" />
      <View className="p-6">
        <Button variant="link" label="Sair" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}
