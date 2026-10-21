import { useCallback } from 'react';

import { useApiQuery } from '@/hooks/useApiQuery';
import { getCourses } from '@/services/courses';
import { getProgress } from '@/services/progress';
import { getDeviceTimeZone } from '@/utils/progress';

// Função de módulo: o useApiQuery precisa de um fetcher de identidade estável
function fetchProgress(token: string) {
  return getProgress(token, getDeviceTimeZone());
}

// Dados da aba Progresso: os números, o hábito e as conquistas do aluno
// (rota de progresso) e o andamento de cada curso
export function useProgress() {
  const progress = useApiQuery(fetchProgress, 'Erro ao carregar o progresso.');
  const courses = useApiQuery(getCourses, 'Erro ao carregar os cursos.');

  const { refresh: refreshProgress } = progress;
  const { refresh: refreshCourses } = courses;
  const refresh = useCallback(async () => {
    await Promise.all([refreshProgress(), refreshCourses()]);
  }, [refreshProgress, refreshCourses]);

  return {
    progress: progress.data,
    courses: courses.data,
    error: progress.error || courses.error,
    refreshing: progress.refreshing || courses.refreshing,
    refresh,
  };
}

// Página de conquistas: a mesma rota de progresso, só a parte das conquistas
export function useAchievements() {
  const { data, error, refreshing, refresh } = useApiQuery(
    fetchProgress,
    'Erro ao carregar as conquistas.'
  );

  return { achievements: data?.achievements, error, refreshing, refresh };
}
