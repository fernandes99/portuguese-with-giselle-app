# Arquitetura

O que as fases compartilham.

## Navegação

```
(tabs)/index      Dashboard
(tabs)/learn      Aprender
(tabs)/practice   Praticar          novo, no lugar de (tabs)/courses
(tabs)/progress   Progresso
(tabs)/profile    Perfil            ganha o link "Meus cursos"
courses           lista de cursos   movida para fora das abas
practice/chat     chat com a Gisa   novo
practice/style    estilo da Gisa    fase 04, aberto pelo chat e pelo Perfil
```

`courses` e `practice/chat` são telas da pilha de `src/app/(app)/_layout.tsx`, abertas por cima das abas.

## Quem pode usar

- Assinante é `user.role !== 'FREE_STUDENT'`, com `user` de `useAuth()` (`src/contexts/AuthContext.tsx`). A regra fica numa função em `src/utils/practice.ts`, usada pela aba e pela tela do chat.
- O backend aplica a mesma regra e responde `403` ao gratuito. O app trata o `403` como bloqueio, não como erro de envio.

## Contrato das rotas

Espelho do contrato em `.specs/practice-chat/README.md` do site; ao mudar um, mude o outro.

### Abertura (fase 03)

`POST /api/mobile/practice/opening`, com o token da sessão e sem corpo.

Resposta `200`:

```json
{
  "reply": "Oi, Ana! 😊 Eu sou a Gisa, sua parceira de conversação com IA. Aqui no Portuguese with Giselle a gente pratica português conversando. Qual é o seu prato favorito?",
  "replyTranslation": "Hi, Ana! 😊 I'm Gisa, your AI conversation partner. Here on Portuguese with Giselle we practice Portuguese by talking. What's your favorite dish?"
}
```

- `reply` vira a primeira mensagem `assistant` da conversa; `replyTranslation`, a tradução dela. Pode vir vazia.
- Erros: `401`, `403` e `500`, como na rota do turno.

### Estilo da Gisa (fase 05 do site)

- `GET /api/mobile/preferences` traz `preferences.chatStyle` (`FRIENDLY`, `TUTOR`, `BRAZILIAN`, `CALM` ou `null`) e `options.chatStyles`, com `id`, `title`, `emoji`, `description` e `example`.
- O usuário da sessão do app (login, Google e `me`) traz `chatStyle`; `null` quer dizer que o aluno ainda não escolheu.
- `PUT /api/mobile/preferences/chat-style`, com `{ "chatStyle": "TUTOR" }`, grava só o estilo e responde `{ "chatStyle": "TUTOR" }`. Erros: `401`, `400` (código fora da lista), `409` (`Responda as perguntas de boas-vindas antes.`) e `500`.
- O estilo muda o tom da abertura e das respostas; a correção segue o nível. Sem estilo, o backend usa Amigável.

### Turno

`POST /api/mobile/practice/chat`, com o token da sessão.

Corpo:

```json
{
  "messages": [
    {
      "role": "assistant",
      "content": "Oi, Ana! 😊 Eu sou a Gisa, sua parceira de conversação com IA..."
    },
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
- `replyTranslation`: a fala da Gisa traduzida, mostrada só quando o aluno pede.
- `explanation` e `replyTranslation` vêm no idioma nativo do aluno: espanhol ou inglês. O app mostra os textos como chegam.
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
    };
```

- O hook expõe `messages`, `isReplying`, `send(text)`, `retry()` e `restart()`.
- Até a fase 02, o hook começava com a abertura fixa. Da fase 03 em diante, começa vazio, com `isOpening`, e pede a abertura ao backend ao montar e a cada `restart`. Se o pedido falhar, usa a abertura fixa.
- `send` acrescenta a mensagem do aluno como `sending`, chama o serviço com a conversa e, na resposta, grava a correção nela e acrescenta a fala da Gisa.
- Só uma mensagem fica pendente por vez: enquanto `isReplying`, a tela não envia outra.
- Uma mensagem `failed` não entra na conversa enviada ao backend, a não ser no `retry` dela mesma.

## Arquivos

| Arquivo                                                           | Papel                                                              | Fase |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| `src/app/(app)/(tabs)/practice.tsx`                               | Aba Praticar                                                       | 01   |
| `src/app/(app)/courses.tsx`                                       | Lista de cursos, movida de `(tabs)/courses.tsx`                    | 01   |
| `src/utils/practice.ts`                                           | Regra de assinante, texto da abertura e divisão do texto em grifos | 01   |
| `src/app/(app)/practice/chat.tsx`                                 | Tela do chat                                                       | 02   |
| `src/services/practice.ts`                                        | Chamada à rota e tipos do contrato                                 | 02   |
| `src/hooks/usePracticeChat.ts`                                    | Estado da conversa                                                 | 02   |
| `src/components/practice/`                                        | Balões, cartão de correção, campo de envio, indicador de digitação | 02   |
| `src/services/practice.ts`                                        | Chamada à rota da abertura (`startPracticeChat`)                   | 03   |
| `src/hooks/usePracticeChat.ts`                                    | Abertura pelo backend, com a fixa de reserva                       | 03   |
| `src/app/(app)/practice/style.tsx`                                | Troca do estilo da Gisa                                            | 04   |
| `src/components/practice/ChatStyleSelector.tsx` e `StyleCard.tsx` | Escolha do estilo, na primeira vez no chat e na troca              | 04   |

## Reaproveitado sem alterar

- `api`, `ApiError` e `getErrorMessage` (`src/lib/api.ts`).
- `useAuth` (`src/contexts/AuthContext.tsx`) e `getFirstName` (`src/utils/format.ts`).
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), o cabeçalho com botão de voltar.
- `Button` (`src/components/Button.tsx`) e `colors` (`src/constants/theme.ts`).

## Padrões visuais

- Textos em português, fonte Poppins, cores do tema.
- Cartões e balões separados por borda ou cor de fundo, sem sombra pequena.
