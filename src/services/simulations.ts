import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';
import type { PracticeCorrection, PracticeMessage } from '@/services/practice';

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

// Primeira fala da personagem, ao começar uma simulação
export interface SimulationStart {
  runId: string;
  reply: string;
  // Podem vir vazias
  replyTranslation: string;
  suggestion: string;
  suggestionTranslation: string;
  // Assinatura da fala, para pedir a voz
  replySignature: string;
  // Mensagens do aluno que cabem nesta simulação
  maxMessages: number;
  remainingToday: number;
}

export type SimulationStatus = 'IN_PROGRESS' | 'COMPLETED' | 'NOT_COMPLETED';

// Um turno: a correção da mensagem do aluno, a fala seguinte e as tarefas
export interface SimulationTurn {
  correction: PracticeCorrection;
  // Só com erros
  correctedSignature?: string;
  reply: string;
  replyTranslation: string;
  replySignature: string;
  // Vazias quando a simulação acaba
  suggestion: string;
  suggestionTranslation: string;
  // Todas as tarefas cumpridas até agora, pela posição, e as deste turno
  completedTasks: number[];
  newlyCompletedTasks: number[];
  remainingMessages: number;
  status: SimulationStatus;
  // Comentário do fim; vazio em andamento (e às vezes no fim)
  feedback: string;
}

// Códigos de erro das simulações que mudam a tela (o resto é falha comum)
export const SIMULATION_ERROR_CODES = {
  locked: 'SIMULATION_LOCKED',
  dailyLimit: 'SIMULATION_DAILY_LIMIT',
  finished: 'SIMULATION_FINISHED',
  busy: 'SIMULATION_BUSY',
  monthlyLimit: 'MONTHLY_LIMIT',
} as const;

// Começa uma simulação; conta como uma das do dia
export function startSimulation(token: string, simulationId: string) {
  return api<SimulationStart>(API_ROUTES.simulationRuns(simulationId), {
    method: 'POST',
    token,
  });
}

// `messages` é a conversa inteira, da abertura à mensagem nova do aluno
export function sendSimulationTurn(
  token: string,
  runId: string,
  messages: PracticeMessage[]
) {
  return api<SimulationTurn>(API_ROUTES.simulationTurns(runId), {
    method: 'POST',
    body: { messages },
    token,
  });
}
