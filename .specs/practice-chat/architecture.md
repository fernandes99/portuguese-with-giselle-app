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
- `remainingToday` (fase 06 do site): quantas mensagens ainda cabem no dia; a abertura também conta.
- Erros: `401`, `403`, `429` e `500`, como na rota do turno.

### Idioma das explicações (fase 06 do site)

- `GET /api/mobile/preferences` traz `preferences.explanationLanguage` (`ENGLISH`, `SPANISH` ou `PORTUGUESE`, já resolvido: o escolhido ou o que segue do idioma nativo) e `options.explanationLanguages`, com `id`, `title`, `emoji` e `description`.
- `PUT /api/mobile/preferences/chat-language`, com `{ "explanationLanguage": "SPANISH" }`, grava só o idioma e responde `{ "explanationLanguage": "SPANISH" }`. Erros: `401`, `400`, `409` e `500`, como a rota do estilo.
- Em `PORTUGUESE`, a explicação sai em português simples e a tradução continua no idioma nativo.

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
  "replyTranslation": "How nice! What do you do at the hospital?",
  "explanationLanguage": null,
  "remainingToday": 42
}
```

- `mistakes`: trechos da mensagem do aluno, como ele escreveu.
- `replyTranslation`: a fala da Gisa traduzida, mostrada só quando o aluno pede.
- `explanation` vem no idioma das explicações do aluno e `replyTranslation` no da tradução. O app mostra os textos como chegam.
- Sem erros: `hasErrors` falso, `explanation` vazia e `mistakes` vazio.
- `explanationLanguage` (fase 06 do site): o idioma que o aluno pediu nesta mensagem, já gravado; `null` sem pedido.
- `remainingToday` (fase 06 do site): quantas mensagens ainda cabem no dia.

Erros, como `{ "error": string }`, alguns com `code`:

| Status | `code`                  | Quando                                                 |
| ------ | ----------------------- | ------------------------------------------------------ |
| 401    |                         | Sessão; o `api` já encerra o login                     |
| 403    |                         | Aluno gratuito                                         |
| 400    |                         | Corpo inválido                                         |
| 400    | `MESSAGE_TOO_LONG`      | Mensagem do aluno com mais de 500 caracteres           |
| 400    | `CONVERSATION_TOO_LONG` | Conversa com mais de 60 mensagens ou 20.000 caracteres |
| 429    | `DAILY_LIMIT`           | 50 mensagens no dia (aberturas contam)                 |
| 429    | `RATE_LIMIT`            | 10 mensagens no último minuto                          |
| 429    | `MONTHLY_LIMIT`         | Teto de custo do mês                                   |
| 500    |                         | Falha do modelo                                        |

Os `429` trazem também `resetAt`, a hora em que o limite zera. O app mostra a mensagem do backend (`error`) como chega.

### Voz, transcrição e dica (fase 07 do site)

A abertura e o turno trazem, todos opcionais (ausentes no backend antigo):

- `suggestion` e `suggestionTranslation`: uma resposta possível do aluno à pergunta da fala, e a tradução. Podem vir vazias.
- `replySignature`: a assinatura de `reply`. No turno, `correctedSignature`, só quando `correction.hasErrors` é verdadeiro: a assinatura de `correction.corrected`.

`POST /api/mobile/practice/speech`, com `{ "text": string, "signature": string }`, devolve `{ "audio": "<MP3 em base64>", "format": "mp3" }`. O texto vai exatamente como veio do backend: é o que a assinatura cobre.

`POST /api/mobile/practice/transcription`, multipart com a gravação no campo `audio` (até 1 MB), devolve `{ "text": string }`, vazio quando não há fala. O app envia o texto pela rota do turno.

| Rota        | Status | `code`                      | Quando                                           |
| ----------- | ------ | --------------------------- | ------------------------------------------------ |
| as duas     | 403    |                             | Aluno gratuito                                   |
| voz         | 400    | `BAD_SIGNATURE`             | Assinatura que não confere                       |
| voz         | 429    | `SPEECH_DAILY_LIMIT`        | 120 falas no dia                                 |
| transcrição | 400    |                             | Sem áudio, mais de 1 MB ou formato fora da lista |
| transcrição | 429    | `TRANSCRIPTION_DAILY_LIMIT` | 50 transcrições no dia                           |
| as duas     | 502    |                             | Falha da ElevenLabs                              |

Os limites de áudio são separados dos do chat: ouvir ou falar não gasta as 50 mensagens do dia.

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
      // Fase 06: assinatura para pedir a voz e a dica de resposta
      signature?: string;
      suggestion?: string;
      suggestionTranslation?: string;
    }
  | {
      id: string;
      role: 'user';
      content: string;
      // transcribing (fase 06): a gravação virando texto, com content vazio;
      // sending: aguardando o backend; failed: o envio falhou
      status: 'transcribing' | 'sending' | 'sent' | 'failed';
      // Preenchida quando o backend responde
      correction?: PracticeCorrection;
      // Fase 06: assinatura da frase corrigida, só com erros
      correctedSignature?: string;
      error?: string;
    }
  | {
      // Aviso do app no meio da conversa (troca de idioma); não vai para o
      // backend
      id: string;
      role: 'notice';
      content: string;
    };
```

