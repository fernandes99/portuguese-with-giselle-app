import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { LessonHeader } from '@/components/lesson/ClassicLesson';
import { EmptyState } from '@/components/lesson/EmptyState';
import { BookingRow } from '@/components/privateLessons/BookingRow';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useRefreshAfterBrowser } from '@/hooks/useRefreshAfterBrowser';
import {
  getBookings,
  getPrivateLessons,
  type PrivateLesson,
} from '@/services/privateLessons';

// O prazo e o email de contato vêm do resumo; a lista, da rota própria
async function getBookingsScreen(token: string) {
  const [summary, bookings] = await Promise.all([
    getPrivateLessons(token),
    getBookings(token),
  ]);
  return { summary, bookings };
}

// Todos os agendamentos do aluno: as aulas agendadas e, depois, as
// realizadas e canceladas. A situação de cada uma vem calculada do backend.
export default function BookingsScreen() {
  const { data, error, refreshing, refresh, reload } = useApiQuery(
    getBookingsScreen,
    'Erro ao carregar os agendamentos.'
  );
  const refreshSoon = useRefreshAfterBrowser(reload);

  const sections = useMemo(() => {
    const bookings = data?.bookings ?? [];
    const scheduled = bookings.filter((item) => item.status === 'scheduled');
    const previous = bookings.filter((item) => item.status !== 'scheduled');

    return [
      { title: 'Agendadas', data: scheduled },
      { title: 'Anteriores', data: previous },
    ].filter((section) => section.data.length > 0);
  }, [data]);

  const renderItem = useCallback(
    ({ item }: { item: PrivateLesson }) =>
      data ? (
        <BookingRow
          lesson={item}
          changeNoticeHours={data.summary.changeNoticeHours}
          contactEmail={data.summary.contactEmail}
          onChanged={refreshSoon}
        />
      ) : null,
    [data, refreshSoon]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <LessonHeader title="Agendamentos" />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text
            accessibilityRole="header"
            className="bg-background pb-2 pt-3 font-poppins-semibold text-sm uppercase text-gray-500"
          >
            {section.title}
          </Text>
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        stickySectionHeadersEnabled={false}
        contentContainerClassName="flex-grow px-5 pb-8 pt-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
        ListHeaderComponent={
          error ? (
            <View className="mt-3 gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="font-poppins text-sm text-red-700">{error}</Text>
              <Button variant="link" label="Tentar de novo" onPress={refresh} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          data ? (
            <View className="mt-3">
              <EmptyState title="Você ainda não agendou nenhuma aula." />
            </View>
          ) : error ? null : (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.green} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
