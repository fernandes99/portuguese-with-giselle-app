# Aula guiada

Segunda tela de aula do app: um fluxo em etapas, com barra de progresso no topo e um "Continuar" fixo embaixo, que termina numa tela de parabéns e devolve o aluno à aba Aprender com a aula concluída e a próxima desbloqueada.

## Contexto

A tela de aula atual (`src/app/(app)/lesson/[courseSlug]/[lessonSlug].tsx`) é uma página com quatro abas: Conteúdo, Recursos, Atividades e Discussões. Ela serve bem para consultar uma aula, mas não conduz: o aluno escolhe a ordem e marca a aula como concluída à mão.

A aba Aprender (`src/app/(app)/(tabs)/learn.tsx`) já mostra o curso como um caminho de módulos e aulas, com a aula atual e as seguintes trancadas. Falta a aula em si ser um percurso com começo, meio e fim.

## Quem usa

O aluno, no app. A professora e o site não são afetados.

## Objetivos

1. A aula que o aluno ainda não concluiu é feita em etapas, uma tela por vez.
2. O aluno vê o quanto falta, numa barra de progresso que avança a cada etapa e a cada atividade.
3. Terminar a aula é comemorado e leva de volta ao caminho, onde o avanço fica visível.
4. A tela de aula atual continua existindo, igual, para as aulas já concluídas.

## O fluxo

| Parte         | O que mostra                                                                                | Existe quando               |
| ------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| 1. Introdução | Vídeo da aula (se houver), título e descrição                                               | Sempre                      |
| 2. Conteúdo   | O texto da aula                                                                             | A aula tem `content`        |
| 3. Atividades | As atividades, uma por vez                                                                  | A aula tem atividades       |
| Parabéns      | "Muito bem, {nome}! Você completou a aula.", animação, som, recursos, discussões, Continuar | Sempre, depois da conclusão |

O "Continuar" do parabéns leva à aba Aprender, que anima a conclusão da aula e o desbloqueio da próxima.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                                 | Motivo                                                                                     |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A tela nova é uma tela a mais; a atual não muda                                                         | A tela atual continua sendo a de consulta das aulas concluídas                             |
| Aula **não concluída** abre o fluxo novo; aula **concluída** abre a tela atual                          | O fluxo é para a primeira vez; rever uma aula pede acesso livre às abas                    |
| A regra vale em todo o app: Aprender, Cursos, Dashboard e de dentro de outra aula                       | O aluno tem a mesma experiência não importa por onde entrou                                |
| Cada atividade precisa chegar ao resultado (certo ou errado) para liberar o "Continuar"; não há "pular" | O aluno pratica de fato, sem travar numa atividade difícil                                 |
| A aula conclui mesmo com erros nas atividades                                                           | O registro de cada atividade segue a regra atual (só conta como concluída se acertou tudo) |
| O som de parabéns é um arquivo gerado por script, em `assets/sounds/`                                   | Sem direito autoral de terceiros, e trocável sem mexer em código                           |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                                                  | Motivo                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| A rota da aula escolhe a tela depois de carregar a aula, por `lesson.isCompleted`                                        | Nenhum ponto de entrada precisa saber da regra, e o Dashboard nem tem esse dado                    |
| A escolha é feita uma vez por abertura e não troca no meio                                                               | Concluir a aula não pode trocar a tela embaixo do aluno                                            |
| O código da tela atual é movido, sem alteração, para `src/components/lesson/ClassicLesson.tsx`                           | O arquivo da rota passa a ser só a escolha entre as duas telas                                     |
| Partes que a aula não tem são puladas; atividades de verdadeiro ou falso ficam fora do fluxo                             | O app ainda não tem esse tipo de atividade (ver `src/components/activity/LessonActivities.tsx`)    |
| A barra tem uma unidade para a introdução, uma para o conteúdo e uma por atividade                                       | Atende "avança a cada etapa e a cada atividade" com uma conta só                                   |
| A aula é marcada como concluída ao sair da última parte, antes do parabéns; se a gravação falhar, o parabéns não aparece | O parabéns não pode comemorar o que não foi salvo                                                  |
| Sair no meio pede confirmação, e reabrir a aula recomeça da introdução                                                   | Guardar a etapa exigiria estado novo no aparelho ou no backend; as atividades feitas seguem salvas |
| Animações com `react-native-reanimated` e som com `expo-audio`, sem biblioteca nova                                      | As duas já estão instaladas; não exige novo development build                                      |

## Fora do escopo

- Qualquer mudança na tela de aula atual, no backend ou no site.
- Portar a atividade de verdadeiro ou falso para o app.
- Retomar o fluxo da etapa em que o aluno parou.
- Pontos, conquistas ou sequência de dias na tela de parabéns.
- Levar o bloqueio em sequência da aba Aprender para outras telas.

## Pré-requisitos

- A aba Aprender implementada (`src/app/(app)/(tabs)/learn.tsx`, `src/components/learn/`, `src/utils/learn.ts`).
- Nenhuma rota nova no backend. O fluxo usa `getLesson`, `setLessonCompleted` e `setActivityProgress` (`src/services/lesson.ts`) pelo hook `useLesson` (`src/hooks/useLesson.ts`).

## Fases

| Fase                                                      | Entrega                                                             | Status       |
| --------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| [01-lesson-flow](01-lesson-flow.md)                       | Escolha da tela na rota, as três partes, barra de progresso e saída | em andamento |
| [02-congratulations](02-congratulations.md)               | Tela de parabéns com animação, som, recursos e discussões           | em andamento |
| [03-learn-unlock-animation](03-learn-unlock-animation.md) | Volta ao Aprender com animação de conclusão e desbloqueio           | em andamento |

O desenho compartilhado está em [architecture.md](architecture.md).

## Glossário

- **Tela clássica:** a tela de aula atual, com abas.
- **Fluxo guiado:** a tela nova, em etapas.
- **Parte:** introdução, conteúdo ou atividades.
- **Unidade:** um passo da barra de progresso. A introdução e o conteúdo valem uma cada; cada atividade vale uma.
- **Aula concluída:** `lesson.isCompleted` verdadeiro, ou seja, existe o registro `COMPLETED` da aula para o aluno no backend.
