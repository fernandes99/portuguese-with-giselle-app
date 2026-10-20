# 03. Aviso de desvio e resumo da interrupção

- **Status:** em andamento
- **Depende de:** [02](02-simulation-screen.md); fase 03 de `.specs/simulations/` do site no ar

## Contexto

O backend passou a contar os desvios do aluno (ir contra uma tarefa, sair do assunto da cena ou escrever em outro idioma) e a interromper a simulação no terceiro (fase 03 do site). O turno traz `goalReminder` quando houve um desvio e a simulação continua, e `endReason` quando ela acaba.

## Escopo

- O aviso de desvio por cima da conversa.
- O número de avisos na faixa das tarefas.
- O resumo da simulação interrompida.

## Requisitos

- **RF-01:** com `goalReminder`, a tela mostra um aviso por cima da conversa (`GoalReminder`), com o título do tipo ("Lembre-se da sua tarefa", "Volte para a cena" ou "Fale em português"), a frase do backend (ou um texto padrão, sem ela), a tarefa contrariada (ou as que faltam, nos outros tipos), "Aviso 1 de 2. Na 3ª vez, a simulação é interrompida." (no segundo, "No próximo, a simulação é interrompida.") e o botão "Entendi".
- **RF-01a:** cada aviso novo toca um som curto de atenção, `assets/sounds/warning.wav` (duas notas descendo, cerca de meio segundo), gerado por `scripts/generate-warning-sound.js`, como os outros sons do app. Pedido do dono do projeto.
- **RF-02:** com o aviso aberto, a voz automática da fala da personagem espera o aluno fechar.
- **RF-03:** com algum desvio, a faixa das tarefas mostra "1 aviso" ou "2 avisos".
- **RF-04:** com `endReason` `DEVIATIONS`, o resumo abre com "Simulação interrompida" e "A conversa parou porque você saiu das suas tarefas. Veja o que melhorar.", seguido do comentário do backend, das tarefas e das frases para revisar.

## Critérios de aceite

- [ ] Pagar em dinheiro mostra o aviso com a tarefa "Diga que quer pagar com cartão." e "Aviso 1 de 2".
- [ ] O aviso toca o som de atenção, também no segundo.
- [ ] A fala da personagem toca depois de "Entendi".
- [ ] A faixa mostra "1 aviso" depois do primeiro.
- [ ] No terceiro desvio, o resumo abre com "Simulação interrompida" e o comentário cita o que o aluno fez.

## Desenho técnico

- `src/services/simulations.ts`: os tipos `SimulationGoalReminder`, `SimulationDeviationKind` e `SimulationEndReason`, e os campos novos do começo e do turno.
- `src/hooks/useSimulation.ts`: `goalReminder`, `dismissReminder`, `deviationCount` e `endReason`.
- `src/components/simulations/GoalReminder.tsx` (novo): o aviso, num `Modal` transparente, com o som tocado por `useAudioPlayer`, como em `ExerciseFeedbackSheet`.
- `scripts/generate-warning-sound.js` (novo) e o arquivo que ele gera, `assets/sounds/warning.wav`.
- `TaskStrip` (prop `warnings`), `SimulationSummary` (prop `endReason`) e `src/app/(app)/practice/simulations/[id].tsx`.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- No aparelho, com o backend da fase 03 no ar: os critérios de aceite acima.

## Tarefas

- [x] Tipos, serviço e hook.
- [x] `GoalReminder`, avisos na faixa e o resumo da interrupção.
- [ ] Teste no aparelho.
