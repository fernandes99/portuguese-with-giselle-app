import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage } from '@/hooks/usePracticeChat';
import { ApiError, getErrorMessage } from '@/lib/api';
import { transcribePracticeAnswer } from '@/services/practice';
import {
  SIMULATION_ERROR_CODES,
  type SimulationStatus,
  sendSimulationTurn,
  startSimulation,
} from '@/services/simulations';
import { buildPracticePayload } from '@/utils/practicePayload';

// intro: a apresentação; starting: esperando a primeira fala; playing: a
// conversa; finished: o resumo
export type SimulationPhase = 'intro' | 'starting' | 'playing' | 'finished';

type StudentMessage = Extract<ChatMessage, { role: 'user' }>;

// Resultado de uma resposta falada, como no chat
export type SimulationVoiceResult =
  { ok: true } | { ok: false; message: string; code?: string };

// Erro ao começar: o limite do dia troca o botão pelo aviso
export interface SimulationStartError {
  message: string;
  isDailyLimit: boolean;
}

const NOT_UNDERSTOOD = 'Não entendi, tente de novo.';

// Campo opcional do backend: vazio vira ausente
function optional(value: string | undefined) {
  return value ? value : undefined;
}

function errorCode(err: unknown) {
  return err instanceof ApiError ? (err.code ?? undefined) : undefined;
}

