import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { HeaderButton, LessonHeader } from '@/components/lesson/ClassicLesson';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { colors } from '@/constants/theme';
import { useNotificationsUnread } from '@/contexts/NotificationsContext';
import { useNotifications } from '@/hooks/useNotifications';

// Lista de notificações, lidas e não lidas, da mais nova para a mais antiga.
// Abrir uma leva ao detalhe, que a marca como lida.
export default function NotificationsScreen() {
  const router = useRouter();
  const { unread, pushDenied } = useNotificationsUnread();
  const {
    items,
    error,
    hasMore,
    refreshing,
    isMarkingAll,
    refresh,
    reload,
    loadMore,
    markAllRead,
  } = useNotifications();

  // Na volta do detalhe, o item aberto aparece como lido. A primeira carga
  // já é feita pelo hook.
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        reload();
      }
      hasFocused.current = true;
    }, [reload])
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader
        title="Notificações"
        right={
          unread > 0 && !isMarkingAll ? (
            <HeaderButton
              icon="checkmark-done"
              label="Marcar todas como lidas"
              onPress={markAllRead}
            />
          ) : undefined
        }
      />

      {pushDenied ? (
        <View className="mx-5 mb-3 flex-row items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <Ionicons
            name="notifications-off-outline"
            size={22}
            color={colors.gray}
          />
          <Text className="flex-1 font-poppins text-sm text-gray-700">
            Ative as notificações para saber quando a professora responder.
          </Text>
          <Button
            variant="link"
            label="Ativar"
            accessibilityLabel="Ativar as notificações nos ajustes do aparelho"
            onPress={() => Linking.openSettings()}
          />
        </View>
      ) : null}

      {error ? (
        <View className="mx-5 mb-3 gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="font-poppins text-sm text-red-700">{error}</Text>
          <Button variant="link" label="Tentar de novo" onPress={reload} />
        </View>
      ) : null}

      {items ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onPress={() =>
                router.push({
                  pathname: '/notifications/[id]',
                  params: { id: item.id },
                })
              }
            />
          )}
          className="border-t border-gray-200"
          contentContainerClassName="flex-grow pb-8"
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={[colors.green]}
              tintColor={colors.green}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3 p-10">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color={colors.gray}
                />
              </View>
              <Text className="text-center font-poppins text-base text-gray-600">
                Nenhuma notificação por enquanto
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <View className="py-6">
                <ActivityIndicator color={colors.green} />
              </View>
            ) : undefined
          }
        />
      ) : error ? null : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.green} />
        </View>
      )}
    </SafeAreaView>
  );
}
