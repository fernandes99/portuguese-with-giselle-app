import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';
import type { ExplanationLanguage } from '@/services/preferences';

export interface PracticeMessage {
  role: 'assistant' | 'user';
  content: string;
}

// Correção da última mensagem do aluno
export interface PracticeCorrection {
  hasErrors: boolean;
  corrected: string;
  // No idioma nativo do aluno; vazia quando não há erros
  explanation: string;
  // Trechos errados, copiados da mensagem do aluno
  mistakes: string[];
}

export interface PracticeTurn {
  correction: PracticeCorrection;
  // Fala seguinte da Gisa
  reply: string;
  // A mesma fala no idioma da tradução do aluno; pode vir vazia
  replyTranslation?: string;
  // Idioma que o aluno pediu nesta mensagem, já gravado; null sem pedido
  explanationLanguage?: ExplanationLanguage | null;
  // Mensagens que ainda cabem no dia; ausente no backend antigo
  remainingToday?: number;
}

// Códigos de erro do chat que mudam a tela (o resto é falha comum)
export const PRACTICE_ERROR_CODES = {
  // Limite do dia ou do mês: o chat fica bloqueado
  blocked: ['DAILY_LIMIT', 'MONTHLY_LIMIT'],
  // A conversa passou do tamanho: só recomeçando
  restart: ['CONVERSATION_TOO_LONG'],
} as const;

// `messages` é a conversa inteira e termina na mensagem nova do aluno
export function sendPracticeMessage(
  token: string,
  messages: PracticeMessage[]
) {
  return api<PracticeTurn>(API_ROUTES.practiceChat, {
    method: 'POST',
    body: { messages },
    token,
  });
}

// Primeira mensagem da Gisa, gerada pelo backend sobre um dos temas ou o
// objetivo do aluno
export interface PracticeOpening {
  reply: string;
  // A mesma fala no idioma da tradução do aluno; pode vir vazia
  replyTranslation?: string;
  // Mensagens que ainda cabem no dia; ausente no backend antigo
  remainingToday?: number;
}

export function startPracticeChat(token: string) {
  return api<PracticeOpening>(API_ROUTES.practiceOpening, {
    method: 'POST',
    token,
  });
}
