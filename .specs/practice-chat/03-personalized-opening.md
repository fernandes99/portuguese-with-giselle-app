# 03. Abertura personalizada

- **Status:** em andamento (falta o teste no aparelho)
- **Depende de:** [02-chat-screen.md](02-chat-screen.md) e a rota `POST /api/mobile/practice/opening` no ar (fase `03-opening` do site)

## Contexto

O chat abre com uma mensagem fixa, escrita em `src/utils/practice.ts`: "Olá, {nome}! Sou a Professora Gisa... no que você trabalha ou estuda?". É sempre a mesma, para qualquer nível e qualquer aluno.

O backend passou a gerar a abertura. Ele sorteia um assunto entre os temas e o objetivo do aluno e devolve a fala da Gisa no nível dele, com a tradução no idioma nativo (espanhol ou inglês). Nas respostas seguintes, a Gisa também passou a falar no nível do aluno e a explicar no idioma nativo, sem mudança no formato da rota do turno.

Esta fase troca a abertura fixa pela da rota nova. A abertura fixa continua no app, como reserva para quando a rota falhar.

## Escopo

- Chamada à rota da abertura ao abrir o chat e ao recomeçar a conversa.
- Estado de espera da abertura.
- A abertura fixa como reserva em caso de falha.

## Fora do escopo

- Mudanças no cartão de correção e no balão: os textos de `explanation` e `replyTranslation` só mudam de idioma.
- Escolher o assunto da conversa na tela.
- Mostrar o nível ou os temas do aluno no chat.

## Requisitos

- **RF-01:** Ao abrir o chat, o app chama `POST /api/mobile/practice/opening`. Enquanto espera, a lista mostra só o balão da Gisa com o indicador de digitação (o mesmo de RF-07 da fase 02), e o campo de envio fica desabilitado.
- **RF-02:** Com a resposta, `reply` entra como a primeira mensagem da Gisa, com `replyTranslation` como tradução. Tradução vazia: o balão fica sem o botão de traduzir.
- **RF-03:** Se a chamada falhar por rede, `400` ou `500`, a abertura fixa entra no lugar, com a tradução fixa em inglês. Nenhum aviso de erro aparece: o aluno pode conversar normalmente.
- **RF-04:** Se a chamada responder `403`, a tela mostra o bloqueio de assinante, como quando a rota do turno responde `403`.
- **RF-05:** Recomeçar a conversa apaga as mensagens e pede uma abertura nova à rota, com o mesmo comportamento de RF-01 a RF-04. A pergunta de confirmação continua igual.
- **RF-06:** Uma abertura que chega depois de o aluno recomeçar a conversa ou sair da tela é descartada.
- **RF-07:** O botão de recomeçar não pede confirmação enquanto só há a abertura ou enquanto ela ainda carrega (é o `isEmpty` de hoje).
- **RF-08:** A conversa enviada à rota do turno continua começando pela abertura que está na tela, seja a gerada, seja a fixa.

## Critérios de aceite

- [ ] Abrir o chat mostra a Gisa digitando e, em seguida, uma abertura com o nome do aluno sobre um dos temas dele.
- [ ] Recomeçar algumas vezes traz aberturas sobre assuntos diferentes.
- [ ] Um aluno com idioma espanhol vê a tradução da abertura e das respostas em espanhol.
- [ ] Com o celular sem internet ao abrir o chat, aparece a abertura fixa; com a internet de volta, a conversa segue normalmente.
- [ ] Enquanto a abertura carrega, não dá para enviar mensagem.
- [ ] Recomeçar enquanto a abertura carrega não mostra duas aberturas.
- [ ] Uma conta gratuita continua vendo o bloqueio de assinante.

## Desenho técnico

**Alterar**

- `src/constants/config.ts`: `API_ROUTES.practiceOpening` (`/api/mobile/practice/opening`).
- `src/services/practice.ts`: tipo `PracticeOpening` (`reply`, `replyTranslation`) e `startPracticeChat(token)`.
- `src/hooks/usePracticeChat.ts`:
  - começa sem mensagens e com `isOpening` verdadeiro;
  - um efeito chama `startPracticeChat` ao montar;
  - `restart` incrementa `conversation`, limpa as mensagens e chama de novo.
  - O guarda `conversation` que já existe descarta a resposta de uma conversa anterior (RF-06).
  - A falha usa `getOpeningMessage` e `getOpeningTranslation` (RF-03).
  - O `403` liga `isBlocked` (RF-04).
  - `hasFailed` e `last` passam a tratar a lista vazia.
- `src/app/(app)/practice/chat.tsx`: mostra o indicador de digitação também com `isOpening` e desabilita o campo de envio.
- `src/utils/practice.ts`: os comentários de `getOpeningMessage` e `getOpeningTranslation` dizem que são a reserva para quando a rota falha.
- `CLAUDE.md`: a nota do chat diz que a abertura vem do backend, com a fixa de reserva.

Nenhuma biblioteca nova: a fase não exige novo development build.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
```

No aparelho, com uma conta assinante com preferências respondidas, percorrer os critérios de aceite. Para o caso sem internet, ligar o modo avião antes de abrir o chat.

## O que foi conferido

- `yarn lint` e `npx tsc --noEmit` passam.
- A rota da abertura está no backend desde a versão 0.0.19 do site. As aberturas geradas foram conferidas lá (fase `03-opening` do site): 10 de 10 com 3 frases, uma pergunta no fim, o assunto sorteado e a tradução no idioma do aluno.
- Falta percorrer os critérios de aceite no aparelho.

## Divergências

- Conta gratuita não chama a rota da abertura: o hook confere `canUsePractice` antes, e a tela já mostra o bloqueio. O `403` da rota continua tratado (RF-04), para o caso de o plano mudar com a tela aberta.

## Tarefas

- [x] Rota e serviço da abertura.
- [x] `usePracticeChat` com `isOpening`, reserva e descarte.
- [x] Tela do chat com a espera da abertura.
- [x] Atualizar `CLAUDE.md`.
- [ ] Rodar a verificação, marcar as tarefas e atualizar o status aqui e no `README.md`.
