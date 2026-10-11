import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export const DISCUSSION_MAX_LENGTH = 2000;

export interface DiscussionAuthor {
  id: string;
  name: string | null;
  image: string | null;
  // Professora (role TEACHER), destacada na discussão
  isTeacher: boolean;
}

export interface DiscussionComment {
  id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  isMine: boolean;
  author: DiscussionAuthor;
}

// Comentário principal com as respostas, da mais antiga para a mais nova
export interface DiscussionThread extends DiscussionComment {
  replies: DiscussionComment[];
}

export async function getDiscussions(token: string, lessonId: string) {
  const { discussions } = await api<{ discussions: DiscussionThread[] }>(
    API_ROUTES.lessonDiscussions(lessonId),
    { token }
  );
  return discussions;
}

// Sem parentId cria um comentário novo; com ele, uma resposta. `threadId`
// é o comentário principal da conversa em que a resposta entrou.
export function createDiscussion(
  token: string,
  lessonId: string,
  content: string,
  parentId?: string
) {
  return api<{ comment: DiscussionComment; threadId: string }>(
    API_ROUTES.lessonDiscussions(lessonId),
    { method: 'POST', body: { content, parentId }, token }
  );
}
