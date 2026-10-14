import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { colors } from '@/constants/theme';
import { useNotification } from '@/hooks/useNotification';
import { formatDateTime } from '@/utils/date';
import { openNotificationLink } from '@/utils/notifications';

// Uma notificação inteira, com o botão do destino quando há tela para ele
export default function NotificationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notification, error, notFound, reload } = useNotification(id);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Notificação" />

      {notification ? (
        <ScrollView contentContainerClassName="gap-4 px-5 pb-10 pt-4">
          <Text className="font-poppins text-xs text-gray-500">
            {formatDateTime(notification.receivedAt)}
          </Text>
          <Text
            accessibilityRole="header"
            className="font-poppins-bold text-2xl text-gray-900"
          >
            {notification.title}
          </Text>
          <Text
            selectable
            className="font-poppins text-base leading-6 text-gray-700"
          >
            {notification.body}
          </Text>

          {notification.link ? (
            <View className="mt-4">
              <Button
                label={notification.link.label}
                onPress={() => {
                  if (notification.link) {
                    openNotificationLink(router, notification.link);
                  }
                }}
              />
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          {notFound ? (
            <>
              <Text className="text-center font-poppins text-base text-gray-600">
                Esta notificação não está mais disponível.
              </Text>
              <Button
                variant="link"
                label="Voltar"
                onPress={() => router.back()}
              />
            </>
          ) : error ? (
            <>
              <Text className="text-center font-poppins text-base text-red-700">
                {error}
              </Text>
              <Button variant="link" label="Tentar de novo" onPress={reload} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.green} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
