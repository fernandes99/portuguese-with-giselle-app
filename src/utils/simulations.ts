import type { ChatMessage } from '@/hooks/usePracticeChat';
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
