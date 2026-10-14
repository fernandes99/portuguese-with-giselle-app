import logo from '@assets/logo-symbol.png';
import { Image, View } from 'react-native';

import { NotificationBell } from '@/components/notifications/NotificationBell';

// Topo das abas: o símbolo da marca (balão com a bandeira) à esquerda e o
// sino das notificações à direita. Rola com o conteúdo; o espaçamento lateral
// vem da tela.
export function TabTopBar() {
  return (
    <View className="flex-row items-center justify-between">
      <Image
        source={logo}
        accessibilityLabel="Portuguese With Giselle"
        resizeMode="contain"
        className="h-8 w-11"
      />
      <NotificationBell />
    </View>
  );
}
