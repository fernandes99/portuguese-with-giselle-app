# Arquitetura da aula guiada

O que as três fases compartilham. Leia junto com o [README](README.md) da iniciativa.

## Escolha da tela

A rota continua sendo uma só: `/lesson/[courseSlug]/[lessonSlug]`, em `src/app/(app)/lesson/[courseSlug]/[lessonSlug].tsx`. Nenhum lugar que abre aula muda.

O arquivo da rota passa a fazer só isto:

1. Lê `courseSlug` e `lessonSlug` e chama `useLesson` (`src/hooks/useLesson.ts`).
2. Enquanto não há dados, mostra o carregamento, o erro ou o aviso de aula exclusiva para alunos (resposta 403), como a tela atual faz hoje.
3. Na primeira vez em que os dados chegam, guarda o modo: `guided` se `lesson.isCompleted` for falso, `classic` se for verdadeiro. O modo fica num `useRef` ou `useState` inicializado uma vez e **não é recalculado** quando `isCompleted` muda.
4. Renderiza `GuidedLesson` ou `ClassicLesson`, passando o resultado do `useLesson`.

O modo é por abertura da rota. A tela clássica troca de aula com `router.replace` para a mesma rota, e o estado precisa recomeçar: o componente que guarda o modo recebe `key={lessonSlug}`.

`ClassicLesson` (`src/components/lesson/ClassicLesson.tsx`) é o conteúdo atual do arquivo da rota, movido sem mudança de comportamento. A única diferença é receber por props o que hoje ele obtém chamando `useLesson`, para a aula não ser carregada duas vezes.

## Dados

- `useLesson` é a única fonte de dados do fluxo. Ele já expõe `data` (`LessonDetail`: `course`, `lesson`, `prevLesson`, `nextLesson`), `error`, `locked`, `reload`, `setCompleted` e `saveActivityProgress`.
- Nenhuma rota nova em `API_ROUTES` (`src/constants/config.ts`) e nenhuma mudança no site.
- O nome do aluno vem de `useAuth()` (`src/contexts/AuthContext.tsx`), com `getFirstName` (`src/utils/format.ts`).

## Modelo de etapas

`src/utils/lessonFlow.ts`, função pura e sem React:

```ts
export type FlowStep =
  | { kind: 'intro' }
  | { kind: 'content' }
  | { kind: 'activity'; activity: Activity; number: number; total: number };

// A lista de unidades da aula, na ordem em que o aluno passa por elas
export function getLessonFlow(lesson: Lesson): FlowStep[];
```

Regras:

- `intro` sempre existe.
- `content` existe quando `lesson.content` tem texto (depois de `trim`).
- Uma unidade `activity` por atividade de tipo `multiple_choice`, `true_or_false`, `fill_blank` ou `drag_drop`, na ordem de `lesson.activities`. O `true_or_false` foi ignorado até ganhar a tela no app, depois desta iniciativa. Atividades sem nenhum exercício (só com o enunciado no CMS) ficam de fora, senão travariam o aluno (`isPlayableActivity`, `src/utils/activityScreens.ts`). `number` e `total` contam só as atividades que entraram.
- A lista é calculada uma vez, na entrada do fluxo, e guardada. `saveActivityProgress` atualiza `lesson.activities`, e recalcular a lista a cada mudança não pode alterar a ordem nem o total no meio do fluxo.

O estado do fluxo é um índice nessa lista mais uma fase final: `index` de `0` a `steps.length - 1` e, depois, `done` (parabéns).

A barra de progresso mostra `index / steps.length` enquanto o aluno está numa unidade e `1` no parabéns. Na primeira unidade ela começa vazia.

## Componentes

Pasta nova `src/components/lesson-flow/`:

| Arquivo                | Papel                                                                   | Fase |
| ---------------------- | ----------------------------------------------------------------------- | ---- |
| `GuidedLesson.tsx`     | Dono do estado do fluxo; monta cabeçalho, a unidade atual e o rodapé    | 01   |
| `FlowHeader.tsx`       | Botão de fechar e barra de progresso animada                            | 01   |
| `FlowFooter.tsx`       | Rodapé fixo com o botão "Continuar", respeitando a área segura inferior | 01   |
| `IntroStep.tsx`        | Vídeo (se houver), título e descrição                                   | 01   |
| `ContentStep.tsx`      | Texto da aula                                                           | 01   |
| `ActivityStep.tsx`     | Uma atividade, com o aviso de resultado que libera o "Continuar"        | 01   |
| `Congratulations.tsx`  | Tela de parabéns                                                        | 02   |
| `Confetti.tsx`         | Animação de confete                                                     | 02   |
| `DiscussionsSheet.tsx` | Painel inferior com as discussões da aula                               | 02   |

Reaproveitados **sem alteração**:

