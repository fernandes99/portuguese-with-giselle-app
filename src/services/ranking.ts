import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// month: o mês corrente, no horário de Brasília; total: desde sempre
export type RankingPeriod = 'month' | 'total';

export interface RankingEntry {
  position: number;
  // "Maria S."; null quando a conta não tem nome
  name: string | null;
  image: string | null;
  score: number;
  // Dias seguidos; 0 para quem não entrou ontem nem hoje
  streak: number;
  isMe: boolean;
}

export interface Ranking {
  period: RankingPeriod;
  // ISO: início e fim do mês; null no total
  periodStart: string | null;
  periodEnd: string | null;
  // Do 1º ao 50º, em ordem
  entries: RankingEntry[];
  // O próprio aluno; null quando ele não tem score no período
  me: RankingEntry | null;
}

export function getRanking(token: string, period: RankingPeriod) {
  return api<Ranking>(`${API_ROUTES.ranking}?period=${period}`, { token });
}
