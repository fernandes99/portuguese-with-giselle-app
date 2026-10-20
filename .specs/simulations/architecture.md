# Arquitetura

O que as duas fases dividem.

## Navegação

```
(tabs)/practice                 Praticar               ganha o cartão "Simulações"
practice/simulations/index      lista de cenários      fase 01
practice/simulations/[id]       apresentação e conversa de um cenário   fase 02
```

As duas telas novas são da pilha de `src/app/(app)/_layout.tsx`, abertas por cima das abas, como `practice/chat`. A apresentação, a conversa e o resumo são estados da mesma tela `[id]`: "Tentar de novo" volta à apresentação sem empilhar outra tela.

A tela `[id]` recebe o cenário da lista por um cache em memória do serviço (`getCachedSimulation(id)`), para abrir na hora. Sem o cache (link direto ou o app reaberto na tela), ela carrega a lista de novo e procura o cenário.

## Quem pode usar

- `canUsePractice(user)` (`src/utils/practice.ts`) continua sendo a regra do Premium. O aluno gratuito entra na lista e nos cenários com `isLocked: false`.
- O backend é quem decide o que está trancado (`isLocked`) e quantas restam (`remainingToday`); o app só mostra.
- No gratuito, o botão de ouvir e o microfone não aparecem na simulação: no lugar do microfone fica a etiqueta Premium (`PremiumBadge`), que leva à tela de planos.

## Estado da simulação

`useSimulation(scenario)` (`src/hooks/useSimulation.ts`, novo) guarda:

```ts
type SimulationPhase = 'intro' | 'starting' | 'playing' | 'finished';

interface SimulationState {
  phase: SimulationPhase;
  runId: string | null;
  // As mesmas mensagens do chat (ChatMessage, de usePracticeChat)
  messages: ChatMessage[];
  completedTasks: number[];
  // A última tarefa cumprida, para o destaque na faixa das tarefas
  lastCompletedTask: number | null;
  remainingMessages: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_COMPLETED';
  feedback: string;
  // Erro da abertura ou do limite do dia, mostrado na apresentação
  startError: string | null;
}
```

- `start()` chama a rota de começar, coloca a abertura como primeira mensagem e passa para `playing`.
- `send(text)` e `sendVoice(uri)` seguem o chat: a mensagem entra como `sending` (ou `transcribing`), o corpo sai de `buildPracticePayload` (`src/utils/practicePayload.ts`), e a falha deixa a mensagem como `failed`, com "Tentar de novo".
- A resposta do turno atualiza a correção da mensagem, junta a fala da personagem, as tarefas e `remainingMessages`. Com `status` diferente de `IN_PROGRESS`, a fala entra na conversa e, depois que ela termina de tocar (ou em 1,5 segundo, sem voz), a fase passa para `finished`.
- `409` com `SIMULATION_FINISHED` leva ao resumo com o que o app tem. `409` com `SIMULATION_BUSY` é tratado como falha de envio.
- `restart()` limpa tudo e volta para `intro`.

`useSimulation` tem a própria lógica de envio, no mesmo formato da de `usePracticeChat`, e não muda o chat. As duas dividem os tipos (`ChatMessage`), `buildPracticePayload` e os serviços de voz e transcrição. Extrair um hook comum fica para quando houver uma terceira conversa.

## Componentes

Reaproveitados de `src/components/practice/`:

- `GisaMessage` e `StudentMessage` (`ChatBubble.tsx`), com uma prop nova de avatar: a personagem usa `SimulationAvatar` (o emoji num círculo verde-claro, no tamanho da foto da Gisa). Sem a prop, continua a foto da Gisa.
- `CorrectionCard`, `HintCard`, `ChatVoiceBar` e `ListenButton`.
- `useGisaVoice` e `useHoldToTalk`, com a mesma opção de voz automática (`getChatAutoplay`, `src/lib/storage.ts`) e a mesma parada ao sair da tela (`useFocusEffect`).

Novos, em `src/components/simulations/`:

- `SimulationCard`: o cartão da lista.
- `SimulationAvatar`: o emoji da personagem.
- `SimulationIntro`: a apresentação, com as tarefas e "Começar".
- `TaskStrip`: a faixa das tarefas no topo da conversa.
- `SimulationSummary`: o resumo do fim.

## Serviço

`src/services/simulations.ts` (novo), com `getSimulations`, `startSimulation` e `sendSimulationTurn`, no padrão de `src/services/practice.ts` (`api` e `getErrorMessage`, de `src/lib/api.ts`). As rotas entram em `API_ROUTES` (`src/constants/config.ts`). A voz e a transcrição usam `getPracticeSpeech` e `transcribePracticeAnswer`, que já existem.

## Contrato das rotas

Espelho do contrato em `.specs/simulations/README.md` do site; ao mudar um, mude o outro.

Todas usam o token Bearer do app. Mensagens de erro em português, no campo `error`.

### Lista

`GET /api/mobile/simulations`

