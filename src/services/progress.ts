import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export interface ProgressStats {
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  // Soma da duração das aulas concluídas
  studyMinutes: number;
  currentStreak: number;
}

export interface StudyDay {
  // Dia no fuso do aparelho, como AAAA-MM-DD
  date: string;
  // Teve aula concluída, exercício concluído ou card respondido
  studied: boolean;
}

export interface DayActivity {
  date: string;
  lessons: number;
  activities: number;
  // Cards respondidos mais mensagens enviadas no chat
  practices: number;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  // ISO; null enquanto não desbloqueada
  unlockedAt: string | null;
  // Andamento: o número do aluno, limitado à meta, e a meta. Na desbloqueada,
  // `current` é igual a `target`.
  current: number;
  target: number;
}

export interface Progress {
  stats: ProgressStats;
  // Semana corrente, de segunda a domingo
  week: {
    activeDays: number;
    days: StudyDay[];
  };
  // Últimos 7 dias, do mais antigo para hoje
  activity: DayActivity[];
  streak: {
    current: number;
    best: number;
  };
  achievements: {
    unlocked: number;
    total: number;
    // Desbloqueadas primeiro
    items: Achievement[];
  };
}

// `timeZone` é o fuso do aparelho (IANA): o backend conta os dias nele
export function getProgress(token: string, timeZone: string) {
  return api<Progress>(
    `${API_ROUTES.progress}?timeZone=${encodeURIComponent(timeZone)}`,
    { token }
  );
}
