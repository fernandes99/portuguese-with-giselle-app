# 01. Sino, lista e detalhe

- **Status:** rascunho
- **Depende de:** fase 01 do site (rotas de leitura)

## Contexto

Primeira fase do app. As notificações já existem no backend; esta fase mostra o sino com o contador nas quatro abas e as telas de lista e de detalhe. Ainda não há push (fase 02): o contador atualiza quando o aluno volta ao app ou troca de aba.

Leia antes o [README](README.md) e o [architecture.md](architecture.md).

## Escopo

- `NotificationsContext` com o número de não lidas.
- Componente `NotificationBell` nas abas Aprender, Praticar, Progresso e Perfil.
- Tela de lista (`/notifications`) e tela de detalhe (`/notifications/[id]`).
- Abrir o destino de uma notificação.

## Fora do escopo

- Push, permissão e token (fase 02).
- Sino em telas fora das abas.

## Requisitos

- **RF-01:** o sino aparece no canto superior direito das quatro abas, na linha do título: ao lado de "Praticar" e de "Progresso", ao lado do título do curso na aba Aprender e numa linha própria, alinhada à direita, no topo do Perfil. Ele aparece também nos estados de carregamento, erro e vazio de cada aba.
- **RF-02:** com não lidas, o sino mostra o número num círculo verde (acima de 9, "9+", com `formatUnread`). O ícone é `notifications-outline` (Ionicons), 24, cinza; com não lidas, `notifications`, verde.
- **RF-03:** o sino tem `accessibilityLabel` "Notificações" ou "Notificações, 3 não lidas", área de toque de pelo menos 44 pt, e abre `/notifications`.
- **RF-04:** o número de não lidas é buscado quando a área logada abre, quando o app volta ao primeiro plano e quando uma das abas ganha foco (`useFocusEffect`). Falha na busca não mostra erro; o número fica como estava.
- **RF-05:** a tela de lista tem o cabeçalho com voltar e o título "Notificações" (`LessonHeader`) e, à direita, "Marcar todas como lidas" quando há não lidas.
- **RF-06:** cada item mostra o título (negrito se não lida), a descrição em até 2 linhas e o tempo relativo (`formatTimeAgo`, `src/utils/date.ts`). A não lida tem fundo verde-claro e um ponto verde. Itens separados por borda, sem sombra.
- **RF-07:** a lista carrega a próxima página ao chegar perto do fim e atualiza ao puxar para baixo. Volta à tela (foco) também atualiza a primeira página.
- **RF-08:** sem notificações, a tela mostra o sino grande e "Nenhuma notificação por enquanto". Falha ao carregar mostra o erro e "Tentar de novo".
- **RF-09:** tocar num item abre `/notifications/<id>`.
- **RF-10:** o detalhe mostra o título, a data e a hora (`formatDateTime`), a descrição inteira (texto selecionável) e, se houver `link`, um botão com o `label` dele.
- **RF-11:** ao abrir o detalhe de uma não lida, o app chama `POST .../read` e atualiza o contador com o `unread` da resposta. Na volta, a lista mostra o item como lido.
- **RF-12:** o botão do detalhe abre o destino: `screen` com `router.push(path)`, `url` no navegador do app. Destino de tela exclusiva do Premium abre a tela, que mostra o `PremiumLock` para o aluno gratuito.
- **RF-13:** notificação que não existe mais (`404`) mostra "Esta notificação não está mais disponível." e o botão de voltar.
- **RF-14:** "Marcar todas como lidas" chama `read-all`, zera o contador e tira o destaque de todos os itens, sem recarregar a lista.

## Critérios de aceite

- [ ] O sino aparece nas quatro abas e não aparece nas telas de aula, chat e planos.
- [ ] Com 3 não lidas criadas pelo backend, o sino mostra 3 ao voltar ao app.
- [ ] Abrir uma não lida baixa o sino para 2 e, ao voltar, o item aparece como lido.
- [ ] Uma notificação com destino `progress` abre a aba Progresso pelo botão; uma com `url` abre o navegador; uma com `link: null` não tem botão.
- [ ] Com 25 notificações, a lista mostra as 25 sem repetir ao rolar até o fim.
- [ ] Marcar uma como lida no site faz ela aparecer como lida no app depois de puxar para atualizar.
- [ ] Leitor de tela anuncia o sino com o número de não lidas.
- [ ] `yarn lint` sem avisos, `yarn tsc --noEmit` e `npx expo-doctor` passam.

## Desenho técnico

Criar:

- `src/services/notifications.ts`.
- `src/contexts/NotificationsContext.tsx`, no modelo de `src/contexts/TeacherChatUnreadContext.tsx` (busca ao abrir e ao voltar do segundo plano com `AppState`).
- `src/hooks/useNotifications.ts`: páginas da lista, atualização e marcar todas.
- `src/hooks/useNotification.ts`: carga do detalhe e a marcação de lida.
- `src/utils/notifications.ts`.
- `src/components/notifications/NotificationBell.tsx` e `NotificationRow.tsx`.
- `src/app/(app)/notifications/index.tsx` e `src/app/(app)/notifications/[id].tsx`.

Alterar:

- `src/app/(app)/_layout.tsx`: `NotificationsProvider`.
- `src/app/(app)/(tabs)/index.tsx`, `practice.tsx`, `progress.tsx` e `profile.tsx`: o sino e a busca do contador no foco.
- `src/components/learn/LearnHeader.tsx`: espaço para o sino à direita do título do curso.
- `src/constants/config.ts`: as rotas em `API_ROUTES`.
- `CLAUDE.md`: a linha da iniciativa em "Iniciativas em andamento" (o que ficou pronto).

Reutilizar: `api` e `getErrorMessage` (`src/lib/api.ts`), `useAuth`, `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), `Button`, `formatTimeAgo` e `formatDateTime` (`src/utils/date.ts`), `formatUnread` (`src/utils/teacherChat.ts`), `colors` (`src/constants/theme.ts`).

Sem dependência nativa nova: esta fase não exige novo build.

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`, `npx expo-doctor`.
2. Com o backend local e notificações criadas pelo script da fase 01 do site: os critérios acima, num aparelho ou emulador com o development build atual.
3. Dizer quais critérios foram conferidos no aparelho e quais ficaram para o dono do projeto.

## Tarefas

- [ ] Serviço, rotas em `API_ROUTES` e utilitários.
- [ ] `NotificationsContext` no layout da área logada.
- [ ] `NotificationBell` nas quatro abas.
- [ ] Tela de lista.
- [ ] Tela de detalhe e abertura do destino.
- [ ] Linha da iniciativa no `CLAUDE.md`.
- [ ] Verificação.
- [ ] Status desta spec e da tabela do README.
