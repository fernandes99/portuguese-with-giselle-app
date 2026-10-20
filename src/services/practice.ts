import { File } from 'expo-file-system';

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
  // Resposta possível do aluno à pergunta da fala, e a tradução; ausentes
  // no backend antigo, podem vir vazias
  suggestion?: string;
  suggestionTranslation?: string;
  // Assinaturas da fala e da frase corrigida (só com erros), para pedir a
  // voz; ausentes no backend antigo
  replySignature?: string;
  correctedSignature?: string;
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
  // Como no turno; ausentes no backend antigo
  suggestion?: string;
  suggestionTranslation?: string;
  replySignature?: string;
}

export function startPracticeChat(token: string) {
  return api<PracticeOpening>(API_ROUTES.practiceOpening, {
    method: 'POST',
    token,
  });
}

// Códigos de erro das rotas de áudio que mudam a tela
export const PRACTICE_AUDIO_ERROR_CODES = {
  speechLimit: 'SPEECH_DAILY_LIMIT',
  // Teto do custo da voz no mês: o chat continua por texto
  speechMonthlyLimit: 'SPEECH_MONTHLY_LIMIT',
  transcriptionLimit: 'TRANSCRIPTION_DAILY_LIMIT',
} as const;

export interface PracticeSpeech {
  // MP3 em base64
  audio: string;
  format: 'mp3';
  // Segundo em que cada palavra da fala começa (as partes separadas por
  // espaço); null sem alinhamento, ausente no backend antigo
  wordStarts?: number[] | null;
}

// Voz de uma fala da Gisa ou de uma frase corrigida. O texto vai como veio
// do backend, sem mudar nada: é o que a assinatura cobre.
export function getPracticeSpeech(
  token: string,
  text: string,
  signature: string
) {
  return api<PracticeSpeech>(API_ROUTES.practiceSpeech, {
    method: 'POST',
    body: { text, signature },
    token,
  });
}

// Transcreve a resposta falada do aluno; "" quando não há fala
export function transcribePracticeAnswer(token: string, uri: string) {
  const formData = new FormData();
  formData.append('audio', new File(uri), 'answer.m4a');

  return api<{ text: string }>(API_ROUTES.practiceTranscription, {
    method: 'POST',
    formData,
    token,
  });
}

export interface PracticeAllowanceItem {
  remaining: number;
  limit: number;
}

// O que resta hoje de cada limite do chat
export interface PracticeAllowance {
  messages: PracticeAllowanceItem;
  speech: PracticeAllowanceItem;
  voiceAnswers: PracticeAllowanceItem;
}

export function getPracticeAllowance(token: string) {
  return api<PracticeAllowance>(API_ROUTES.practiceUsage, { token });
}
