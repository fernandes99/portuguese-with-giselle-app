# 02. Tela do chat

- **Status:** em andamento
- **Depende de:** `01-practice-tab` e a rota `POST /api/mobile/practice/chat` no ar (fase `01-chat-api` do site)

## Contexto

A fase 01 deixou a aba Praticar e uma tela provisória em `/practice/chat`. Esta fase troca a tela provisória pelo chat com a Professora Gisa. O contrato da rota e o estado da conversa estão em `architecture.md`.

## Escopo

- Tela do chat: cabeçalho, lista de mensagens e campo de envio.
- Abertura fixa da Gisa.
- Envio da conversa ao backend, cartão de correção e resposta da Gisa.
- Estados de espera, de erro e de conta gratuita.
- Recomeçar a conversa.

## Fora do escopo

- Voz, áudio e botões de traduzir ou ouvir a mensagem.
- Salvar ou retomar a conversa.
- Limite de tamanho da mensagem.
- Aberturas variadas.

## Requisitos

- **RF-01:** O cabeçalho tem o botão de voltar, o título "Professora Gisa" e, à direita, um botão de recomeçar a conversa (ícone `refresh`, `accessibilityLabel="Recomeçar conversa"`).
- **RF-02:** Ao abrir, o chat mostra uma mensagem da Gisa: "Olá, {nome}! Sou a Professora Gisa, e vamos usar esse chat para conversar e treinar seu Português. Me fala, {nome}, no que você trabalha ou estuda?", com o primeiro nome do aluno. Sem nome na conta, o texto é "Olá! Sou a Professora Gisa, e vamos usar esse chat para conversar e treinar seu Português. Me fala, no que você trabalha ou estuda?". Nenhuma chamada ao backend acontece nesse momento.
- **RF-03:** As mensagens da Gisa ficam à esquerda, num balão verde com texto branco, com um avatar com a letra "G" ao lado. As do aluno ficam à direita, num balão branco com borda cinza.
- **RF-03a:** O balão da Gisa tem, embaixo do texto, um botão com ícone de tradução (`accessibilityLabel` "Traduzir" ou "Esconder tradução"). A tradução em inglês só aparece depois do toque, abaixo do texto e dentro do mesmo balão; outro toque a esconde. A tradução das respostas vem do backend (`replyTranslation`); a da abertura é fixa no app. Sem tradução, o botão não aparece. (Pedido do dono do projeto, depois da primeira implementação.)
- **RF-04:** O campo de envio fica fixo embaixo, acima do teclado e da área segura, com o texto de ajuda "Escreva em português..." e um botão de enviar. O campo cresce até quatro linhas e depois rola.
- **RF-05:** O botão de enviar fica desabilitado com o campo vazio (só espaços conta como vazio) e enquanto a Gisa responde.
- **RF-06:** Enviar acrescenta a mensagem do aluno à conversa, limpa o campo e rola a lista até o fim.
- **RF-07:** Enquanto o backend não responde, aparece no fim da lista um balão da Gisa com o indicador de digitação (três pontos animados; com "reduzir movimento" ativo, o texto "Digitando...").
- **RF-08:** Quando a resposta chega com `hasErrors` verdadeiro, os trechos de `mistakes` encontrados na mensagem do aluno ficam grifados no balão dele (fundo vermelho claro e sublinhado). Trecho não encontrado é ignorado; a comparação não diferencia maiúsculas de minúsculas.
- **RF-09:** Com `hasErrors` verdadeiro, aparece sob o balão do aluno um cartão de correção, branco com borda, com o rótulo "Correção", a frase de `corrected` em verde e, abaixo, o texto de `explanation` em cinza.
- **RF-10:** Com `hasErrors` falso, aparece sob o balão do aluno só uma linha discreta, com um check verde e "Muito bem!".
- **RF-11:** Depois da correção, a fala da Gisa (`reply`) entra como um balão novo e a lista rola até o fim.
- **RF-12:** Se o envio falhar (sem conexão, `400` ou `500`), a mensagem do aluno continua na tela, marcada com "Não foi possível enviar." e a ação "Tentar de novo", que reenvia a mesma mensagem. O texto do erro vem de `getErrorMessage`.
- **RF-13:** Enquanto houver uma mensagem com falha, o campo de envio fica desabilitado; o aluno tenta de novo ou recomeça a conversa.
- **RF-14:** O botão de recomeçar abre a confirmação "Recomeçar a conversa?" com o texto "As mensagens desta conversa serão apagadas." e as ações "Cancelar" e "Recomeçar". Recomeçar volta ao estado do RF-02. Com a conversa só na abertura, o botão não faz nada.
- **RF-15:** Sair do chat (botão ou voltar do aparelho) não pede confirmação. Ao reabrir, a conversa começa de novo.
- **RF-16:** O aluno gratuito que chegar à tela, ou qualquer resposta `403` do backend, vê no lugar do chat o cadeado, "Exclusivo para assinantes" e "O chat com IA está disponível apenas para assinantes.", com o cabeçalho de voltar.
- **RF-17:** O app envia ao backend a conversa inteira, no formato de `architecture.md`: a abertura como primeira mensagem `assistant`, as mensagens do aluno já respondidas, as falas da Gisa só com o texto, e a mensagem nova por último.