- `LessonMedia` (`src/components/lesson/LessonMedia.tsx`): vídeo do Veed ou apresentação do Canva; devolve `null` quando a aula não tem nenhum dos dois. É a exceção ao "sem alteração": ganhou a prop opcional `onPlay`, que avisa o toque no play e libera o "Continuar" da introdução; sem a prop, como na tela clássica, nada muda.
- `HtmlContent` (`src/components/lesson/HtmlContent.tsx`): texto da aula.
- `ActivityCard`, `MultipleChoiceActivity`, `FillBlankActivity`, `DragDropActivity` e `ActivityAudioProvider` (`src/components/activity/`). As três atividades recebem `onProgress(completed)` e `onFinishedChange(finished)`; a segunda avisa quando a atividade chega ao resultado e quando o aluno recomeça.
- Depois desta iniciativa, os quatro tipos passaram a mostrar um exercício por tela, e o `ActivityCard` saiu do código. `ActivityExercises` escolhe o componente pelo tipo, na aula guiada e no modal da aula em revisão. Todos usam o topo comum (`ExerciseHeader`: progresso e o botão "Instruções", com o título e o enunciado longo da atividade), o botão "Verificar" no pé da tela e o painel de acerto ou erro (`ExerciseFeedbackSheet`) com o "Continuar". Enquanto uma atividade está em andamento, a aula guiada esconde o `FlowFooter`, que volta no placar. As frases mostram quebras de linha e `**negrito**` (`tokenizeText`, `src/utils/sentence.ts`).
  - Múltipla escolha: instrução curta conforme o arquivo do exercício (áudio, imagem ou alternativas de áudio). As regras estão em `src/utils/choice.ts`; exercícios sem alternativa correta (erro de cadastro) ficam de fora.
  - Arrastar e soltar: cada frase tem o próprio banco de opções, com as respostas dela e, até chegar a 4, respostas das outras frases como opções erradas; o toque leva a opção para a primeira lacuna vazia. Numa frase que repete uma resposta, cada opção aparece uma vez e pode ser usada em várias lacunas. As regras estão em `src/utils/dragDrop.ts`.
  - Verdadeiro ou falso: uma afirmação por tela (as alternativas de cada exercício; `isCorrect` marca as verdadeiras), com os botões "Verdadeiro" e "Falso" e o cartão "Ler o texto", que abre o enunciado da atividade (a transcrição ou o texto de leitura). As regras estão em `src/utils/trueFalse.ts`.
  - Preencher lacunas: o campo de texto fica no lugar da lacuna e abre o teclado sozinho; o Enter pula para a próxima lacuna e, na última, verifica. A conferência ignora maiúsculas e espaços nas pontas, mas não acentos, como no site.
- `LessonMaterials` (`src/components/lesson/LessonMaterials.tsx`) e `LessonDiscussions` (`src/components/lesson/LessonDiscussions.tsx`, recebe `lessonId`).
- `Button` com `size="lg"` (`src/components/Button.tsx`).

`LessonActivities` e `LessonContent` **não** são usados no fluxo: o primeiro tem introdução, resumo e "pular", e o segundo traz o botão de marcar como concluída. Eles continuam servindo à tela clássica, onde `LessonActivities` abre as atividades num modal de tela cheia, sem as abas da aula.

## Volta ao Aprender

O parabéns sai do fluxo navegando para a aba Aprender com dois parâmetros de rota:

| Parâmetro   | Valor                  |
| ----------- | ---------------------- |
| `course`    | `slug` do curso        |
| `completed` | `id` da aula concluída |

A navegação precisa **desempilhar** a tela de aula, e não empilhar uma segunda aba por cima: o voltar do Android, já no Aprender, não pode reabrir a aula. No Expo Router isso é `router.dismissTo`; confira a assinatura nos tipos do SDK 57 antes de usar, como pede o `CLAUDE.md`.

A aba Aprender lê os parâmetros, age (fase 03) e os limpa com `router.setParams`, para a animação não repetir quando a aba voltar ao foco.

## Visual

Identidade atual do app: fundo `bg-background`, verde da marca, Poppins (uma família por peso), cantos `rounded-2xl`, botões principais `h-14`. Separação por borda; não use sombras pequenas. Textos em português.

A referência visual é uma tela de aula em etapas de outro aplicativo: fechar à esquerda, barra de progresso ocupando o resto do topo, conteúdo no meio e um botão largo fixo embaixo. Os itens dela que o app não tem (menu de três pontos, favoritar) ficam de fora.

## Restrições

- Nenhuma biblioteca nova. Animação com `react-native-reanimated`, som com `expo-audio`, ambos já em `package.json`. Qualquer pacote com código nativo exigiria novo development build e precisa ser combinado antes.
- Sons ficam em `assets/sounds/`; `global.d.ts` já declara o módulo `*.wav`.
