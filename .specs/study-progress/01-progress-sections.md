# 01. Seções de progresso

- **Status:** concluída
- **Depende de:** rota `GET /api/mobile/progress` no ar (fase `02-progress-api` do site)

## Contexto

A aba Progresso mostra hoje o cabeçalho, quatro cartões de números e "Meus cursos". Esta fase troca a fonte dos dados pela rota nova e acrescenta três seções: dias de estudo, sequência e conquistas. O gráfico vem na fase 02, que ocupa o lugar reservado entre os dias de estudo e a sequência.

## Escopo

- Serviço e tipos da rota nova.
- `useProgress` lendo a rota nova.
- Seções "Dias de estudo", "Sequência" e "Conquistas".
- A ordem das seções na aba.

## Fora do escopo

- O gráfico de 7 dias (fase 02).
- Mudança no cabeçalho, nos quatro cartões e em "Meus cursos".
- Tela de detalhe de conquista.

## Requisitos

- **RF-01:** A aba mostra, nesta ordem: cabeçalho, grade de números, "Dias de estudo", "Sequência", "Conquistas" e "Meus cursos". (O gráfico entra entre "Dias de estudo" e "Sequência" na fase 02.)
- **RF-02:** O cabeçalho, os quatro cartões (Módulos Completos, Horas Estudadas, Lições Completadas e Sequência Atual) e "Meus cursos" ficam iguais aos de hoje, com os números vindos de `stats` da rota nova.
- **RF-03:** "Dias de estudo" mostra os sete dias de `week.days` numa linha, de segunda a domingo, cada um com um círculo e a abreviação embaixo ("seg.", "ter.", ...).
- **RF-04:** Dia com `studied` verdadeiro: círculo verde com check branco. Dia sem estudo: círculo cinza claro, vazio.
- **RF-05:** O dia de hoje tem a abreviação em destaque (mais escura e em negrito). Os outros ficam em cinza.
- **RF-06:** Abaixo da linha aparece, com um ícone de calendário, "1 dia ativo" ou "N dias ativos", com `week.activeDays`. Com zero: "Nenhum dia ativo nesta semana".
- **RF-07:** "Sequência" mostra dois blocos lado a lado: "Sequência atual" com `streak.current` e "Melhor sequência" com `streak.best`, os dois no formato "1 dia" / "N dias" (`formatStreak`).
- **RF-08:** "Conquistas" mostra, ao lado do título, "X de N" (`achievements.unlocked` e `achievements.total`) e, abaixo, todas as conquistas de `achievements.items`, na ordem recebida.
- **RF-09:** Cada conquista aparece com um ícone de troféu, o título e a descrição. Desbloqueada: ícone colorido e a data ("Conquistada em 12/10/2026"). Não desbloqueada: ícone e textos em cinza, com um cadeado, sem data.
- **RF-10:** Sem conquistas cadastradas (`total` zero), a seção não aparece.
- **RF-11:** A chamada envia o fuso do aparelho em `timeZone`; sem fuso disponível, `UTC`.
- **RF-12:** A aba recarrega ao voltar ao foco e ao puxar para baixo, como hoje. Em erro, mostra a mensagem e "Tentar de novo"; as seções que dependem do dado que falhou não aparecem.
- **RF-13:** Para o leitor de tela, cada dia lê o nome completo e a situação ("segunda-feira, estudou" / "terça-feira, sem estudo"), e cada conquista lê o título e se está desbloqueada.

## Critérios de aceite

- [ ] As seções aparecem na ordem do RF-01.
- [ ] Os quatro cartões mostram os mesmos números de antes da mudança.
- [ ] Depois de concluir uma aula hoje e voltar à aba, o dia de hoje fica verde e a contagem de dias ativos sobe.
- [ ] Num dia em que o aluno só usou o chat, o dia continua cinza.
- [ ] A semana começa na segunda-feira e o dia de hoje está em destaque, conferido com o aparelho num fuso diferente de UTC.
- [ ] "Sequência atual" e "Melhor sequência" mostram os valores do backend.
- [ ] As conquistas desbloqueadas aparecem coloridas e com data; as outras, apagadas.
- [ ] Em modo avião, a aba mostra o erro e "Tentar de novo" funciona ao voltar a conexão.

