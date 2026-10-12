# Arquitetura

O que as duas fases compartilham.

## Navegação

```
(tabs)/index      Dashboard
(tabs)/learn      Aprender
(tabs)/practice   Praticar          novo, no lugar de (tabs)/courses
(tabs)/progress   Progresso
(tabs)/profile    Perfil            ganha o link "Meus cursos"
courses           lista de cursos   movida para fora das abas
practice/chat     chat com a Gisa   novo
```

`courses` e `practice/chat` são telas da pilha de `src/app/(app)/_layout.tsx`, abertas por cima das abas.

## Quem pode usar

- Assinante é `user.role !== 'FREE_STUDENT'`, com `user` de `useAuth()` (`src/contexts/AuthContext.tsx`). A regra fica numa função em `src/utils/practice.ts`, usada pela aba e pela tela do chat.
- O backend aplica a mesma regra e responde `403` ao gratuito. O app trata o `403` como bloqueio, não como erro de envio.

## Contrato da rota

`POST /api/mobile/practice/chat`, com o token da sessão. É o espelho do contrato em `.specs/practice-chat/README.md` do site; ao mudar um, mude o outro.

Corpo:

```json
{
  "messages": [
    { "role": "assistant", "content": "Olá, Ana! Sou a Professora Gisa..." },
    { "role": "user", "content": "Eu trabalho em uma hospital." }
  ]
}
```

- A conversa inteira, na ordem, terminando numa mensagem `user`. A abertura vai como a primeira mensagem `assistant`.
- Das falas da Gisa, o app envia só o texto da resposta, sem a correção.

Resposta `200`:

```json
{
  "correction": {
    "hasErrors": true,
    "corrected": "Eu trabalho em um hospital.",
    "explanation": "\"Hospital\" is a masculine noun, so use \"um\".",
    "mistakes": ["uma hospital"]
  },
  "reply": "Que legal! O que você faz no hospital?",
  "replyTranslation": "How nice! What do you do at the hospital?"
}
```

- `mistakes`: trechos da mensagem do aluno, como ele escreveu.
- `replyTranslation`: a fala da Gisa em inglês, mostrada só quando o aluno pede.
- Sem erros: `hasErrors` falso, `explanation` vazia e `mistakes` vazio.

Erros, como `{ "error": string }`: `401` (sessão; o `api` já encerra o login), `403` (gratuito), `400` (corpo inválido) e `500` (falha do modelo).

## Estado da conversa

Fica em memória, no hook `usePracticeChat` (`src/hooks/usePracticeChat.ts`). Nada vai para o armazenamento do aparelho.

```ts
type ChatMessage =
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
    };
```

- O hook começa com a abertura e expõe `messages`, `isReplying`, `send(text)`, `retry()` e `restart()`.
- `send` acrescenta a mensagem do aluno como `sending`, chama o serviço com a conversa e, na resposta, grava a correção nela e acrescenta a fala da Gisa.
- Só uma mensagem fica pendente por vez: enquanto `isReplying`, a tela não envia outra.
- Uma mensagem `failed` não entra na conversa enviada ao backend, a não ser no `retry` dela mesma.

## Arquivos

| Arquivo                             | Papel                                                              | Fase |
| ----------------------------------- | ------------------------------------------------------------------ | ---- |
| `src/app/(app)/(tabs)/practice.tsx` | Aba Praticar                                                       | 01   |
| `src/app/(app)/courses.tsx`         | Lista de cursos, movida de `(tabs)/courses.tsx`                    | 01   |
| `src/utils/practice.ts`             | Regra de assinante, texto da abertura e divisão do texto em grifos | 01   |
| `src/app/(app)/practice/chat.tsx`   | Tela do chat                                                       | 02   |
| `src/services/practice.ts`          | Chamada à rota e tipos do contrato                                 | 02   |
| `src/hooks/usePracticeChat.ts`      | Estado da conversa                                                 | 02   |
| `src/components/practice/`          | Balões, cartão de correção, campo de envio, indicador de digitação | 02   |

## Reaproveitado sem alterar

- `api`, `ApiError` e `getErrorMessage` (`src/lib/api.ts`).
- `useAuth` (`src/contexts/AuthContext.tsx`) e `getFirstName` (`src/utils/format.ts`).
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), o cabeçalho com botão de voltar.
- `Button` (`src/components/Button.tsx`) e `colors` (`src/constants/theme.ts`).

## Padrões visuais

- Textos em português, fonte Poppins, cores do tema.
- Cartões e balões separados por borda ou cor de fundo, sem sombra pequena.
