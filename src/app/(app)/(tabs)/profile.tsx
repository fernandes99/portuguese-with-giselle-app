import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { APP_VERSION } from '@/constants/version';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherChatUnread } from '@/contexts/TeacherChatUnreadContext';
import { canSeePlans } from '@/utils/plans';
import { formatUnread } from '@/utils/teacherChat';

// Por enquanto identifica a conta, leva aos planos, ao chat com a
// professora, aos cursos e ao histórico, e permite sair
export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { unread, refreshUnread } = useTeacherChatUnread();
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  // Sem notificação, é aqui que o aluno vê que a professora respondeu
  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

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
      <View className="gap-4 p-6">
        {canSeePlans(user) ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/plans')}
            className="flex-row items-center gap-3 rounded-2xl bg-green-600 p-4 active:bg-green-700"
          >
            <MaterialCommunityIcons name="crown" size={22} color="#fde047" />
            <Text className="flex-1 font-poppins-semibold text-base text-white">
              Seja Premium
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0
              ? `Falar com a professora, ${unread} mensagens não lidas`
              : 'Falar com a professora'
          }
          onPress={() => router.push('/teacher-chat')}
          className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={colors.green}
          />
          <Text className="flex-1 font-poppins-semibold text-base text-gray-900">
            Falar com a professora
          </Text>
          {unread > 0 ? (
            <View className="h-6 min-w-6 items-center justify-center rounded-full bg-green-600 px-1.5">
              <Text className="font-poppins-bold text-xs text-white">
                {formatUnread(unread)}
              </Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/courses')}
          className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
        >
          <Ionicons name="book-outline" size={20} color={colors.green} />
          <Text className="flex-1 font-poppins-semibold text-base text-gray-900">
            Meus cursos
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/history')}
          className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
        >
          <Ionicons name="time-outline" size={20} color={colors.green} />
          <Text className="flex-1 font-poppins-semibold text-base text-gray-900">
            Histórico
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </Pressable>
        <View>
          <Button variant="link" label="Sair" onPress={signOut} />
          <Text className="mt-2 text-center font-poppins text-[11px] text-gray-400">
            v{APP_VERSION}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
