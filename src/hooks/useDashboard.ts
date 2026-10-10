import { useApiQuery } from '@/hooks/useApiQuery';
import { getDashboard } from '@/services/dashboard';

export function useDashboard() {
  return useApiQuery(getDashboard, 'Erro ao carregar o dashboard.');
}
