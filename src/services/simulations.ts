import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export type SimulationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// Um cenário da lista: a cena, as tarefas e a situação para este aluno
export interface Simulation {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: SimulationLevel;
  tasks: string[];
  // Exclusivo do Premium e a conta não assina: o toque leva à tela de planos
  isLocked: boolean;
  // O aluno já completou o cenário alguma vez
  isCompleted: boolean;
}

export interface SimulationList {
  simulations: Simulation[];
  // Simulações que o aluno ainda pode começar hoje, e o limite do plano
  remainingToday: number;
  limitPerDay: number;
}

// A última lista carregada, para a tela de um cenário abrir na hora
let cachedList: SimulationList | null = null;

export async function getSimulations(token: string) {
  cachedList = await api<SimulationList>(API_ROUTES.simulations, { token });
  return cachedList;
}

// Um cenário da última lista carregada, ou null sem lista
export function getCachedSimulation(id: string) {
  return (
    cachedList?.simulations.find((simulation) => simulation.id === id) ?? null
  );
}
