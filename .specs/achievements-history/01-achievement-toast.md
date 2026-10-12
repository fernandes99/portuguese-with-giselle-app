# 01. Aviso de conquista

- **Status:** concluída
- **Depende de:** rotas do backend devolvendo `unlockedAchievements` (fase `01-achievement-engine` do site)

## Contexto

O backend passou a devolver, na resposta das rotas, as conquistas que o aluno acabou de desbloquear. Esta fase faz o app reagir a isso em qualquer tela. O caminho da resposta até o aviso está em `architecture.md`.

## Escopo

- Leitura de `unlockedAchievements` no cliente HTTP.
- Aviso animado no topo da tela.
- Som de conquista.

## Fora do escopo

- Tocar no aviso, tela de detalhe e histórico de avisos.
- Notificação com o app fechado.
- Opção de silenciar.

## Requisitos

- **RF-01:** Quando uma resposta de sucesso do backend traz `unlockedAchievements` com itens, o app mostra um aviso para cada conquista, sem a tela que fez a chamada precisar fazer nada.
- **RF-02:** O aviso aparece no topo, abaixo da área segura, por cima de qualquer tela da área logada (abas, aula, chat, flashcards, histórico).
- **RF-03:** O aviso tem fundo escuro, um troféu num círculo laranja, o texto "Conquista desbloqueada!", o título da conquista em destaque e a descrição em até duas linhas.
- **RF-04:** Ele entra descendo de fora da tela, com um leve quique, fica parado por cerca de 2,6 s e sai subindo e sumindo.
- **RF-05:** Ao entrar, toca o som de conquista uma vez.
- **RF-06:** Com mais de uma conquista, elas aparecem uma de cada vez, na ordem recebida, cada uma com o som.
- **RF-07:** Uma conquista com o mesmo código de outra que já está na fila não entra de novo.
- **RF-08:** O aviso não captura toques: o aluno continua usando a tela por baixo.
- **RF-09:** Com "reduzir movimento" ligado, o aviso aparece e some no lugar, só com a mudança de opacidade.
- **RF-10:** Para o leitor de tela, o aviso é anunciado como "Conquista desbloqueada: {título}".
- **RF-11:** O som é `assets/sounds/achievement.wav`, uma fanfarra curta (três notas rápidas subindo e um acorde agudo), gerada por `scripts/generate-achievement-sound.js`.

## Critérios de aceite

- [ ] Concluir a primeira aula numa conta nova mostra o aviso da primeira aula, com som, sobre a tela de parabéns.
- [ ] Acertar a primeira atividade mostra o aviso no meio da aula, sem travar a tela.
- [ ] Publicar o primeiro comentário mostra o aviso.
- [ ] Duas conquistas na mesma ação aparecem uma depois da outra.
- [ ] Durante o aviso, os botões da tela continuam respondendo.
- [ ] O aviso some sozinho e não reaparece ao voltar à tela.
- [ ] Com o aparelho no silencioso, o aviso aparece sem som e sem erro.
- [ ] A conquista aparece como desbloqueada na aba Progresso.

## Desenho técnico

**Criar**

- `scripts/generate-achievement-sound.js` e o arquivo que ele gera, `assets/sounds/achievement.wav`.
- `src/components/AchievementToast.tsx`: a fila em estado do React, a animação com `react-native-reanimated` e o som com `useAudioPlayer`.

**Alterar**

- `src/lib/api.ts`: o tipo `UnlockedAchievement`, `setAchievementHandler` e a leitura do campo depois de uma resposta de sucesso.
- `src/app/(app)/_layout.tsx`: a pilha de telas e o aviso dentro de uma `View`.
- `CLAUDE.md`: o aviso e de onde ele vem.

**Notas**

- A fila avança quando a animação de saída termina (`scheduleOnRN`, de `react-native-worklets`), não por temporizador, para o aviso seguinte nunca atropelar o anterior.
- O efeito que dispara a animação depende do código da conquista da vez; o `player` recomeça do zero (`seekTo(0)`) a cada aviso.
- O aviso só existe na área logada. Nenhuma rota de login devolve conquistas.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar: percorrer os critérios de aceite. Para repetir um aviso é preciso apagar a conquista da conta no banco.

## Tarefas

- [x] Script e arquivo do som.
- [x] `setAchievementHandler` e a leitura do campo em `api()`.
- [x] `AchievementToast`, com fila, animação e som.
- [x] Aviso montado no layout da área logada.
- [x] Atualizar o `CLAUDE.md`.
- [x] Conferir no aparelho (feito pelo dono do projeto).
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
