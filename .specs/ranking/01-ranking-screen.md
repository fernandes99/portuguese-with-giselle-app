# 01. Tela do ranking

- **Status:** rascunho
- **Depende de:** rota `GET /api/mobile/ranking` do site (`.specs/ranking/01-ranking-service.md` de lá)

## Contexto

O backend já calcula o ranking. Esta fase cria a tela que o mostra e o caminho até ela, pela aba Progresso. As decisões estão no `README.md`.

## Escopo

- Rota, serviço e hook do ranking.
- Tela `/ranking`: seletor, pódio, lista e linha fixa.
- Cartão "Ranking" na aba Progresso.

## Requisitos

- **RF-01:** `getRanking(token, period)` (`src/services/ranking.ts`) chama `API_ROUTES.ranking` com `?period=`, e os tipos seguem o contrato do site.
- **RF-02:** A tela abre no mês. O seletor "Este mês / Total" troca o período; até a lista do período escolhido chegar, a tela mostra o indicador de carregamento.
- **RF-03:** O pódio mostra os 3 primeiros na ordem 2º, 1º, 3º, com o 1º mais alto, cada um com a foto, o nome e o score; com menos de 3, os que houver.
- **RF-04:** Abaixo, a lista do 4º ao 50º: posição, foto, nome, 🔥 e os dias seguidos, e o score.
- **RF-05:** A linha do aluno fica fixa no pé da tela, fora da rolagem, acima da área segura de baixo. Dentro do pódio e da lista, a linha dele fica destacada.
- **RF-06:** Sem posição (`me: null`), a linha fixa diz "Ganhe pontos neste mês para entrar no ranking" no mês e "Ganhe pontos para entrar no ranking" no total.
- **RF-07:** Sem nenhum aluno no período, a tela mostra um aviso no lugar do pódio e da lista, e a linha fixa do RF-06.
- **RF-08:** Sem foto, as iniciais do nome; sem nome, "Aluno" e a inicial "A".
- **RF-09:** Puxar para baixo recarrega; um erro mostra a mensagem com "Tentar de novo", como nas outras telas; 401 sai da conta (`useApiQuery`).
- **RF-10:** A aba Progresso tem um cartão "Ranking", logo depois da sequência, que abre `/ranking`.

## Critérios de aceite

- [ ] Pelo cartão da aba Progresso, a tela abre no mês com o pódio, a lista e a linha fixa.
- [ ] "Total" troca a lista e a linha fixa para os números do total.
- [ ] Rolando a lista, a linha do aluno continua no pé da tela.
- [ ] Um aluno sem score no mês vê o aviso do RF-06.
- [ ] Os números batem com os da página `/student/ranking` do site.
- [ ] `yarn lint`, `yarn tsc --noEmit` e `npx expo-doctor` passam.

## Desenho técnico

**Criar**

- `src/services/ranking.ts`: `RankingPeriod`, `RankingEntry`, `Ranking` e `getRanking`.
- `src/hooks/useRanking.ts`: `useRanking(period)`, sobre `useApiQuery` com um fetcher por período (`useCallback`); devolve `ranking` só quando ele é do período pedido.
- `src/app/(app)/ranking.tsx`: a tela, com `LessonHeader` ("Ranking"), a rolagem e a linha fixa.
- `src/components/ranking/`: `RankingAvatar`, `RankingRow`, `Podium`, `PeriodSelector` e `MyRankingBar`.

**Alterar**

- `src/constants/config.ts`: `ranking: '/api/mobile/ranking'` em `API_ROUTES`.
- `src/app/(app)/(tabs)/progress.tsx`: o cartão "Ranking".
- `CLAUDE.md`: a iniciativa em "Iniciativas em andamento" e a tela em "Estrutura".

**Notas**

- Não exige build novo: nenhuma biblioteca nativa entra.
- Fotos remotas com o `Image` do React Native, como o `SimulationAvatar`.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, logado com um aluno: abrir pelo Progresso, trocar o período, rolar, puxar para atualizar e comparar com o site.

## Tarefas

- [ ] Rota, serviço e hook.
- [ ] Componentes e tela.
- [ ] Cartão na aba Progresso.
- [ ] Conferir no aparelho.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
