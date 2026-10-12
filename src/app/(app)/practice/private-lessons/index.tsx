import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { BalanceCard } from '@/components/privateLessons/BalanceCard';
import { NextLessonCard } from '@/components/privateLessons/NextLessonCard';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRefreshAfterBrowser } from '@/hooks/useRefreshAfterBrowser';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  createSchedulingLink,
  getPrivateLessons,
} from '@/services/privateLessons';
import { formatPrice } from '@/utils/privateLessons';

// Aulas particulares com a professora: o saldo de aulas compradas, a
// próxima aula e os caminhos para comprar, agendar e ver os agendamentos.
// Só agenda quem tem aula disponível; o saldo e os agendamentos são sempre
// os do backend.
export default function PrivateLessonsScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();
  const {
    data: summary,
    error,
    refreshing,
    refresh,
    reload,
  } = useApiQuery(getPrivateLessons, 'Erro ao carregar as aulas particulares.');
  const refreshSoon = useRefreshAfterBrowser(reload);

  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const hasBalance = !!summary && summary.available > 0;

  const schedule = async () => {
    if (!token || scheduling) {
      return;
    }

    setScheduling(true);
    setScheduleError('');
    try {
      const url = await createSchedulingLink(token);
      await WebBrowser.openBrowserAsync(url);
      refreshSoon();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setScheduleError(
        getErrorMessage(err, 'Não foi possível abrir a agenda agora.')
      );
      // 409: o saldo acabou em outro aparelho
      reload();
    } finally {
      setScheduling(false);
    }
  };

  const buy = () => router.push('/practice/private-lessons/buy');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Aulas particulares" />
      <ScrollView
        contentContainerClassName="flex-grow gap-5 px-5 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {summary ? (
          <>
            {/* 1. Quantas aulas o aluno tem, e a compra de mais */}
            <BalanceCard
              available={summary.available}
              price={formatPrice(summary.price)}
              onBuy={buy}
            />

            {/* 2. As aulas dele: a próxima, agendar outra e a lista */}
            <View className="gap-3">
              <Text
                accessibilityRole="header"
                className="font-poppins-bold text-lg text-gray-900"
              >
                Suas aulas
              </Text>

              {summary.nextLesson ? (
                <NextLessonCard
                  lesson={summary.nextLesson}
                  changeNoticeHours={summary.changeNoticeHours}
                  contactEmail={summary.contactEmail}
                  onChanged={refreshSoon}
                />
              ) : (
                <View className="rounded-2xl border border-dashed border-gray-300 p-4">
                  <Text className="text-center font-poppins text-sm text-gray-600">
                    Você não tem nenhuma aula agendada.
                  </Text>
                </View>
              )}

              {scheduleError ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className="text-center font-poppins text-sm text-red-700"
                >
                  {scheduleError}
                </Text>
              ) : null}

              <Button
                size="lg"
                label={
                  summary.nextLesson ? 'Agendar outra aula' : 'Agendar aula'
                }
                disabled={!hasBalance}
                loading={scheduling}
                onPress={schedule}
                // Cinza, como o Continuar da aula. O cartão de saldo já diz
                // o que falta, então o toque não precisa avisar de novo.
                onDisabledPress={() => {}}
              />

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push('/practice/private-lessons/bookings')
                }
                className="flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
              >
                <Ionicons name="list" size={22} color={colors.green} />
                <Text className="flex-1 font-poppins-semibold text-base text-gray-900">
                  Ver agendamentos
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.gray}
                />
              </Pressable>
            </View>

            {/* 3. A regra, fora do caminho das ações */}
            <View className="flex-row gap-3 rounded-lg bg-gray-100 p-3">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.gray}
              />
              <Text className="flex-1 font-poppins text-sm text-gray-600">
                Cada agendamento usa uma aula do saldo. Remarque ou cancele até{' '}
                {summary.changeNoticeHours} horas antes para não perder a aula.
              </Text>
            </View>
          </>
        ) : null}

        {!summary && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
