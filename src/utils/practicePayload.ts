import type { ChatMessage } from '@/hooks/usePracticeChat';
import type { PracticeMessage } from '@/services/practice';

type StudentMessage = Extract<ChatMessage, { role: 'user' }>;

// Conversa enviada ao backend num turno. As mensagens anteriores do aluno vão
// na versão corrigida: com os erros originais no histórico, o modelo voltava
// a corrigi-las no lugar da mensagem nova. A mensagem nova (`pending`) vai
// como o aluno escreveu, porque é ela que vai ser corrigida. Os avisos do app
// ficam de fora. Só imports de tipo, para ser testada com o Node direto.
export function buildPracticePayload(
  history: ChatMessage[],
  pending: StudentMessage
): PracticeMessage[] {
  const payload: PracticeMessage[] = [];
  for (const message of history) {
    if (message.role === 'assistant') {
      payload.push({ role: 'assistant', content: message.content });
    } else if (message.role === 'user') {
      payload.push({
        role: 'user',
        content: message.correction?.hasErrors
          ? message.correction.corrected
          : message.content,
      });
    }
  }
  payload.push({ role: 'user', content: pending.content });
  return payload;
}
