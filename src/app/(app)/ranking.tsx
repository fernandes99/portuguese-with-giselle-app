import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { HeaderButton, LessonHeader } from '@/components/lesson/ClassicLesson';
import { MyRankingBar } from '@/components/ranking/MyRankingBar';
import { PeriodSelector } from '@/components/ranking/PeriodSelector';
import { Podium } from '@/components/ranking/Podium';
import { RankingRow } from '@/components/ranking/RankingRow';
import { ScoreInfoSheet } from '@/components/ranking/ScoreInfoSheet';
import { colors } from '@/constants/theme';
import { useRanking } from '@/hooks/useRanking';
import type { RankingPeriod, RankingScoreRules } from '@/services/ranking';

// Ranking dos alunos pelo score, aberto pela aba Progresso: o seletor do
// período, o pódio, a lista até o 50º e a linha do aluno presa no pé da tela.
// O backend decide quem entra e a ordem.
export default function RankingScreen() {
  const [period, setPeriod] = useState<RankingPeriod>('month');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { ranking, error, refreshing, refresh } = useRanking(period);
  const podium = ranking?.entries.slice(0, 3) ?? [];
  const list = ranking?.entries.slice(3) ?? [];
  // As regras não mudam com o período: enquanto o outro carrega, a folha
  // continua com as últimas que chegaram
  const lastRules = useRef<RankingScoreRules | null>(null);
  if (ranking) {
    lastRules.current = ranking.scoreRules;
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <LessonHeader
        title="Ranking"
        filled
        right={
          <HeaderButton
            icon="information-circle-outline"
            label="Como funciona o ranking"
            filled
            onPress={() => setIsInfoOpen(true)}
          />
        }
      />

      <ScrollView
        contentContainerClassName="flex-grow gap-8 px-5 pb-6 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <PeriodSelector
          period={period}
          onChange={setPeriod}
          periodStart={ranking?.periodStart ?? null}
          periodEnd={ranking?.periodEnd ?? null}
          isLoaded={ranking !== null}
        />

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {ranking ? (
          ranking.entries.length === 0 ? (
            <View className="rounded-3xl bg-surface p-6">
              <Text className="text-center font-poppins text-sm text-gray-600">
                {period === 'month'
                  ? 'Ninguém ganhou pontos neste mês ainda.'
                  : 'Ninguém ganhou pontos ainda.'}
              </Text>
            </View>
          ) : (
            <>
              <Podium entries={podium} />

              {list.length > 0 ? (
                <View className="gap-1">
                  {list.map((entry) => (
                    <RankingRow key={entry.position} entry={entry} />
                  ))}
                </View>
              ) : null}
            </>
          )
        ) : !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>

      {ranking ? <MyRankingBar me={ranking.me} period={period} /> : null}

      <ScoreInfoSheet
        rules={lastRules.current}
        visible={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </SafeAreaView>
  );
}
