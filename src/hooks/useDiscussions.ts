import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  createDiscussion,
  type DiscussionThread,
  getDiscussions,
} from '@/services/discussions';

export function useDiscussions(lessonId: string) {
  const { token, signOut } = useAuth();

  const [threads, setThreads] = useState<DiscussionThread[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    setError('');
    try {
      setThreads(await getDiscussions(token, lessonId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setError(getErrorMessage(err, 'Erro ao carregar a discussão.'));
    }
  }, [token, lessonId, signOut]);

  useEffect(() => {
    load();
  }, [load]);

  // Publica e já coloca o comentário na lista. Lança ApiError se falhar,
  // para quem chamou mostrar a mensagem ao lado do campo.
  const publish = useCallback(
    async (content: string, parentId?: string) => {
      if (!token) {
        return;
      }

      const { comment, threadId } = await createDiscussion(
        token,
        lessonId,
        content,
        parentId
      );

      setThreads((current) => {
        const list = current ?? [];

        if (!parentId) {
          return [{ ...comment, replies: [] }, ...list];
        }

        return list.map((thread) =>
          thread.id === threadId
            ? { ...thread, replies: [...thread.replies, comment] }
            : thread
        );
      });
    },
    [token, lessonId]
  );

  return { threads, error, reload: load, publish };
}
