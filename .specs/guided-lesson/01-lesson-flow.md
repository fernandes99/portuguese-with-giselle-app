# 01. Fluxo da aula

- **Status:** em andamento
- **Depende de:** aba Aprender implementada

## Contexto

Hoje a rota `/lesson/[courseSlug]/[lessonSlug]` sempre mostra a tela com abas. Esta fase cria o fluxo guiado e faz a rota escolher entre os dois. Ao fim dela, uma aula não concluída já pode ser feita em etapas e marcada como concluída; o parabéns e a volta animada ao Aprender vêm nas fases 02 e 03.

## Escopo

- Mover a tela atual para `ClassicLesson` e transformar o arquivo da rota na escolha entre as duas telas.
- `GuidedLesson` com cabeçalho, barra de progresso, rodapé fixo e as partes de introdução, conteúdo e atividades.
- Confirmação ao sair no meio.
- Gravação da conclusão da aula ao fim da última parte.

## Fora do escopo

- Tela de parabéns, animação de confete e som (fase 02).
- Navegação para a aba Aprender e animação de desbloqueio (fase 03).
- Qualquer mudança visual ou de comportamento na tela clássica.

## Requisitos

- **RF-01:** Ao abrir uma aula com `lesson.isCompleted` falso, o app mostra o fluxo guiado. Com `isCompleted` verdadeiro, mostra a tela clássica.
- **RF-02:** A regra vale para qualquer entrada: aba Aprender, aba Cursos, Dashboard, tela do curso e troca de aula por dentro da tela clássica.
- **RF-03:** A escolha é feita uma vez por abertura. Concluir a aula dentro do fluxo guiado, ou desmarcar a conclusão dentro da tela clássica, não troca a tela.
- **RF-04:** Aula exclusiva para alunos (resposta 403), erro de carregamento e carregamento continuam com as mesmas mensagens de hoje, antes de qualquer etapa.
- **RF-05:** O topo do fluxo tem um botão de fechar à esquerda e uma barra de progresso que ocupa o resto da largura.
- **RF-06:** A barra mostra `index / total` de unidades, conforme `architecture.md`, e a mudança de valor é animada.
- **RF-07:** Introdução: `LessonMedia` (some quando a aula não tem vídeo nem apresentação), o título e a descrição da aula. Quando a aula tem vídeo ou apresentação, o "Continuar" começa desabilitado e habilita quando o aluno toca no play; não é preciso assistir até o fim. Sem vídeo nem apresentação, o botão fica sempre habilitado. (Decisão do dono do projeto, depois da primeira implementação.)
- **RF-08:** Conteúdo: o texto da aula com `HtmlContent`, com rolagem. "Continuar" sempre habilitado. A parte não existe quando a aula não tem `content`.
- **RF-09:** Atividades: uma por tela, dentro de `ActivityCard`, com o indicador "Atividade N de T". A parte não existe quando a aula não tem atividades dos tipos suportados.
- **RF-10:** Numa atividade, o "Continuar" fica desabilitado até a atividade avisar que chegou ao resultado (`onFinishedChange(true)`), acertando ou errando. Se o aluno recomeçar a atividade (`onFinishedChange(false)`), o botão volta a ficar desabilitado. Não existe "pular".
- **RF-11:** O progresso de cada atividade é salvo com `saveActivityProgress`, como na tela clássica.
- **RF-12:** O "Continuar" fica fixo no rodapé, acima da área segura inferior, e o conteúdo rola por trás sem ficar coberto.
- **RF-12a:** O "Continuar" desabilitado é cinza claro com texto cinza escuro e responde ao toque com um aviso rápido logo acima do rodapé, que some sozinho em cerca de 2 segundos e não pede ação (`FlowToast`, não um `Alert`): "Inicie o vídeo da aula para continuar." na introdução e "Conclua a atividade para continuar." nas atividades. (Decisão do dono do projeto, depois da primeira implementação.)
- **RF-12b:** Na aba Aprender, tocar numa aula concluída abre, abaixo dela, um cartão com "Revisar" (tela clássica) e "Recomeçar lição" (fluxo guiado, pela rota com o parâmetro `restart=1`). Um segundo toque na aula fecha o cartão. Ao recomeçar, nada desfaz o progresso: a conclusão da aula não é regravada, um erro numa atividade não tira a conclusão que ela já tem, e a volta ao Aprender não leva o parâmetro `completed`, então não há animação de desbloqueio. (Decisão do dono do projeto, depois da primeira implementação.)
- **RF-13:** Ao trocar de unidade, a rolagem volta ao topo.
- **RF-14:** Na última unidade, "Continuar" chama `setCompleted(true)`. Durante a gravação o botão mostra que está ocupado e não aceita outro toque. Se falhar, aparece "Erro ao concluir a aula. Tente novamente." acima do botão e o aluno pode tentar de novo.
- **RF-15:** Nesta fase, depois de gravar a conclusão, o fluxo fecha com `router.back()`. A fase 02 troca esse fim pelo parabéns.
- **RF-16:** O botão de fechar e o voltar do Android, antes da conclusão, abrem a confirmação "Sair da aula?" com o texto "Você vai recomeçar esta aula do início na próxima vez." e as ações "Continuar na aula" e "Sair". Sair fecha a tela sem marcar a aula.
- **RF-17:** Reabrir uma aula abandonada recomeça da introdução. As atividades já respondidas continuam registradas no backend.
- **RF-18:** Não há botão de voltar para a unidade anterior.

