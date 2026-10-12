# 02. Gráfico de 7 dias

- **Status:** concluída
- **Depende de:** `01-progress-sections`

## Contexto

A fase 01 já traz `activity` da rota e deixou a aba na ordem final, faltando o gráfico. Esta fase o acrescenta entre "Dias de estudo" e "Sequência".

## Escopo

- Seção "Últimos 7 dias" com barras empilhadas por dia.
- Legenda e estado vazio.

## Fora do escopo

- Tocar numa barra para ver detalhes.
- Outros períodos.
- Animação das barras.

## Requisitos

- **RF-01:** A seção "Últimos 7 dias" aparece entre "Dias de estudo" e "Sequência".
- **RF-02:** O gráfico tem sete colunas, uma por item de `activity`, do mais antigo (à esquerda) para hoje (à direita), com a abreviação do dia da semana embaixo de cada uma. A de hoje fica em destaque, como em "Dias de estudo".
- **RF-03:** Cada coluna é uma barra empilhada com três partes, de baixo para cima: aulas (azul), exercícios (roxo) e práticas (verde). Parte com valor zero não aparece.
- **RF-04:** A altura da barra é proporcional ao total do dia (aulas + exercícios + práticas) em relação ao maior total dos sete dias, que ocupa a altura toda da área do gráfico. As partes dividem a barra na proporção dos seus valores.
- **RF-05:** Acima de cada barra aparece o total do dia. Dia com total zero não mostra número nem barra, só um traço cinza na base.
- **RF-06:** Abaixo do gráfico há a legenda com as três cores e os nomes "Aulas", "Exercícios" e "Práticas", cada um com a soma dos sete dias.
- **RF-07:** Com os sete dias zerados, a área do gráfico mostra "Nenhuma atividade nos últimos 7 dias" e a legenda não aparece.
- **RF-08:** A área do gráfico tem altura fixa de 140, e as colunas dividem a largura igualmente.
- **RF-09:** Dia com total maior que zero tem barra de pelo menos 4 de altura, para não sumir ao lado de um dia muito maior.
- **RF-10:** Para o leitor de tela, cada coluna lê o dia e os três números ("segunda-feira: 1 aula, 3 exercícios, 14 práticas").

## Critérios de aceite

- [ ] O gráfico mostra sete colunas e a da direita é o dia de hoje.
- [ ] Depois de concluir uma aula, acertar dois exercícios e responder dez cards hoje, a coluna de hoje tem as três cores e o total 13.
- [ ] Mensagens enviadas no chat aumentam a parte verde.
- [ ] O dia de maior total ocupa a altura toda; os outros são proporcionais.
- [ ] Um dia com 1 e outro com 40 ainda mostram a barra menor visível (altura mínima de 4 para total maior que zero).
- [ ] Conta sem atividade na semana mostra o texto de vazio.
- [ ] A legenda soma os sete dias corretamente.

## Desenho técnico

**Criar**

- `src/components/progress/ActivityChart.tsx`: recebe `activity`. Barras com `View` e altura em pontos; sem biblioteca de gráfico.

**Alterar**

- `src/utils/progress.ts`: `getChartBars(activity, height)`, função pura que devolve, por dia, o total e a altura de cada parte. A regra da altura mínima fica nela.
- `src/app/(app)/(tabs)/progress.tsx`: a seção, no lugar definido.
- `src/constants/theme.ts`: nenhuma cor nova; o gráfico usa `colors.blue`, `colors.purple` e `colors.green`.

**Notas**

- A altura mínima (RF-09) vale para a barra inteira, não para cada parte: uma parte muito pequena pode ficar com menos de 4.
- Os plurais ("1 aula" / "2 aulas", "1 exercício" / "2 exercícios", "1 prática" / "2 práticas") ficam em `src/utils/progress.ts`.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar: percorrer os critérios de aceite, numa conta com atividade e numa sem.

## Tarefas

- [x] `getChartBars` e os plurais.
- [x] `ActivityChart`, com legenda e estado vazio.
- [x] Seção na aba.
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
