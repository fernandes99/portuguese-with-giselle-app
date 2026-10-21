# 04. Gisa como IA e escolha de estilo

- **Status:** concluída
- **Depende de:** [03-personalized-opening.md](03-personalized-opening.md) e a fase `05-chat-style` do site no ar

## Contexto

O chat chama a Gisa de "Professora Gisa". O dono do projeto quer deixar claro que ela é uma parceira de conversação com inteligência artificial e deixar o aluno escolher o estilo dela: Amigável, Tutora, Brasileira ou Tranquila. O backend guarda a escolha nas preferências, devolve a lista dos estilos e aplica o estilo na abertura e nas respostas (fase `05-chat-style` do site).

Esta fase sai junto com a fase 03, numa versão só do app.

## Escopo

- Textos da persona: título, subtítulo, cartão da aba Praticar e abertura de reserva.
- Tela de escolha do estilo.
- Escolha obrigatória na primeira vez que o aluno abre o chat.
- Troca do estilo pelo cabeçalho do chat e pelo Perfil.

## Fora do escopo

- Mudanças na correção ou nos balões.
- Escolher o estilo nas boas-vindas do app.

## Requisitos

### Persona

- **RF-01:** O cabeçalho do chat tem o título "Gisa" e, abaixo, o subtítulo "Parceira de conversação com IA".
- **RF-02:** O cartão "Chat com IA" da aba Praticar diz "Converse com a Gisa, sua parceira de conversação com IA, e receba correções a cada frase." O bloqueio de assinante usa o mesmo nome.
- **RF-03:** A abertura de reserva passa a ser: "Oi, {nome}! Eu sou a Gisa, sua parceira de conversação com IA aqui no Portuguese with Giselle. Me conta um pouco de você: no que você trabalha ou estuda?" (sem nome: "Oi! Eu sou a Gisa, ..."), com a tradução em inglês.

### Tela de escolha

- **RF-04:** A tela "Como você quer que a Gisa seja?" mostra um cartão por estilo, com o emoji, o título, a descrição e a frase de exemplo entre aspas, na ordem que o backend manda (`options.chatStyles` de `GET /api/mobile/preferences`). O estilo atual vem marcado.
- **RF-05:** O botão fica desabilitado até haver um estilo marcado. O texto é "Começar" na primeira escolha e "Salvar" depois.
- **RF-06:** Salvar chama `PUT /api/mobile/preferences/chat-style` e passa o estilo para a sessão (`updateUser({ chatStyle })`). Falha mostra a mensagem do erro e mantém a tela.
- **RF-07:** Falha ao carregar a lista mostra o erro com "Tentar de novo".

### Primeira vez e troca

- **RF-08:** Com `user.chatStyle` igual a `null`, o chat mostra a tela de escolha no lugar da conversa, sem pedir a abertura. Depois de salvar, a abertura é pedida já no estilo escolhido. `chatStyle` ausente na sessão (backend antigo) conta como escolhido.
- **RF-09:** O cabeçalho do chat ganha um botão de estilo (ícone `color-palette-outline`, `accessibilityLabel` "Estilo da Gisa"), ao lado do de recomeçar. Ele abre a tela de escolha. Com mensagens do aluno na conversa, antes ele pergunta: "Trocar o estilo recomeça a conversa. Continuar?".
- **RF-10:** Quando o estilo da sessão muda, o chat recomeça a conversa e pede uma abertura nova. Voltar da tela sem salvar não muda nada.
- **RF-11:** O Perfil ganha a linha "Estilo da Gisa", depois de "Minhas preferências", que abre a mesma tela.

## Critérios de aceite

- [x] Na primeira vez no chat, aparece a escolha; depois de "Começar", a Gisa abre a conversa dizendo que é uma IA.
- [x] Abrir o chat de novo não mostra a escolha.
- [x] Trocar o estilo pelo cabeçalho, com conversa em andamento, pede confirmação e recomeça com uma abertura no estilo novo.
- [x] Trocar o estilo pelo Perfil e abrir o chat traz a abertura no estilo novo.
- [x] O título do chat é "Gisa", com o subtítulo "Parceira de conversação com IA".
- [x] Sem internet ao salvar, aparece o erro e a tela continua.

## Desenho técnico

**Criar**

- `src/components/practice/ChatStyleSelector.tsx`: carrega as opções, mostra os cartões e salva. Recebe `mode` (`first` ou `edit`) e `onDone`.
- `src/components/practice/StyleCard.tsx`: cartão de opção com emoji, título, descrição e exemplo, com o `RadioMark` de `src/components/preferences/ChoiceCard.tsx`.
- `src/app/(app)/practice/style.tsx`: a tela de escolha aberta pelo chat e pelo Perfil, com `LessonHeader`.

**Alterar**

- `src/services/auth.ts`: `chatStyle?: ChatStyle | null` em `User`.
- `src/services/preferences.ts`: `ChatStyle`, `ChatStyleOption`, `chatStyle` em `Preferences`, `chatStyles` nas opções e `saveChatStyle(token, chatStyle)`.
- `src/constants/config.ts`: `API_ROUTES.chatStyle`.
- `src/components/lesson/ClassicLesson.tsx`: `subtitle` opcional em `LessonHeader`.
- `src/hooks/usePracticeChat.ts`: a abertura é pedida quando há estilo na sessão e de novo quando ele muda.
- `src/app/(app)/practice/chat.tsx`: título, subtítulo, escolha na primeira vez e botão de estilo.
- `src/app/(app)/(tabs)/practice.tsx` e `src/utils/practice.ts`: textos da persona.
- `src/app/(app)/(tabs)/profile.tsx`: linha "Estilo da Gisa".
- `CLAUDE.md`, `README.md` e `architecture.md` da iniciativa.

Nenhuma biblioteca nova.

## Verificação

```bash
yarn lint
npx tsc --noEmit
```

No aparelho, com uma conta assinante que nunca escolheu estilo, percorrer os critérios de aceite.

## O que foi conferido

- `yarn lint` e `npx tsc --noEmit` passam.
- A persona e os estilos foram conferidos no backend (fase `05-chat-style` do site): a Gisa diz que é uma IA, e cada estilo se apresenta de um jeito.
- O dono do projeto considerou esta fase feita em 15/10/2026, sem o teste no aparelho; os critérios de aceite ficam marcados.

## Divergências

- **RF-11 desfeito** (pedido depois da entrega): a linha "Estilo da Gisa" saiu do Perfil. O estilo agora só se troca pelas configurações do chat.
- A tela de escolha não usa o balão com a foto da professora (`TeacherPrompt`) das boas-vindas: a pergunta vira um título, com o texto "A Gisa é uma IA que conversa com você em português...", para não misturar a professora com a IA.
- `chatStyle` ausente na sessão (backend antigo) faz o chat abrir direto, com a abertura do backend, como na fase 03.

## Tarefas

- [x] Tipos, serviço e rota do estilo.
- [x] `StyleCard`, `ChatStyleSelector` e a tela `practice/style`.
- [x] Chat: persona, primeira escolha, botão de estilo e recomeço ao trocar.
- [x] Textos da aba Praticar e da abertura de reserva, e a linha no Perfil.
- [x] Atualizar `CLAUDE.md`, `README.md` e `architecture.md`.
- [x] Rodar a verificação, marcar as tarefas e atualizar o status aqui e no `README.md`.