## Desenho técnico

**Criar**

- `src/services/progress.ts`: tipos do contrato (`architecture.md`) e `getProgress(token, timeZone)`, no formato de `src/services/courses.ts`.
- `src/utils/progress.ts`: `getDeviceTimeZone()`, `getWeekdayLabel(date)` (abreviação e nome completo), `formatActiveDays(count)` e `formatUnlockedDate(iso)`.
- `src/components/progress/StudyDays.tsx`, `StreakSummary.tsx` e `AchievementList.tsx`.

**Alterar**

- `src/constants/config.ts`: `progress: '/api/mobile/progress'` em `API_ROUTES`; sai `dashboard`.
- `src/hooks/useProgress.ts`: `getProgress` no lugar de `getDashboard`. O `fetcher` passado ao `useApiQuery` precisa ter identidade estável (função de módulo que lê o fuso, ou `useCallback`).
- `src/app/(app)/(tabs)/progress.tsx`: as seções novas, na ordem.
- `CLAUDE.md` e `.specs/README.md`: a iniciativa e a descrição da aba.

**Remover**

- `src/services/dashboard.ts`, que fica sem uso.

**Notas**

- A query vai montada com `encodeURIComponent`, porque os nomes de fuso têm barra.
- A data da conquista (`unlockedAt`) é um instante em ISO e é formatada no fuso do aparelho; as datas de `week` e `activity` são dias prontos e não passam por conversão (ver "Datas na tela" em `architecture.md`).
- Sem `key` por índice: os dias usam `date` e as conquistas usam `code`.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar: percorrer os critérios de aceite. Concluir aulas e responder cards grava progresso real na conta usada.

## Tarefas

- [x] `API_ROUTES.progress` e `src/services/progress.ts`.
- [x] `src/utils/progress.ts`.
- [x] `useProgress` com a rota nova; remover `src/services/dashboard.ts`.
- [x] `StudyDays`.
- [x] `StreakSummary`.
- [x] `AchievementList`.
- [x] Ordem das seções na aba.
- [x] Atualizar o `CLAUDE.md` e o `.specs/README.md`.
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.

## Divergências

- **Visual novo, no padrão do chat** (mudança pequena, combinada no chat): fundo branco, cartões `bg-surface` (#f6f7f9, um cinza mais claro que o `gray-100`) sem borda e `rounded-3xl`, ícones sólidos em círculos brancos. `StudyDays` e `StreakSummary` viraram um só bloco no topo (`StreakCard`), sem caixa, direto no fundo branco e alinhado à esquerda: numa linha, a chama num círculo laranja-claro e, ao lado, o número da sequência com "dias seguidos" e a melhor sequência embaixo; depois, a semana. Na semana, o dia estudado (`studied`) é um círculo laranja com check; o dia só com prática no chat, que não conta como estudo, é laranja-claro com o número (o app tira isso de `activity`, que cobre a semana até hoje); hoje sem nada fica cinza; os outros dias mostram só o número, mais claro nos que ainda não chegaram. A contagem de dias ativos saiu; no lugar do número "Sequência Atual", entrou "Conquistas" (desbloqueadas de total). Os quatro números ficam em cartões coloridos, cada um num tom claro (azul, verde, roxo e laranja) com o ícone no tom forte; o gráfico, as conquistas e os cursos continuam em `bg-surface`.
- **Página de conquistas** (mudança pequena, combinada no chat): a seção "Conquistas" do Progresso mostra só as 3 primeiras (as desbloqueadas vêm antes) e, quando há mais, termina numa última linha "Ver todas as conquistas", dentro da mesma caixa e no formato das outras, que abre `src/app/(app)/achievements.tsx`. A página tem o resumo "X de Y desbloqueadas" com uma barra, e as conquistas em dois grupos, "Desbloqueadas" e "Para desbloquear". Os dados vêm da mesma rota de progresso (`useAchievements`, em `useProgress.ts`), sem rota nova no site.
