# 02. Apresentação, conversa e resumo

- **Status:** rascunho
- **Depende de:** [01](01-simulations-list.md); fase 02 de `.specs/simulations/` do site no ar

## Contexto

A lista já abre `practice/simulations/[id]` (fase 01). Falta a simulação em si: a apresentação do cenário, a conversa com a personagem e as tarefas, e o resumo do fim. O estado, os componentes e o contrato estão no [architecture.md](architecture.md).

## Escopo

- A apresentação, com as tarefas e "Começar".
- A conversa, com a faixa das tarefas, a correção, a dica, a voz e o microfone.
- O aviso ao sair no meio.
- O resumo do fim, com "Tentar de novo".

## Fora do escopo

- Retomar a simulação depois de sair.
- A folha de configurações do chat (estilo, idioma, "Seu uso hoje"): a simulação não tem engrenagem.

## Requisitos

### Apresentação

- **RF-01:** mostra o emoji grande, o título, a descrição e "Suas tarefas", com as tarefas numa lista de marcadores vazios. O nível aparece abaixo do título.
- **RF-02:** o botão "Começar" chama `startSimulation`. Enquanto espera, o botão mostra "Preparando..." e fica desligado.
- **RF-03:** com `remainingToday` 0 na lista, ou com `429` `SIMULATION_DAILY_LIMIT` ao começar, a apresentação troca o botão pela mensagem do limite e "Os limites voltam à meia-noite (horário de Brasília)." Os outros erros aparecem acima do botão, que continua ativo para tentar de novo.
- **RF-04:** `403` `SIMULATION_LOCKED` leva à tela de planos.

### Conversa

- **RF-05:** a conversa usa os balões do chat: a personagem com `SimulationAvatar` (o emoji), o aluno com o balão verde e o cartão de correção sob cada mensagem dele, a tradução e a frase corrigida em voz, como no chat.
- **RF-06:** o cabeçalho tem o título do cenário e o botão de voltar.
- **RF-07:** abaixo do cabeçalho, a faixa das tarefas (`TaskStrip`) mostra "Tarefas {cumpridas}/{total}" e uma barra de progresso. O toque abre a lista das tarefas, cada uma com o marcador vazio ou o visto verde; outro toque recolhe.
- **RF-08:** quando um turno cumpre uma tarefa (`newlyCompletedTasks`), a faixa abre sozinha mostrando a tarefa com o visto e recolhe em 3 segundos. Duas no mesmo turno aparecem juntas. O leitor de tela anuncia "Tarefa cumprida: {tarefa}".
- **RF-09:** com `remainingMessages` 3 ou menos, uma linha acima do campo de envio diz "Restam {n} mensagens" ("Resta 1 mensagem").
- **RF-10:** a dica "O que eu deveria dizer?" (`HintCard`) usa a `suggestion` da última fala da personagem.
- **RF-11:** no Premium, a voz e o microfone funcionam como no chat: a fala toca sozinha se a voz automática estiver ligada (`getChatAutoplay`), com o destaque da palavra, e o aluno responde segurando o microfone. O limite da voz mostra o aviso do chat na conversa.
- **RF-12:** no gratuito, os balões não têm o botão de ouvir e o lugar do microfone mostra a etiqueta Premium, que leva à tela de planos. O campo de texto funciona.
- **RF-13:** a falha no envio deixa a mensagem com "Tentar de novo", como no chat. `429` `RATE_LIMIT` mostra a mensagem do backend na própria mensagem.
- **RF-14:** `409` `SIMULATION_FINISHED` e `429` `MONTHLY_LIMIT` levam ao resumo com o que o app tem, e a mensagem do backend aparece no topo do resumo.

### Saída

- **RF-15:** o botão de voltar e o gesto de voltar, com a conversa em andamento (depois de "Começar" e antes do fim), abrem a confirmação "Sair da simulação?", com o texto "A conversa não é salva, e esta simulação conta como uma das de hoje." e os botões "Continuar" e "Sair".
- **RF-16:** "Sair" interrompe a voz da personagem (como o chat faz ao perder o foco) e volta para a lista, que se atualiza.
- **RF-17:** na apresentação e no resumo, voltar não pede confirmação.