- O hook expõe `messages`, `isReplying`, `send(text)`, `retry()` e `restart()`.
- Até a fase 02, o hook começava com a abertura fixa. Da fase 03 em diante, começa vazio, com `isOpening`, e pede a abertura ao backend ao montar e a cada `restart`. Se o pedido falhar, usa a abertura fixa.
- `send` acrescenta a mensagem do aluno como `sending`, chama o serviço com a conversa e, na resposta, grava a correção nela e acrescenta a fala da Gisa.
- Só uma mensagem fica pendente por vez: enquanto `isReplying`, a tela não envia outra.
- Uma mensagem `failed` não entra na conversa enviada ao backend, a não ser no `retry` dela mesma.
- Fase 06: `sendVoice(uri)` acrescenta a mensagem `transcribing`, transcreve e segue como `send`; vazia ou com falha, a mensagem sai e o hook devolve o aviso para a tela. `redo()` tira a última resposta do aluno com erros e a fala da Gisa a ela, mantendo os avisos, e devolve o texto tirado. `lastSuggestion` é a dica da última fala da Gisa, quando ela é a última da conversa.
- Fase 06: a voz fica em `useGisaVoice`, fora do hook da conversa. Cada fala é baixada uma vez, gravada no cache e tocada de novo dali; cada pedido novo, e cada `stop()`, descarta o que ainda estava chegando. A tela chama `stop()` ao gravar, recomeçar, trocar o estilo e no "Tentar de novo".
- Fase 05: o hook guarda `remainingToday` da última resposta e `limit`. `limit` é `blocked` (`DAILY_LIMIT` ou `MONTHLY_LIMIT`, até sair do chat) ou `restart` (`CONVERSATION_TOO_LONG`, até recomeçar); com ele, a tela troca o campo de mensagem por um aviso. `RATE_LIMIT` é uma falha comum, com "Tentar de novo".

## Arquivos

| Arquivo                                                                   | Papel                                                              | Fase |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---- |
| `src/app/(app)/(tabs)/practice.tsx`                                       | Aba Praticar                                                       | 01   |
| `src/app/(app)/courses.tsx`                                               | Lista de cursos, movida de `(tabs)/courses.tsx`                    | 01   |
| `src/utils/practice.ts`                                                   | Regra de assinante, texto da abertura e divisão do texto em grifos | 01   |
| `src/app/(app)/practice/chat.tsx`                                         | Tela do chat                                                       | 02   |
| `src/services/practice.ts`                                                | Chamada à rota e tipos do contrato                                 | 02   |
| `src/hooks/usePracticeChat.ts`                                            | Estado da conversa                                                 | 02   |
| `src/components/practice/`                                                | Balões, cartão de correção, campo de envio, indicador de digitação | 02   |
| `src/services/practice.ts`                                                | Chamada à rota da abertura (`startPracticeChat`)                   | 03   |
| `src/hooks/usePracticeChat.ts`                                            | Abertura pelo backend, com a fixa de reserva                       | 03   |
| `src/app/(app)/practice/style.tsx`                                        | Troca do estilo da Gisa                                            | 04   |
| `src/components/practice/ChatStyleSelector.tsx` e `StyleCard.tsx`         | Escolha do estilo, na primeira vez no chat e na troca              | 04   |
| `src/app/(app)/practice/language.tsx` e `ExplanationLanguageSelector.tsx` | Escolha do idioma das explicações                                  | 05   |
| `src/components/practice/ChatNotice.tsx`                                  | Aviso de IA, aviso de troca de idioma e aviso no lugar do campo    | 05   |
| `assets/gisa-avatar.png` e `src/components/practice/GisaAvatar.tsx`       | Foto da Gisa                                                       | 06   |
| `src/hooks/useGisaVoice.ts` e `src/components/practice/ListenButton.tsx`  | Voz das falas e botão de ouvir                                     | 06   |
| `src/hooks/useHoldToTalk.ts`                                              | Gravador de segurar para falar, também usado pela pronúncia        | 06   |
| `src/components/practice/ChatVoiceBar.tsx` e `HintCard.tsx`               | Barra do microfone e dica de resposta                              | 06   |
| `src/components/practice/ChatSettingsSheet.tsx`                           | Folha de configurações (voz automática, idioma, estilo, recomeçar) | 06   |
| `src/utils/diffWords.ts`                                                  | Comparação da frase do aluno com a corrigida, para o cartão        | 06   |

## Reaproveitado sem alterar

- `api` e `getErrorMessage` (`src/lib/api.ts`). `ApiError` ganhou `code` na fase 05.
- `useAuth` (`src/contexts/AuthContext.tsx`) e `getFirstName` (`src/utils/format.ts`).
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), o cabeçalho com botão de voltar. Ganhou a prop `avatar` na fase 06.
- `Button` (`src/components/Button.tsx`) e `colors` (`src/constants/theme.ts`).

## Padrões visuais

- Textos em português, fonte Poppins, cores do tema.
- Cartões e balões separados por borda ou cor de fundo, sem sombra pequena.