```json
{
  "simulations": [
    {
      "id": "id do registro no Dato",
      "title": "Pedir café",
      "description": "Você está pedindo um café e um lanche em uma cafeteria local.",
      "emoji": "☕",
      "level": "BEGINNER",
      "tasks": [
        "Peça um cappuccino.",
        "Pergunte se eles têm doces sem glúten.",
        "Diga que quer pagar com cartão."
      ],
      "isLocked": false,
      "isCompleted": true
    }
  ],
  "remainingToday": 2,
  "limitPerDay": 3
}
```

- `simulations`: na ordem do campo `position` do Dato.
- `level`: `BEGINNER`, `INTERMEDIATE` ou `ADVANCED`.
- `isLocked`: `true` só para o aluno gratuito em cenário sem `is_free`. As tarefas de um cenário trancado vêm assim mesmo, para mostrar o que a assinatura libera.
- `isCompleted`: o aluno já completou o cenário alguma vez.
- `remainingToday` e `limitPerDay`: simulações que ainda pode começar hoje e o limite do dia do plano dele (3 no Premium, 1 no gratuito).
- Erros: 401 sem token; 500 (`Não foi possível carregar as simulações.`).

### Começar

`POST /api/mobile/simulations/[id]/runs`, sem corpo. Cria a simulação e devolve a primeira fala da personagem.

```json
{
  "runId": "...",
  "reply": "Oi, bom dia! Bem-vindo ao Café Paulista. O que vai ser hoje?",
  "replyTranslation": "Hi, good morning! Welcome to Café Paulista. What will it be today?",
  "replySignature": "...",
  "suggestion": "Eu quero um cappuccino, por favor.",
  "suggestionTranslation": "I want a cappuccino, please.",
  "maxMessages": 12,
  "remainingToday": 2
}
```

- `suggestion` e `suggestionTranslation` vêm `""` quando o modelo não as escreveu; `replyTranslation` também.
- Erros:
  - 401 sem token;
  - 403 com `{ error, code: "SIMULATION_LOCKED" }` (`Esta simulação é exclusiva do plano Premium.`) para o gratuito num cenário sem `is_free`;
  - 404 para cenário que não existe ou não está publicado;
  - 429 com `{ error, code, resetAt }`: `SIMULATION_DAILY_LIMIT` (`Você fez suas 3 simulações de hoje. Volte amanhã!`, com o número do plano), `RATE_LIMIT` ou `MONTHLY_LIMIT` (os mesmos textos do chat);
  - 500 (`Não foi possível começar a simulação. Tente novamente.`). A simulação que falhou na abertura não é criada e não conta.

### Turno

`POST /api/mobile/simulations/runs/[runId]/turns`, com a conversa inteira, no mesmo formato do chat: `{ "messages": [{ "role": "assistant" | "user", "content": "..." }] }`, começando pela abertura e terminando na mensagem nova do aluno. As mensagens anteriores do aluno vão na versão corrigida (`buildPracticePayload` no app).

```json
{
  "correction": {
    "hasErrors": true,
    "corrected": "Eu quero um cappuccino, por favor.",
    "explanation": "\"Querer\" na primeira pessoa é \"quero\".",
    "mistakes": ["quer"]
  },
  "correctedSignature": "...",
  "reply": "Claro! Quer mais alguma coisa?",
  "replyTranslation": "Sure! Anything else?",
  "replySignature": "...",
  "suggestion": "Vocês têm doces sem glúten?",
  "suggestionTranslation": "Do you have gluten-free sweets?",
  "completedTasks": [0],
  "newlyCompletedTasks": [0],
  "remainingMessages": 11,
  "status": "IN_PROGRESS",
  "feedback": ""
}
```

- `correction` e `correctedSignature`: as mesmas regras do turno do chat. `correctedSignature` só vem com erros.
- `completedTasks`: todas as tarefas cumpridas até agora, pela posição. `newlyCompletedTasks`: as que este turno cumpriu.
- `remainingMessages`: mensagens do aluno que ainda cabem nesta simulação.
- `status`: `IN_PROGRESS`, `COMPLETED` (todas as tarefas cumpridas) ou `NOT_COMPLETED` (acabaram as mensagens).
- `feedback`: com `status` diferente de `IN_PROGRESS`, um texto curto sobre a simulação, no idioma da explicação. Vem `""` em andamento e pode vir `""` também no fim, se o modelo não o escreveu.
- No turno que fecha a simulação, `suggestion` vem `""`, e `reply` costuma ser a despedida da personagem.
- Erros:
  - 400 com o corpo fora do formato ou mensagem longa demais (os mesmos códigos do chat: `MESSAGE_TOO_LONG`, `CONVERSATION_TOO_LONG`);
  - 401 sem token;
  - 404 para simulação que não existe ou é de outro aluno;
  - 409 com `{ error, code: "SIMULATION_FINISHED" }` (`Esta simulação já terminou.`) para simulação que não está em andamento, que ficou parada mais de 2 horas ou cujo cenário saiu do Dato;
  - 409 com `{ error, code: "SIMULATION_BUSY" }` (`Espere a resposta anterior.`) quando outro turno da mesma simulação chegou antes;
  - 429 com `RATE_LIMIT` ou `MONTHLY_LIMIT`, como no chat;
  - 500 (`Erro ao responder. Tente novamente.`). O turno que falhou não conta.
