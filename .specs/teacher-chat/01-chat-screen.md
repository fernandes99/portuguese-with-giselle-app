# 01. Tela do chat com a professora

- **Status:** em andamento
- **Depende de:** fase `01-chat-api` do site no ar

## Contexto

O Perfil (`src/app/(app)/(tabs)/profile.tsx`) tem "Meus cursos" e "Histórico". Esta fase acrescenta "Falar com a professora" e a tela da conversa. O contrato das rotas está no [README.md](README.md). O chat com IA (`src/app/(app)/practice/chat.tsx`) é a referência de layout: cabeçalho de voltar, lista de mensagens e campo fixo no rodapé.

## Escopo

- Linha "Falar com a professora" no Perfil, com o contador de não lidas.
- Marcador na aba Perfil quando há mensagem não lida.
- Tela `teacher-chat`: mensagens, envio, falha, mensagens anteriores e atualização.
- Estado bloqueado para quem não é assinante.

## Fora do escopo

- Notificações.
- Anexos, editar e apagar.
- Mudanças no chat com IA.

## Requisitos

**Entrada**

- **RF-01:** O Perfil ganha a linha "Falar com a professora", acima de "Meus cursos", com o ícone `chatbubble-ellipses-outline`. Ela aparece para qualquer conta.
- **RF-02:** Quando há mensagens não lidas, a linha mostra a quantidade num círculo verde, antes da seta. Acima de 9, mostra "9+".
- **RF-03:** Quando há mensagens não lidas, a aba Perfil mostra o marcador da barra de abas (`tabBarBadge`) com a mesma quantidade.
- **RF-04:** A quantidade vem de `GET /api/mobile/teacher-chat/unread` e é buscada quando as abas abrem, quando o app volta ao primeiro plano e quando o Perfil ganha foco. Falha nessa busca não mostra erro: o contador fica como estava.

**Bloqueio**

- **RF-05:** Para a role `FREE_STUDENT`, a tela mostra o cabeçalho, um cadeado, "Exclusivo para assinantes" e "O chat com a professora está disponível apenas para assinantes.", sem campo de mensagem, e não chama as rotas da conversa. Qualquer outra role usa o chat.
- **RF-06:** Se o backend responde `403` (a assinatura acabou com o app aberto), a tela passa para o mesmo estado.

**Conversa**

- **RF-07:** A tela tem um cabeçalho próprio, com o botão de voltar, a foto da professora, o nome "Professora Giselle" e "Sua professora" embaixo.
- **RF-08:** As mensagens aparecem em ordem crescente: as do aluno à direita, em verde, e as da professora à esquerda, em branco com borda e com a foto dela ao lado. A tela abre rolada na última.
- **RF-09:** Cada mensagem mostra o horário no fuso do aparelho (`HH:mm`). Um separador com a data abre cada dia: "Hoje", "Ontem" ou a data por extenso curta ("12 de out.").
- **RF-10:** Sem mensagens, a tela mostra a foto da professora e "Mande uma mensagem para a professora Giselle. Ela responde por aqui."
- **RF-11:** Enquanto a primeira carga não termina, a tela mostra o indicador de carregamento. Se ela falha, mostra a mensagem de erro e "Tentar de novo".
- **RF-12:** Quando `hasMore` é verdadeiro, o topo da lista tem "Ver mensagens anteriores", que busca as 50 anteriores (`?before=<id da mais antiga>`) e as coloca no começo, sem mudar a posição de leitura.

**Envio**

- **RF-13:** O campo de mensagem fica no rodapé, com o texto de ajuda "Escreva sua mensagem...". O botão de enviar fica apagado com o campo vazio ou só com espaços.
- **RF-14:** O campo não aceita mais que `maxLength` caracteres, e mostra o contador quando faltam 200 ou menos.
- **RF-15:** Ao enviar, a mensagem entra no fim da lista na hora, com "Enviando..." no lugar do horário, e o campo é limpo.
- **RF-16:** Quando o backend responde `201`, a mensagem passa a mostrar o horário e "Enviada", com um ícone de confirmação.
- **RF-17:** Se o envio falha, a mensagem fica com "Não foi possível enviar" e o botão "Tentar de novo", que reenvia o mesmo texto. O campo continua liberado para outras mensagens.
- **RF-18:** As mensagens da professora mostram só o horário.

**Atualização**

- **RF-19:** Com a tela em foco e o app em primeiro plano, o app busca a conversa a cada 30 segundos. Sair da tela ou mandar o app para o segundo plano para a busca; voltar busca na hora.
- **RF-20:** Puxar a lista para baixo busca na hora, com o indicador de atualização.
- **RF-21:** Mensagens novas entram no fim sem duplicar as que já estão na tela, e sem apagar as que estão em envio ou com falha. A lista só rola sozinha se o aluno já estava no fim.
- **RF-22:** Falha numa busca periódica não mostra erro nem apaga a conversa da tela.
- **RF-23:** Abrir a conversa zera o contador do Perfil e o marcador da aba.

## Critérios de aceite