## Critérios de aceite

- [ ] Abrir o chat mostra a abertura com o primeiro nome do aluno, sem chamada de rede.
- [ ] Enviar "Eu trabalho em uma hospital." mostra o indicador de digitação e, depois, o trecho errado grifado, o cartão com "um hospital" e a explicação em inglês, e um balão da Gisa terminando em pergunta.
- [ ] Enviar uma frase correta mostra "Muito bem!" e a resposta da Gisa, sem cartão.
- [ ] Não dá para enviar com o campo vazio nem enquanto a Gisa responde.
- [ ] Em modo avião, a mensagem fica com "Tentar de novo"; ao voltar a conexão, tentar de novo conclui o turno.
- [ ] Depois de quatro turnos, a lista rola e a última mensagem fica visível acima do campo, com o teclado aberto e fechado.
- [ ] Recomeçar apaga a conversa e mostra só a abertura.
- [ ] Sair e voltar ao chat mostra só a abertura.
- [ ] Conta gratuita vê a tela de "Exclusivo para assinantes".

## Desenho técnico

**Criar**

- `src/services/practice.ts`: tipos `PracticeCorrection` e `PracticeTurn` e `sendPracticeMessage(token, messages)`, com `api` (`src/lib/api.ts`), no formato de `src/services/discussions.ts`.
- `src/hooks/usePracticeChat.ts`: o estado descrito em `architecture.md`.
- `src/components/practice/ChatBubble.tsx`: balão da Gisa e do aluno, com o grifo dos erros.
- `src/components/practice/CorrectionCard.tsx`: cartão de correção e a linha de "Muito bem!".
- `src/components/practice/ChatComposer.tsx`: campo e botão de enviar.
- `src/components/practice/TypingIndicator.tsx`: três pontos com `react-native-reanimated` e `useReducedMotion`.

**Alterar**

- `src/app/(app)/practice/chat.tsx`: sai a tela provisória, entra o chat.
- `src/constants/config.ts`: `practiceChat: '/api/mobile/practice/chat'` em `API_ROUTES`.
- `src/utils/practice.ts`: `getOpeningMessage(name)` e `splitByMistakes(text, mistakes)`, que devolve o texto em partes marcadas como erro ou não.
- `CLAUDE.md`: a tela do chat e a rota que ela usa.

**Notas**

- Lista com `FlatList`; a rolagem até o fim acontece quando o número de mensagens muda.
- Teclado: `KeyboardAvoidingView` em volta da lista e do campo, com comportamento por plataforma. Confira nos dois sistemas se o campo não fica coberto.
- `splitByMistakes` procura cada trecho na ordem em que aparece e não grifa a mesma parte duas vezes.
- O balão do aluno com erro tem `accessibilityLabel` que cita a correção, para o leitor de tela não depender do grifo.
- O token vem de `useAuth()`, como nos outros hooks (`src/hooks/useDiscussions.ts`).

**Divergências na implementação**

- A mensagem com falha guarda o texto do erro (campo `error` em `ChatMessage`), para o RF-12 mostrar o motivo vindo de `getErrorMessage`.
- O hook expõe também `isBlocked` (o backend respondeu `403`), `hasFailed` e `isEmpty`, que a tela usa nos RF-13, RF-14 e RF-16.
- O `KeyboardAvoidingView` usa `padding` no iOS e nenhum comportamento no Android, como `src/components/AuthScreen.tsx`. Falta conferir no aparelho.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend da fase `01-chat-api` no ar: percorrer os critérios de aceite com uma conta assinante e uma gratuita. Cada turno gasta créditos da API.

## Tarefas

- [x] `API_ROUTES.practiceChat` e `src/services/practice.ts`.
- [x] `getOpeningMessage` e `splitByMistakes`.
- [x] `usePracticeChat`.
- [x] `ChatBubble`, `CorrectionCard`, `TypingIndicator` e `ChatComposer`.
- [x] Tela do chat, com teclado e rolagem.
- [x] Falha de envio com "Tentar de novo".
- [x] Recomeçar conversa.
- [x] Estado de conta gratuita e tratamento do `403`.
- [x] Atualizar o `CLAUDE.md`.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
