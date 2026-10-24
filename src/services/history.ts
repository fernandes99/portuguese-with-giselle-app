import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export type HistoryEntity =
  | 'COURSE'
  | 'MODULE'
  | 'LESSON'
  | 'ACTIVITY'
  | 'FLASHCARD'
  | 'SIMULATION'
  | 'HOMEWORK';

export type HistoryAction = 'STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface HistoryEntry {
  id: string;
  entityType: HistoryEntity;
  action: HistoryAction;
  title: string;
  // Curso da aula, do módulo ou da atividade; conjunto do card
  context: string | null;
  // ISO: quando o item chegou à situação atual
  updatedAt: string;
}

export interface History {
  entries: HistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

// `type` nulo traz todos os tipos
export function getHistory(
  token: string,
  type: HistoryEntity | null,
  page: number
) {
  const query = type ? `?type=${type}&page=${page}` : `?page=${page}`;
  return api<History>(`${API_ROUTES.history}${query}`, { token });
}
