# Progresso de estudo

A aba Progresso ganha os dias de estudo da semana, um gráfico do que o aluno fez nos últimos 7 dias, a sequência atual e a melhor, e as conquistas.

## Contexto

Com a saída da tela de Dashboard, a aba Progresso (`src/app/(app)/(tabs)/progress.tsx`) passou a mostrar os quatro números gerais e o andamento de cada curso. Faltam dados que mostrem o hábito do aluno: em que dias estudou e quanto fez em cada um.

Os dados vêm de uma rota nova do backend, `GET /api/mobile/progress`, descrita no repositório do site (`portuguese-with-giselle`, em `.specs/study-progress/` de lá). É lá que o registro diário passa a existir.

## Quem usa

Qualquer aluno logado.

## Objetivos

1. O aluno vê, de relance, em quais dias da semana estudou.
2. Ele vê quanto fez em cada um dos últimos 7 dias, separado em aulas, exercícios e práticas.
3. A aba reúne tudo o que é progresso: números, hábito, sequência, conquistas e cursos.

## A tela, de cima para baixo

Ordem definida pelo dono do projeto:

1. Cabeçalho: "Progresso" e "Acompanhe o quanto você já avançou." (como hoje).
2. Grade de números, os quatro cartões de hoje.
3. Dias de estudo.
4. Gráfico de 7 dias.
5. Sequência atual e melhor sequência.
6. Conquistas.
7. Meus cursos (como hoje).

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                         | Motivo                              |
| ------------------------------------------------------------------------------- | ----------------------------------- |
| A ordem das seções acima                                                        | Pedido direto                       |
| Cabeçalho, grade de números e "Meus cursos" ficam como estão                    | Pedido direto                       |
| Dia de estudo: dia com aula concluída, exercício concluído ou card respondido   | Abrir o app não é estudar           |
| Mensagem no chat não marca o dia como dia de estudo                             | Definição dada pelo dono do projeto |
| "Práticas", no gráfico: cards respondidos mais mensagens do chat, numa barra só | As duas formas de prática juntas    |
| Gráfico de 7 dias com aulas, exercícios e práticas                              | Pedido direto                       |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                           | Motivo                                                                                   |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| "Dias de estudo" mostra a semana corrente, de segunda a domingo                                   | É a referência visual enviada pelo dono do projeto                                       |
| O gráfico mostra os últimos 7 dias, terminando hoje                                               | Não fica vazio na segunda-feira                                                          |
| Barras empilhadas feitas com `View`, sem biblioteca de gráfico                                    | São sete barras; não justifica dependência nem novo build                                |
| Uma chamada (`GET /api/mobile/progress`) para tudo, menos os cursos, que seguem em `getCourses`   | A lista de cursos já existe e é a mesma de outras telas                                  |
| O app envia o fuso do aparelho na chamada                                                         | O dia do aluno não é o dia do servidor                                                   |
| As conquistas mostram todas, com as não desbloqueadas apagadas                                    | O aluno vê o que ainda pode conquistar                                                   |
| Conquistas só de leitura: tocar numa não abre nada                                                | Não há tela de detalhe nesta entrega                                                     |
| Num dia só com chat, o gráfico tem barra de práticas e o dia não fica marcado em "Dias de estudo" | Consequência das duas definições do dono do projeto; registrada para não parecer defeito |

## Fora do escopo

- Tela de detalhe de conquista e aviso de conquista desbloqueada.
- Escolher o período do gráfico ou ver semanas anteriores.
- Metas diárias e lembretes.
- Tempo real de uso do app.
- Mudanças nas outras abas.

## Pré-requisitos

- A rota `GET /api/mobile/progress` no ar (fases `01-study-events` e `02-progress-api` do site).

## Fases

| Fase                                            | Entrega                                                    | Status    |
| ----------------------------------------------- | ---------------------------------------------------------- | --------- |
| [01-progress-sections](01-progress-sections.md) | Dados da rota nova, dias de estudo, sequência e conquistas | concluída |
| [02-activity-chart](02-activity-chart.md)       | Gráfico de 7 dias                                          | concluída |

O desenho compartilhado está em [architecture.md](architecture.md).

## Dúvidas resolvidas

O dono do projeto mandou implementar sem responder às duas dúvidas do planejamento. Valeram as recomendações, que são fáceis de trocar depois:

1. **A sequência continua contando dias de acesso**, como no site. O app passou a atualizá-la ao carregar os cursos (a aba Aprender, tela inicial). Trocar para dias de estudo mudaria o número que o site, a área da professora e as conquistas de sequência usam.
2. **O cartão "Sequência Atual" continua na grade de números**, mesmo com a seção de sequência logo abaixo.

## Glossário

- **Dia de estudo:** dia, no fuso do aparelho, com aula concluída, exercício concluído ou card respondido.
- **Prática:** card respondido ou mensagem enviada no chat com IA.
- **Exercício:** o que o backend chama de atividade (`activities`).
- **Sequência:** dias seguidos contados pelo backend.
