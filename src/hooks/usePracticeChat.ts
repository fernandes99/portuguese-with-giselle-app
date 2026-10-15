import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  type PracticeCorrection,
  type PracticeMessage,
  sendPracticeMessage,
  startPracticeChat,
} from '@/services/practice';
import {
  canUsePractice,
  getOpeningMessage,
  getOpeningTranslation,
} from '@/utils/practice';

export type ChatMessage =
  | {
      id: string;
      role: 'assistant';
      content: string;
      // No idioma nativo do aluno; sem ela, o balão não tem o botão de traduzir
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

// Conversa com a Gisa. Fica só em memória: sair da tela a apaga. A abertura
// vem do backend, no nível, no estilo e sobre um tema do aluno; se o pedido
// falhar, entra a abertura fixa. Sem estilo escolhido, nada é pedido: a tela
// mostra a escolha antes.
export function usePracticeChat() {
  const { token, user } = useAuth();
  const nextId = useRef(1);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Esperando a abertura do backend
  const [isOpening, setIsOpening] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  // O backend recusou por a conta não ser de assinante
  const [isBlocked, setIsBlocked] = useState(false);
  // Muda a cada conversa: a resposta de uma conversa apagada é descartada
  const conversation = useRef(0);

  // Pede a abertura de uma conversa nova
  const open = useCallback(async () => {
    const current = conversation.current;
    setIsOpening(true);
    // Uma resposta da conversa anterior ainda a caminho é descartada
    setIsReplying(false);
    setMessages([]);

    // Conta gratuita: a tela mostra o bloqueio, sem pedir nada ao backend
    if (!token || !canUsePractice(user)) {
      setIsOpening(false);
      return;
    }

    let opening: ChatMessage;
    try {
      const result = await startPracticeChat(token);
      opening = {
        id: 'opening',
        role: 'assistant',
        content: result.reply,
        translation: result.replyTranslation || undefined,
      };
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setIsBlocked(true);
      }
      opening = {
        id: 'opening',
        role: 'assistant',
        content: getOpeningMessage(user?.name),
        translation: getOpeningTranslation(user?.name),
      };
    }

    if (conversation.current !== current) {
      return;
    }
    setMessages([opening]);
    setIsOpening(false);
  }, [token, user]);

  // `undefined` (backend antigo, sem o campo) conta como escolhido
  const style = user?.chatStyle === undefined ? 'DEFAULT' : user.chatStyle;

  // Pede a abertura ao abrir a tela e de novo quando o estilo muda, o que
  // recomeça a conversa. Sair da tela descarta a resposta que não chegou.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a abertura depende só do estilo; recomeçar pelo botão pede outra
  useEffect(() => {
    if (!style) {
      return;
    }

    open();
    return () => {
      conversation.current += 1;
    };
  }, [style]);

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

  const last: ChatMessage | undefined = messages[messages.length - 1];
  const hasFailed = last?.role === 'user' && last.status === 'failed';

  function send(text: string) {
    const content = text.trim();
    if (!content || isOpening || isReplying || hasFailed) {
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
    if (last?.role !== 'user' || last.status !== 'failed' || isReplying) {
      return;
    }

    deliver(messages.slice(0, -1), last);
  }

  function restart() {
    conversation.current += 1;
    setIsReplying(false);
    open();
  }

  return {
    messages,
    isOpening,
    isReplying,
    isBlocked,
    hasFailed,
    // Só a abertura, ou ela ainda chegando: não há o que recomeçar
    isEmpty: messages.length <= 1,
    send,
    retry,
    restart,
  };
}
