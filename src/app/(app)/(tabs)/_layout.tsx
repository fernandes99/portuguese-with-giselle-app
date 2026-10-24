import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { AppTabBar } from '@/components/AppTabBar';
import { colors } from '@/constants/theme';
import { useTeacherChatUnread } from '@/contexts/TeacherChatUnreadContext';
import { formatUnread } from '@/utils/teacherChat';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? active : inactive}
      size={size}
      // O ColorValue também aceita número e null, que o ícone não aceita; o
      // AppTabBar sempre manda a cor como texto
      color={typeof color === 'string' ? color : undefined}
    />
  );
}

export default function TabsLayout() {
  const { unread } = useTeacherChatUnread();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Praticar',
          tabBarIcon: tabIcon('chatbubble', 'chatbubble-outline'),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progresso',
          tabBarIcon: tabIcon('bar-chart', 'bar-chart-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: tabIcon('person', 'person-outline'),
          // Mensagens da professora ainda não lidas; o chat abre pelo Perfil
          tabBarBadge: unread > 0 ? formatUnread(unread) : undefined,
        }}
      />
    </Tabs>
  );
}