- [ ] Com conta gratuita, a linha aparece no Perfil, a tela mostra o cadeado e o aviso, e não há campo de mensagem.
- [ ] Com conta assinante sem conversa, a tela mostra o texto de conversa vazia.
- [ ] Uma mensagem enviada aparece na hora com "Enviando..." e, em seguida, com o horário e "Enviada".
- [ ] Com o modo avião ligado, a mensagem fica com "Tentar de novo"; desligando o modo avião, o reenvio funciona e ela não aparece duas vezes.
- [ ] Uma resposta da professora aparece na tela aberta em até 30 segundos, sem ação do aluno.
- [ ] Puxar a lista traz a resposta na hora.
- [ ] Com a tela do chat fechada, uma resposta da professora faz aparecer o contador na linha do Perfil e o marcador na aba, ao voltar ao app ou abrir o Perfil. Abrir o chat tira os dois.
- [ ] Mensagens de dias diferentes aparecem separadas pela data.
- [ ] Com mais de 50 mensagens, "Ver mensagens anteriores" traz as antigas e a tela continua na mesma mensagem.
- [ ] O teclado aberto não cobre o campo nem a última mensagem, no Android e no iOS.

## Desenho técnico

**Criar**

- `src/app/(app)/teacher-chat.tsx`: a tela.
- `src/services/teacherChat.ts`: os tipos `TeacherChatMessage` e `TeacherChatPage`, e `getTeacherChat(token, before?)`, `sendTeacherChatMessage(token, content)` e `getTeacherChatUnread(token)`.
- `src/hooks/useTeacherChat.ts`: carrega a conversa, guarda as mensagens locais (em envio e com falha), junta com as do backend pelo `id`, envia, reenvia, busca as anteriores e cuida do intervalo de 30 segundos e do `AppState`.
- `src/contexts/TeacherChatUnreadContext.tsx`: guarda a quantidade de não lidas e expõe `unread`, `refreshUnread()` e `clearUnread()`, para a aba, o Perfil e a tela do chat.
- `src/components/teacherChat/`:
  - `MessageBubble.tsx`: `TeacherAvatar` (a foto), `TeacherMessage` e `StudentMessage`, com horário e situação do envio.
  - `DaySeparator.tsx`: a data entre os dias.
  - `MessageComposer.tsx`: o campo com contador.
- `src/utils/teacherChat.ts`: `canUseTeacherChat(user)`, `formatUnread`, `formatMessageTime`, `formatDayLabel` e `isSameDay`.
- `assets/teacher-avatar.jpg`: a foto da professora, 256 × 256, recortada de `public/img/giselle-picture.png` do site.

**Alterar**

- `src/constants/config.ts`: `teacherChat` e `teacherChatUnread` em `API_ROUTES`.
- `src/app/(app)/_layout.tsx`: o `TeacherChatUnreadProvider` em volta da pilha.
- `src/app/(app)/(tabs)/_layout.tsx`: `tabBarBadge` na aba Perfil.
- `src/app/(app)/(tabs)/profile.tsx`: a linha nova, com o contador.
- `CLAUDE.md`: a iniciativa.

**Reutilizar**

- `HeaderButton`, de `src/components/lesson/ClassicLesson.tsx`.
- `api`, `ApiError` e `getErrorMessage`, de `src/lib/api.ts`; `useAuth`.
- O estado bloqueado segue o do chat com IA (`src/app/(app)/practice/chat.tsx`).

**Notas**

- A mensagem local tem um id provisório e a situação `sending`, `sent` ou `failed`. Quando o `201` chega, ela é trocada pela do backend; a busca seguinte não a duplica porque a junção é pelo `id`.
- O `ChatComposer` do chat com IA não é alterado: ele trava enquanto a Gisa responde, e aqui o campo nunca trava.
- A lista é uma `FlatList` com `KeyboardAvoidingView`, como no chat com IA, e usa `maintainVisibleContentPosition` para as mensagens antigas entrarem no topo sem tirar a leitura do lugar.
- **Divergência do rascunho:** o cabeçalho deixou de ser o `LessonHeader`, que só tem título, para mostrar a foto da professora, pedida pelo dono do projeto.
- As rotas tipadas do Expo Router são geradas pelo servidor de desenvolvimento; com ele parado, o `tsc` pode reclamar da rota nova até a próxima execução.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
```

Os critérios de aceite são conferidos no aparelho, com uma conta assinante e uma gratuita. Enquanto o painel do site não existir, as respostas da professora podem ser gravadas pela rota dela ou direto no banco, com autorização. Quem implementa diz quais passos fez e quais ficaram para o dono do projeto.

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passaram, e as rotas que a tela usa foram conferidas no site. Nada foi testado no aparelho: todos os critérios de aceite ficam para o dono do projeto.

## Tarefas

- [x] Rotas em `API_ROUTES` e o serviço.
- [x] Utilitários de data e de acesso.
- [x] `useTeacherChat`: carga, envio, falha, reenvio e mensagens anteriores.
- [x] Intervalo de 30 segundos, `AppState` e puxar para atualizar.
- [x] Componentes e a tela, com o estado bloqueado.
- [x] Contexto de não lidas, linha no Perfil e marcador na aba.
- [x] `CLAUDE.md`.
- [ ] Percorrer os critérios de aceite no aparelho.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
