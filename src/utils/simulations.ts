import type { SimulationLevel } from '@/services/simulations';

export const SIMULATION_LEVEL_TITLES: Record<SimulationLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export function formatTasks(count: number) {
  return count === 1 ? '1 tarefa' : `${count} tarefas`;
}

// Linha da lista com as simulações que restam hoje
export function getRemainingTodayLabel(remaining: number, limit: number) {
  return remaining <= 0
    ? 'Você fez todas as simulações de hoje'
    : `Restam ${remaining} de ${limit} hoje`;
}
