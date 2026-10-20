# 01. Cartão na aba Praticar e lista de cenários

- **Status:** rascunho
- **Depende de:** fase 02 de `.specs/simulations/` do site no ar

## Contexto

O backend já lista os cenários com o que está trancado, o que o aluno já completou e quantas simulações restam hoje (`GET /api/mobile/simulations`, ver [architecture.md](architecture.md)). Falta o caminho até eles no app.

## Escopo

- O cartão "Simulações" na aba Praticar.
- A tela da lista de cenários.
- O serviço e as rotas das simulações em `API_ROUTES`.

## Fora do escopo

- A tela de um cenário (fase 02). Nesta fase, o toque num cenário liberado já navega para `practice/simulations/[id]`, que ainda mostra só a apresentação.
- Busca e filtros.

## Requisitos

- **RF-01:** a aba Praticar (`src/app/(app)/(tabs)/practice.tsx`) ganha o cartão "Simulações", logo depois do "Chat com IA", com o ícone `chatbubbles-outline` num círculo verde-claro e a descrição "Pratique situações do dia a dia, como pedir um café, e cumpra as tarefas." O cartão abre a lista para todos, também para o gratuito, sem etiqueta Premium.
- **RF-02:** a lista (`src/app/(app)/practice/simulations/index.tsx`) tem o cabeçalho de voltar (`LessonHeader`) com o título "Simulações" e, abaixo, a linha "Restam {n} de {limite} hoje" (`remainingToday` e `limitPerDay`), ou "Você fez todas as simulações de hoje" com `remainingToday` 0.
- **RF-03:** cada cenário é um cartão (`SimulationCard`) com o emoji num círculo, o título, a descrição em até 2 linhas, o nível ("Iniciante", "Intermediário" ou "Avançado") e o número de tarefas ("3 tarefas"). Um cenário com `isCompleted` mostra "Feita", com um ícone de visto verde.
- **RF-04:** um cenário com `isLocked` mostra a etiqueta Premium (`PremiumBadge`) no lugar do nível, e o toque leva a `/plans`. O leitor de tela anuncia "{título}, exclusivo do plano Premium".
- **RF-05:** o toque num cenário liberado abre `practice/simulations/[id]`, também com `remainingToday` 0: a apresentação mostra o aviso do limite (fase 02).
- **RF-06:** a lista carrega ao abrir e de novo ao voltar para ela (`useFocusEffect`), para atualizar "Feita" e o que resta hoje. Enquanto carrega pela primeira vez, mostra o indicador de carregamento; nas próximas, mantém a lista na tela.
- **RF-07:** se a lista não carregar, a tela mostra a mensagem do backend (ou "Não foi possível carregar as simulações.") com o botão "Tentar de novo".
- **RF-08:** sem cenários, a tela mostra "Nenhuma simulação por aqui ainda."
- **RF-09:** `getSimulations(token)` guarda a última lista num cache em memória do serviço, e `getCachedSimulation(id)` devolve um cenário dela (ver `architecture.md`).

## Critérios de aceite

- [ ] A aba Praticar mostra "Simulações" depois do "Chat com IA", para Premium e para gratuito.
- [ ] A lista mostra "Pedir café" com o emoji, o nível e "3 tarefas".
- [ ] Depois de completar uma simulação e voltar, o cenário mostra "Feita" e "Restam" diminui.
- [ ] Com conta gratuita, um cenário sem `is_free` mostra a etiqueta Premium e abre a tela de planos.
- [ ] Sem internet, a lista mostra o erro e "Tentar de novo" carrega quando a conexão volta.

## Desenho técnico

- `src/constants/config.ts`: `simulations`, `simulationRuns(id)` e `simulationTurns(runId)` em `API_ROUTES`.
- `src/services/simulations.ts` (novo): tipos do contrato (`Simulation`, `SimulationList`, `SimulationStart`, `SimulationTurn`) e `getSimulations`, com o cache. `startSimulation` e `sendSimulationTurn` entram na fase 02.
- `src/components/simulations/SimulationCard.tsx` (novo), no visual do `PracticeOption` da aba Praticar: borda `border-gray-200`, fundo branco, sem sombra.
- `src/app/(app)/practice/simulations/index.tsx` (nova) e `src/app/(app)/practice/simulations/[id].tsx` (nova, só a apresentação nesta fase).
- `src/app/(app)/(tabs)/practice.tsx`: o cartão novo.
- Reaproveita `LessonHeader`, `PremiumBadge`, `useAuth`, `api` e `getErrorMessage`.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- No aparelho, com o build preview e o backend no ar: Premium e gratuito, lista vazia (sem cenário publicado no Dato de teste) e sem internet.

## Tarefas

- [ ] Rotas em `API_ROUTES` e o serviço com o cache.
- [ ] `SimulationCard` e a tela da lista.
- [ ] Cartão na aba Praticar.
- [ ] Documentação (`CLAUDE.md`), status desta spec e a tabela do README.
