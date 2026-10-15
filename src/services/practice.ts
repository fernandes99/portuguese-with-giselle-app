import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

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
  // A mesma fala no idioma nativo do aluno; pode vir vazia
  replyTranslation?: string;
}

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
  // A mesma fala no idioma nativo do aluno; pode vir vazia
  replyTranslation?: string;
}

export function startPracticeChat(token: string) {
  return api<PracticeOpening>(API_ROUTES.practiceOpening, {
    method: 'POST',
    token,
  });
}