### Resumo

- **RF-18:** quando o turno fecha a simulação, a fala da personagem entra na conversa e, depois de tocar (ou em 1,5 segundo, sem voz), a tela mostra o resumo no lugar da conversa.
- **RF-19:** com `COMPLETED`, o resumo abre com "Simulação concluída!" e o emoji do cenário. Com `NOT_COMPLETED`, com "Quase lá!" e o texto "Suas mensagens desta simulação acabaram."
- **RF-20:** em seguida, o `feedback` (quando vier), as tarefas com o visto ou o marcador vazio, e "Frases para revisar": cada mensagem do aluno com erro, com a frase riscada e a corrigida, como no cartão de correção. Sem erros, essa parte diz "Nenhuma correção. Muito bem!"
- **RF-21:** os botões "Tentar de novo", que volta à apresentação do mesmo cenário (e gasta uma das do dia ao tocar em "Começar"), e "Outras simulações", que volta à lista.

## Critérios de aceite

- [ ] "Pedir café" mostra a apresentação com as três tarefas; "Começar" abre a conversa com a atendente falando primeiro.
- [ ] Pedir o cappuccino marca a tarefa 1: a faixa abre, mostra o visto e recolhe.
- [ ] Uma frase com erro mostra o cartão de correção, como no chat.
- [ ] Cumpridas as três tarefas, a despedida toca e o resumo mostra "Simulação concluída!", o comentário e as frases corrigidas.
- [ ] Na 10ª mensagem, aparece "Restam 3 mensagens"; na 12ª sem cumprir tudo, o resumo mostra "Quase lá!".
- [ ] Voltar no meio pede confirmação; "Sair" para a voz e volta para a lista com "Restam" diminuído.
- [ ] A 4ª simulação do dia (Premium) mostra o aviso do limite na apresentação.
- [ ] Com conta gratuita, num cenário liberado, a conversa funciona por texto, sem botão de ouvir e com a etiqueta Premium no lugar do microfone.
- [ ] O chat com IA continua igual, com a foto da Gisa.

## Desenho técnico

- `src/app/(app)/practice/simulations/[id].tsx`: as fases de `useSimulation` (apresentação, conversa, resumo), no layout de `src/app/(app)/practice/chat.tsx` (`KeyboardAvoidingView`, lista de mensagens, campo de envio). A confirmação de saída usa `usePreventRemove`, de `expo-router/react-navigation` (vem com o expo-router, sem dependência nova), e `Alert`. Ele pega o botão de voltar, o gesto e o voltar do Android.
- `src/hooks/useSimulation.ts` (novo): o estado do `architecture.md`.
- `src/services/simulations.ts`: `startSimulation` e `sendSimulationTurn`, e os códigos de erro (`SIMULATION_ERROR_CODES`).
- `src/components/simulations/`: `SimulationAvatar`, `SimulationIntro`, `TaskStrip` e `SimulationSummary`.
- `src/components/practice/ChatBubble.tsx`: `GisaMessage` ganha a prop opcional `avatar`, que substitui a foto da Gisa e o anel de fala; sem ela, nada muda.
- Reaproveita `CorrectionCard`, `HintCard`, `ChatVoiceBar`, `ListenButton`, `useGisaVoice`, `useHoldToTalk`, `buildPracticePayload`, `diffWords` e `PremiumBadge`.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- Teste com o Node (fora do repositório, como os do chat) da montagem das "Frases para revisar" a partir das mensagens.
- No aparelho, com o build preview e o backend no ar, os critérios de aceite um a um, com uma conta Premium e uma gratuita, e um teste sem internet no meio da conversa.

## Tarefas

- [ ] `startSimulation`, `sendSimulationTurn` e `useSimulation`.
- [ ] Prop `avatar` em `GisaMessage` e `SimulationAvatar`.
- [ ] `SimulationIntro` e os estados de erro e limite.
- [ ] A conversa, com `TaskStrip`, "Restam N mensagens", voz e microfone.
- [ ] A confirmação de saída.
- [ ] `SimulationSummary` e "Tentar de novo".
- [ ] Documentação (`CLAUDE.md`), status desta spec e a tabela do README.
