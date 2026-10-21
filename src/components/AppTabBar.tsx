import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

type TabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

const ICON_SIZE = 24;

// Menu de baixo: a aba ativa tem o ícone cheio num fundo verde-claro de
// cantos arredondados e o nome em verde; as outras, o ícone só com contorno e o nome em cinza. Ícone, nome e contador vêm das opções de cada
// aba, no layout.
export function AppTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-white px-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = options.title ?? route.name;
        const color = focused ? colors.green : colors.gray;
        const badge = options.tabBarBadge;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        function onLongPress() {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={
              badge !== undefined ? `${label}, ${badge} não lidas` : label
            }
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center gap-1 pt-2"
          >
            <View className="h-10 w-14 items-center justify-center">
              {/* Fundo próprio, montado só na aba ativa: trocar a cor do
              fundo na mesma View fazia o Android perder o arredondado */}
              {focused ? (
                <View className="absolute inset-0 rounded-2xl bg-green-50" />
              ) : null}
              {options.tabBarIcon?.({ focused, color, size: ICON_SIZE })}
              {badge !== undefined ? (
                <View className="absolute right-1 top-0.5 h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-green-600 px-1">
                  <Text className="font-poppins-semibold text-[10px] leading-3 text-white">
                    {badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              className={
                focused
                  ? 'font-poppins-semibold text-xs text-green-600'
                  : 'font-poppins-medium text-xs text-gray-500'
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