// Uma simulação de um cenário: a conversa com a personagem e as tarefas.
// Fica só em memória, como o chat; o progresso das tarefas e as mensagens
// que restam vêm do backend, que também decide quando ela acaba. A tela
// passa para o resumo (`finish`) depois da última fala.
export function useSimulation(simulationId: string) {
  const { token } = useAuth();
  const nextId = useRef(1);
  // Muda a cada simulação: a resposta de uma simulação deixada é descartada
  const attempt = useRef(0);

  const [phase, setPhase] = useState<SimulationPhase>('intro');
  const [runId, setRunId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReplying, setIsReplying] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  // As tarefas do último turno, para a faixa destacar; muda a cada turno
  const [lastCompleted, setLastCompleted] = useState<{
    tasks: number[];
    turn: number;
  } | null>(null);
  const [remainingMessages, setRemainingMessages] = useState(0);
  const [status, setStatus] = useState<SimulationStatus>('IN_PROGRESS');
  const [feedback, setFeedback] = useState('');
  // A simulação parou por outro motivo (terminou no backend ou o teto do
  // mês): a mensagem aparece no resumo
  const [endNotice, setEndNotice] = useState<string | null>(null);
  const [startError, setStartError] = useState<SimulationStartError | null>(
    null
  );

  // Sair da tela descarta o que ainda estava a caminho
  useEffect(
    () => () => {
      attempt.current += 1;
    },
    []
  );

  // Começa a simulação. Devolve `locked` quando o cenário é do Premium, para
  // a tela levar aos planos.
  const start = useCallback(async (): Promise<{ locked: boolean }> => {
    if (!token) {
      return { locked: false };
    }

    attempt.current += 1;
    const current = attempt.current;
    setPhase('starting');
    setStartError(null);

    try {
      const result = await startSimulation(token, simulationId);
      if (attempt.current !== current) {
        return { locked: false };
      }
      setRunId(result.runId);
      setMessages([
        {
          id: 'opening',
          role: 'assistant',
          content: result.reply,
          translation: optional(result.replyTranslation),
          signature: optional(result.replySignature),
          suggestion: optional(result.suggestion),
          suggestionTranslation: optional(result.suggestionTranslation),
        },
      ]);
      setCompletedTasks([]);
      setLastCompleted(null);
      setRemainingMessages(result.maxMessages);
      setStatus('IN_PROGRESS');
      setFeedback('');
      setEndNotice(null);
      setPhase('playing');
      return { locked: false };
    } catch (err) {
      if (attempt.current !== current) {
        return { locked: false };
      }
      setPhase('intro');
      const code = errorCode(err);
      if (code === SIMULATION_ERROR_CODES.locked) {
        return { locked: true };
      }
      setStartError({
        message: getErrorMessage(
          err,
          'Não foi possível começar a simulação. Tente novamente.'
        ),
        isDailyLimit: code === SIMULATION_ERROR_CODES.dailyLimit,
      });
      return { locked: false };
    }
  }, [token, simulationId]);

  // `history` são as mensagens já respondidas; `pending`, a do aluno
  const deliver = useCallback(
    async (history: ChatMessage[], pending: StudentMessage) => {
      if (!token || !runId) {
        return;
      }

      const current = attempt.current;
      setIsReplying(true);
      setMessages([...history, { ...pending, status: 'sending' }]);

      try {
        const turn = await sendSimulationTurn(
          token,
          runId,
          buildPracticePayload(history, pending)
        );
        if (attempt.current !== current) {
          return;
        }

        const turnNumber = nextId.current++;
        setMessages([
          ...history,
          {
            ...pending,
            status: 'sent',
            correction: turn.correction,
            correctedSignature: optional(turn.correctedSignature),
          },
          {
            id: `personagem-${turnNumber}`,
            role: 'assistant',
            content: turn.reply,
            translation: optional(turn.replyTranslation),
            signature: optional(turn.replySignature),
            suggestion: optional(turn.suggestion),
            suggestionTranslation: optional(turn.suggestionTranslation),
          },
        ]);
        setCompletedTasks(turn.completedTasks);
        if (turn.newlyCompletedTasks.length > 0) {
          setLastCompleted({
            tasks: turn.newlyCompletedTasks,
            turn: turnNumber,
          });
        }
        setRemainingMessages(turn.remainingMessages);
        setStatus(turn.status);
        setFeedback(turn.feedback);
      } catch (err) {
        if (attempt.current !== current) {
          return;
        }

        const code = errorCode(err);
        // Não há como continuar: o resumo mostra o que o app tem
        if (
          code === SIMULATION_ERROR_CODES.finished ||
          code === SIMULATION_ERROR_CODES.monthlyLimit
        ) {
          setMessages([...history, { ...pending, status: 'sent' }]);
          setEndNotice(getErrorMessage(err, 'Esta simulação já terminou.'));
          setStatus('NOT_COMPLETED');
          setPhase('finished');
          return;
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
        if (attempt.current === current) {
          setIsReplying(false);
        }
      }
    },
    [token, runId]
  );

  const last: ChatMessage | undefined = messages[messages.length - 1];
  const hasFailed = last?.role === 'user' && last.status === 'failed';
  const isTranscribing = messages.some(
    (message) => message.role === 'user' && message.status === 'transcribing'
  );
  // A simulação acabou no backend; a tela ainda mostra a última fala
  const isOver = status !== 'IN_PROGRESS';
  // Enquanto algo está a caminho, ou depois do fim, nada novo sai
  const isBusy =
    phase !== 'playing' || isReplying || isTranscribing || hasFailed || isOver;

  function send(text: string) {
    const content = text.trim();
    if (!content || isBusy) {
      return;
    }

    deliver(messages, {
      id: `aluno-${nextId.current++}`,
      role: 'user',
      content,
      status: 'sending',
    });
  }

  // Resposta falada: como no chat, aparece "Ouvindo..." até virar texto
  async function sendVoice(uri: string): Promise<SimulationVoiceResult> {
    if (!token || isBusy) {
      return { ok: true };
    }

    const current = attempt.current;
    const history = messages;
    const id = `aluno-${nextId.current++}`;
    setMessages([
      ...history,
      { id, role: 'user', content: '', status: 'transcribing' },
    ]);

    let text: string;
    try {
      text = (await transcribePracticeAnswer(token, uri)).text.trim();
    } catch (err) {
      if (attempt.current !== current) {
        return { ok: true };
      }
      setMessages(history);
      return {
        ok: false,
        message: getErrorMessage(
          err,
          'Não foi possível ouvir seu áudio. Tente de novo.'
        ),
        code: errorCode(err),
      };
    }

    if (attempt.current !== current) {
      return { ok: true };
    }
    if (!text) {
      setMessages(history);
      return { ok: false, message: NOT_UNDERSTOOD };
    }

    deliver(history, { id, role: 'user', content: text, status: 'sending' });
    return { ok: true };
  }

  // Reenvia a mensagem que falhou
  function retry() {
    if (!hasFailed || isReplying || isTranscribing || last?.role !== 'user') {
      return;
    }
    deliver(messages.slice(0, -1), last);
  }

  // Dica da última fala da personagem, quando ela é a última da conversa
  const spoken = messages.filter((message) => message.role !== 'notice');
  const lastSpoken = spoken[spoken.length - 1];
  const lastSuggestion =
    !isOver && lastSpoken?.role === 'assistant' && lastSpoken.suggestion
      ? {
          text: lastSpoken.suggestion,
          translation: lastSpoken.suggestionTranslation,
        }
      : null;

  // Aviso do próprio app no fim da conversa (a voz parou pelo limite)
  function addNotice(content: string) {
    setMessages((current) => [
      ...current,
      { id: `aviso-${nextId.current++}`, role: 'notice', content },
    ]);
  }

  // Do fim da conversa para o resumo
  function finish() {
    setPhase((current) => (current === 'playing' ? 'finished' : current));
  }

  // "Tentar de novo" do resumo: volta à apresentação do mesmo cenário
  function restart() {
    attempt.current += 1;
    setIsReplying(false);
    setRunId(null);
    setMessages([]);
    setCompletedTasks([]);
    setLastCompleted(null);
    setStatus('IN_PROGRESS');
    setFeedback('');
    setEndNotice(null);
    setStartError(null);
    setPhase('intro');
  }

  return {
    phase,
    messages,
    isReplying,
    isTranscribing,
    isBusy,
    isOver,
    completedTasks,
    lastCompleted,
    remainingMessages,
    status,
    feedback,
    endNotice,
    startError,
    lastSuggestion,
    start,
    send,
    sendVoice,
    retry,
    addNotice,
    finish,
    restart,
  };
}
