import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  type PracticeCorrection,
  type PracticeMessage,
  sendPracticeMessage,
} from '@/services/practice';
import { getOpeningMessage, getOpeningTranslation } from '@/utils/practice';

export type ChatMessage =
  | {
      id: string;
      role: 'assistant';
      content: string;
      // Em inglês; sem ela, o balão não tem o botão de traduzir
      translation?: string;
    }
  | {
      id: string;
      role: 'user';
      content: string;
      // sending: aguardando o backend; failed: o envio falhou
      status: 'sending' | 'sent' | 'failed';
      // Preenchida quando o backend responde
      correction?: PracticeCorrection;
      // Motivo da falha, para mostrar junto do "Tentar de novo"
      error?: string;
    };

// Conversa com a Professora Gisa. Fica só em memória: sair da tela a apaga.
export function usePracticeChat() {
  const { token, user } = useAuth();
  const nextId = useRef(1);

  const getOpening = useCallback(
    (): ChatMessage[] => [
      {
        id: 'opening',
        role: 'assistant',
        content: getOpeningMessage(user?.name),
        translation: getOpeningTranslation(user?.name),
      },
    ],
    [user?.name]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(getOpening);
  const [isReplying, setIsReplying] = useState(false);
  // O backend recusou por a conta não ser de assinante
  const [isBlocked, setIsBlocked] = useState(false);
  // Muda a cada conversa: a resposta de uma conversa apagada é descartada
  const conversation = useRef(0);

  // `history` são as mensagens já respondidas; `pending`, a do aluno
  const deliver = useCallback(
    async (
      history: ChatMessage[],
      pending: Extract<ChatMessage, { role: 'user' }>
    ) => {
      if (!token) {
        return;
      }

      const current = conversation.current;
      setIsReplying(true);
      setMessages([...history, { ...pending, status: 'sending' }]);

      const payload: PracticeMessage[] = [...history, pending].map(
        ({ role, content }) => ({ role, content })
      );

      try {
        const turn = await sendPracticeMessage(token, payload);
        if (conversation.current !== current) {
          return;
        }

        const replyId = `gisa-${nextId.current++}`;
        setMessages([
          ...history,
          { ...pending, status: 'sent', correction: turn.correction },
          {
            id: replyId,
            role: 'assistant',
            content: turn.reply,
            translation: turn.replyTranslation || undefined,
          },
        ]);
      } catch (err) {
        if (conversation.current !== current) {
          return;
        }

        if (err instanceof ApiError && err.status === 403) {
          setIsBlocked(true);
        }
        setMessages([
          ...history,
          {
            ...pending,
            status: 'failed',
            error: getErrorMessage(err, 'Não foi possível enviar.'),
          },
        ]);
      } finally {
        if (conversation.current === current) {
          setIsReplying(false);
        }
      }
    },
    [token]
  );

  const last = messages[messages.length - 1];
  const hasFailed = last.role === 'user' && last.status === 'failed';

  function send(text: string) {
    const content = text.trim();
    if (!content || isReplying || hasFailed) {
      return;
    }

    deliver(messages, {
      id: `aluno-${nextId.current++}`,
      role: 'user',
      content,
      status: 'sending',
    });
  }

  // Reenvia a mensagem que falhou
  function retry() {
    if (last.role !== 'user' || last.status !== 'failed' || isReplying) {
      return;
    }

    deliver(messages.slice(0, -1), last);
  }

  function restart() {
    conversation.current += 1;
    setIsReplying(false);
    setMessages(getOpening());
  }

  return {
    messages,
    isReplying,
    isBlocked,
    hasFailed,
    // Só a abertura: não há o que recomeçar
    isEmpty: messages.length === 1,
    send,
    retry,
    restart,
  };
}
