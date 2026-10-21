import type { ChatMessage } from '@/hooks/usePracticeChat';
import type { Simulation, SimulationCategory } from '@/services/simulations';

// As categorias do filtro da lista: uma vez cada, na ordem em que aparecem
export function getSimulationCategories(
  simulations: Simulation[]
): SimulationCategory[] {
  const categories = new Map<string, SimulationCategory>();
  for (const simulation of simulations) {
    if (!categories.has(simulation.category.id)) {
      categories.set(simulation.category.id, simulation.category);
    }
  }
  return [...categories.values()];
}

// Os cenários da categoria escolhida. Sem filtro, ou com uma categoria que
// sumiu da lista ao recarregar, todos.
export function getVisibleSimulations(
  simulations: Simulation[],
  categoryId: string | null
) {
  const filtered = simulations.filter(
    (simulation) => simulation.category.id === categoryId
  );
  return filtered.length > 0 ? filtered : simulations;
}

// Etiqueta no alto do cartão. O trancado mostra só o Premium, mesmo que o
// aluno já o tenha feito quando assinava.
export function getCardBadge(
  simulation: Simulation
): 'premium' | 'done' | null {
  if (simulation.isLocked) {
    return 'premium';
  }
  return simulation.isCompleted ? 'done' : null;
}

// Linha da lista com as simulações que restam hoje
export function getRemainingTodayLabel(remaining: number, limit: number) {
  return remaining <= 0
    ? 'Você fez todas as simulações de hoje'
    : `Restam ${remaining} de ${limit} hoje`;
}

// Com tão poucas mensagens restantes na simulação, a tela avisa o aluno
export const REMAINING_MESSAGES_WARNING_AT = 3;

export function getRemainingMessagesLabel(remaining: number) {
  return remaining === 1 ? 'Resta 1 mensagem' : `Restam ${remaining} mensagens`;
}

type StudentMessage = Extract<ChatMessage, { role: 'user' }>;

// Mensagens do aluno com erro, para as "Frases para revisar" do resumo, na
// ordem da conversa. Só imports de tipo, para ser testada com o Node direto.
export function getReviewMessages(messages: ChatMessage[]): StudentMessage[] {
  return messages.filter(
    (message): message is StudentMessage =>
      message.role === 'user' && !!message.correction?.hasErrors
  );
}
