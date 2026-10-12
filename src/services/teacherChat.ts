import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export interface TeacherChatMessage {
  id: string;
  content: string;
  // Instante em ISO
  createdAt: string;
  // true quando é da professora
  fromTeacher: boolean;
}

export interface TeacherChatPage {
  // Da mais antiga para a mais recente
  messages: TeacherChatMessage[];
  // Se existem mensagens mais antigas que a primeira da lista
  hasMore: boolean;
  maxLength: number;
}

// Conversa do aluno com a professora. Sem `before`, traz as mensagens mais
// recentes e marca a conversa como lida; com ele, as anteriores àquela.
export function getTeacherChat(token: string, before?: string) {
  const path = before
    ? `${API_ROUTES.teacherChat}?before=${encodeURIComponent(before)}`
    : API_ROUTES.teacherChat;

  return api<TeacherChatPage>(path, { token });
}

export async function sendTeacherChatMessage(token: string, content: string) {
  const { message } = await api<{ message: TeacherChatMessage }>(
    API_ROUTES.teacherChat,
    { method: 'POST', body: { content }, token }
  );
  return message;
}

// Mensagens da professora que o aluno ainda não leu
export async function getTeacherChatUnread(token: string) {
  const { unread } = await api<{ unread: number }>(
    API_ROUTES.teacherChatUnread,
    { token }
  );
  return unread;
}