## Critérios de aceite

- [ ] Aula não concluída abre o fluxo guiado a partir do Aprender, de Cursos e do "Continuar" do Dashboard.
- [ ] Aula concluída abre a tela clássica, idêntica à de antes desta fase.
- [ ] Aula com vídeo, conteúdo e 3 atividades tem 5 unidades; a barra passa por 0, 1/5, 2/5, 3/5 e 4/5 e a aula conclui no quinto "Continuar".
- [ ] Aula com vídeo: "Continuar" da introdução só habilita depois do toque no play.
- [ ] Aula sem vídeo mostra a introdução só com título e descrição, com "Continuar" habilitado.
- [ ] Aula sem conteúdo vai da introdução direto para a primeira atividade.
- [ ] Aula sem atividades conclui no "Continuar" da última parte que tiver.
- [ ] Numa atividade, "Continuar" só habilita depois do resultado, inclusive quando a resposta está errada.
- [ ] Depois de concluir, a aula aparece como concluída no Aprender e reabre na tela clássica.
- [ ] Fechar no meio pede confirmação; "Sair" não marca a aula como concluída.
- [ ] O voltar do Android no meio do fluxo pede a mesma confirmação.
- [ ] Aula exclusiva para alunos, aberta por um aluno gratuito, mostra "Conteúdo exclusivo para alunos".
- [ ] Na tela clássica, trocar para uma aula não concluída pela lista de aulas abre o fluxo guiado dessa aula.

## Desenho técnico

**Criar**

- `src/utils/lessonFlow.ts`: `FlowStep` e `getLessonFlow`, como em `architecture.md`.
- `src/components/lesson/ClassicLesson.tsx`: o corpo atual de `LessonScreen`, a partir de `const { course, lesson, nextLesson } = data`, com seus estados (`activeTab`, `isOutlineOpen`, `isSaving`, `actionError`), o gesto de trocar de aba e `HeaderButton`. Recebe `courseSlug`, `lessonSlug`, `data`, `setCompleted` e `saveActivityProgress` por props.
- `src/components/lesson-flow/GuidedLesson.tsx`, `FlowHeader.tsx`, `FlowFooter.tsx`, `IntroStep.tsx`, `ContentStep.tsx`, `ActivityStep.tsx`.

**Alterar**

- `src/app/(app)/lesson/[courseSlug]/[lessonSlug].tsx`: fica com `useLesson`, os estados sem dados (carregando, erro, 403) e a escolha do modo. O cabeçalho com o botão de voltar desses estados permanece aqui.

**Notas**

- `ActivityStep` envolve a atividade em `ActivityAudioProvider` com `key={activity.id}`, como `LessonActivities` faz, para o áudio de uma atividade não vazar para a seguinte.
- A barra animada é um componente do fluxo (`FlowHeader`), feito com `react-native-reanimated`. `src/components/ProgressBar.tsx` não muda, porque é usado em outras telas.
- Para interceptar o voltar do Android, use o mecanismo de bloqueio de remoção da navegação (`usePreventRemove` ou o evento `beforeRemove`); confira qual o Expo Router do SDK 57 expõe. A confirmação é um `Alert` nativo.
- O botão de fechar tem `accessibilityLabel="Sair da aula"`; a barra tem `accessibilityRole="progressbar"` com `accessibilityValue`.

**Divergências na implementação**

- O voltar do Android é tratado com `BackHandler` dentro de `useFocusEffect`, e o gesto de voltar do iOS é desligado na tela com `gestureEnabled: false`. O `usePreventRemove` não é exportado pelo pacote `expo-router` do SDK 57, e as duas medidas juntas cobrem os mesmos casos.
- O cabeçalho com o botão de voltar virou o componente `LessonHeader`, exportado de `ClassicLesson.tsx`, porque a rota (estados sem dados) e a tela clássica usam o mesmo.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho: percorrer os critérios de aceite com uma aula completa (vídeo, conteúdo e atividades) e, se o Dato tiver, uma aula sem vídeo e uma sem atividades. Conferir a tela clássica numa aula concluída, aba por aba, para garantir que mover o código não mudou nada.

## Tarefas

- [x] Criar `src/utils/lessonFlow.ts`.
- [x] Mover a tela atual para `ClassicLesson.tsx` e ligar a rota a ela, ainda sem o fluxo novo; conferir que nada mudou.
- [x] Adicionar a escolha do modo na rota.
- [x] `FlowHeader` e `FlowFooter`.
- [x] `IntroStep` e `ContentStep`.
- [x] `ActivityStep` com o bloqueio do "Continuar".
- [x] Conclusão da aula e tratamento de erro.
- [x] Confirmação ao sair, no botão e no voltar do Android.
- [x] Atualizar o `CLAUDE.md` do app (seção "Estrutura") com as duas telas de aula e a regra de escolha.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
