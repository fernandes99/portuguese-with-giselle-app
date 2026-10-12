# 02. Parabéns

- **Status:** em andamento
- **Depende de:** [01-lesson-flow](01-lesson-flow.md)

## Contexto

Ao fim da fase 01, concluir a aula no fluxo guiado só fecha a tela. Esta fase coloca no lugar a tela de parabéns: a comemoração, os recursos da aula, o acesso às discussões e o "Continuar" que leva à aba Aprender.

## Escopo

- Tela de parabéns como fase final de `GuidedLesson`.
- Animação de confete e som ao entrar.
- Recursos da aula e painel de discussões.
- Saída para a aba Aprender com os parâmetros `course` e `completed`.
- Arquivo de som e o script que o gera.

## Fora do escopo

- O que a aba Aprender faz com os parâmetros (fase 03). Ao fim desta fase ela apenas abre.
- Pontos, conquistas ou sequência de dias.
- Sugerir ou abrir a próxima aula direto do parabéns.

## Requisitos

- **RF-01:** Depois que `setCompleted(true)` dá certo na última unidade, o fluxo mostra o parabéns no lugar das etapas. A barra de progresso fica cheia.
- **RF-02:** O título é "Muito bem, {nome}!", com o primeiro nome do aluno, e o texto é "Você completou a aula." Sem nome no cadastro, o título é "Muito bem!".
- **RF-03:** Abaixo do texto aparece o título da aula concluída.
- **RF-04:** Ao entrar, toca uma animação de confete, uma vez, com duração entre 2 e 3 segundos, sem bloquear os toques na tela.
- **RF-05:** Ao entrar, toca o som de conclusão, uma vez. Com o aparelho no silencioso o som não toca, e isso não gera erro nem aviso.
- **RF-06:** Se o sistema estiver com "reduzir movimento" ligado, o confete não é exibido; o som e o resto da tela permanecem.
- **RF-07:** A tela mostra os recursos da aula com `LessonMaterials`. Quando a aula não tem recursos, a seção inteira não aparece.
- **RF-08:** O botão "Ver discussões da aula" abre um painel inferior com `LessonDiscussions` da aula, onde o aluno pode ler e escrever. Fechar o painel volta ao parabéns.
- **RF-09:** O "Continuar" fica fixo no rodapé e leva à aba Aprender, passando `course` (slug do curso) e `completed` (id da aula), desempilhando a tela de aula.
- **RF-10:** No parabéns não há botão de fechar nem confirmação de saída. O voltar do Android faz o mesmo que o "Continuar".
- **RF-11:** O som fica em `assets/sounds/lesson-complete.wav` e pode ser trocado por outro arquivo com o mesmo nome, sem mudança de código.

## Critérios de aceite

- [ ] Concluir a última unidade mostra o parabéns com o primeiro nome do aluno.
- [ ] O confete e o som tocam uma vez ao entrar e não repetem ao abrir e fechar o painel de discussões.
- [ ] Com falha na gravação da conclusão, o parabéns não aparece (comportamento da fase 01 mantido).
- [ ] Aula com recursos mostra a lista, e um arquivo abre ao toque; aula sem recursos não mostra a seção.
- [ ] O painel de discussões lista as mensagens da aula e permite enviar uma nova.
- [ ] "Continuar" abre a aba Aprender, e o voltar do Android, já no Aprender, não reabre a aula.
- [ ] O voltar do Android no parabéns leva ao Aprender, sem pedir confirmação.
- [ ] Com "reduzir movimento" ligado no sistema, a tela aparece sem confete.

## Desenho técnico

**Criar**

- `src/components/lesson-flow/Congratulations.tsx`: recebe `lesson`, `courseSlug` e `onContinue`. Usa `useAuth()` e `getFirstName` (`src/utils/format.ts`).
- `src/components/lesson-flow/Confetti.tsx`: peças coloridas (verde da marca e cores de apoio de `src/constants/theme.ts`) caindo, com `react-native-reanimated`, numa camada com `pointerEvents="none"`. Consulta `useReducedMotion` do Reanimated.
- `src/components/lesson-flow/DiscussionsSheet.tsx`: `Modal` que sobe da barra inferior, no padrão de `src/components/lesson/CourseOutlineSheet.tsx`, com `LessonDiscussions` dentro e ajuste para o teclado.
- `assets/sounds/lesson-complete.wav`: acorde ascendente curto (cerca de 1,5 s), mono, 44,1 kHz, 16 bits.
- `scripts/generate-lesson-complete-sound.js`: script Node, sem dependências, que escreve o arquivo acima somando senoides com decaimento. Fica versionado para o som poder ser regerado ou ajustado.

**Alterar**

- `src/components/lesson-flow/GuidedLesson.tsx`: a fase `done` renderiza `Congratulations`; o fim com `router.back()` da fase 01 sai. A saída usa `router.dismissTo` para a aba Aprender, conforme "Volta ao Aprender" em `architecture.md`. O bloqueio de saída com confirmação deixa de valer nessa fase.

**Reaproveitar**

- O som toca com `useAudioPlayer` de `expo-audio`, como em `src/components/activity/ActivityResult.tsx`, que já toca `assets/sounds/success.wav`. São sons diferentes de propósito: o de acerto numa atividade é curto, o de conclusão da aula é mais marcante.
- `LessonMaterials` já traz o próprio `ActivityAudioProvider` e o título "Recursos da aula".

## Verificação

```bash
node scripts/generate-lesson-complete-sound.js
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho: percorrer os critérios de aceite. Ouvir o som com o volume de mídia alto e conferir que não distorce nem corta. Testar o painel de discussões com o teclado aberto.

## Tarefas

- [x] Escrever o script e gerar `lesson-complete.wav`.
- [x] `Confetti`.
- [x] `Congratulations` com título, som e confete.
- [x] Recursos da aula.
- [x] `DiscussionsSheet` e o botão que o abre.
- [x] Trocar o fim do fluxo pela navegação para o Aprender e tratar o voltar do Android.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
