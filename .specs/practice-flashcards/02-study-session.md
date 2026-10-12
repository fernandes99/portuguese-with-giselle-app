# 02. Sessão de estudo

- **Status:** concluída
- **Depende de:** `01-flashcards-list` e as rotas do conjunto e do registro no ar (fase `01-flashcards-api` do site)

## Contexto

A fase 01 lista os conjuntos. Esta fase entrega o estudo em si: o aluno vira cada card e responde se aprendeu. É a parte que precisa ser fluida; o estado e a pilha de cards estão em `architecture.md`.

## Escopo

- Tela que carrega o conjunto e abre a sessão.
- Card com virar, arrastar e sair animados.
- Botões de resposta, contadores e barra da rodada.
- Registro da resposta no backend.
- Resumo do fim da rodada.

## Fora do escopo

- Áudio, favoritos e desfazer a última resposta.
- Embaralhar os cards.
- Zerar o progresso.

## Requisitos

- **RF-01:** A tela tem o cabeçalho de voltar com o título do conjunto. Enquanto carrega, mostra o indicador verde; em erro (inclusive conjunto inexistente), a mensagem e "Tentar de novo".
- **RF-02:** A primeira rodada traz, na ordem do conjunto, os cards com situação diferente de `learned`.
- **RF-03:** Cada card começa pelo lado indicado em `isShowFront`. A frente é azul e o verso é verde, com o texto em branco e centralizado, e "Toque para virar" embaixo.
- **RF-04:** Tocar no card o vira, com um giro de cerca de 0,3 s. Tocar de novo volta ao lado anterior.
- **RF-05:** O lado com imagem mostra a imagem inteira (sem cortar) no lugar do texto.
- **RF-06:** O texto diminui conforme o tamanho: 32 até 24 caracteres, 24 até 80 e 18 acima disso.
- **RF-07:** Arrastar o card para os lados o move junto com o dedo, com uma leve inclinação. Conforme ele anda, aparece o selo "Aprendi" (para a direita) ou "Ainda aprendendo" (para a esquerda).
- **RF-08:** Soltar o card depois de 28% da largura da tela, ou num arrasto rápido para aquele lado, conta como resposta: o card sai da tela. Soltar antes disso o devolve ao centro.
- **RF-09:** Um arrasto mais vertical que horizontal não move o card.
- **RF-10:** Abaixo do card há dois botões redondos: laranja com `close` ("Ainda aprendendo") e verde com `checkmark` ("Aprendi"). Tocar num deles tira o card pelo mesmo lado e com a mesma animação do arrasto.
- **RF-11:** O card seguinte já aparece embaixo do atual, um pouco menor, e cresce até o lugar dele quando o atual sai. Não há carregamento entre um card e outro.
- **RF-12:** A resposta é enviada ao backend sem bloquear a tela: "aprendi" como `learned: true`, "ainda aprendendo" como `learned: false`.
- **RF-13:** Se algum envio falhar, aparece o aviso "Algumas respostas não foram salvas. Verifique sua internet.", e a sessão continua.
- **RF-14:** No topo ficam os contadores "Aprendendo" (laranja) e "Aprendi" (verde), com o total do conjunto inteiro, atualizados a cada resposta.
- **RF-15:** Abaixo dos contadores, "Card X de N" e a barra, que mostram a posição na rodada.
- **RF-16:** Respondido o último card da rodada, entra o resumo. Com cards ainda não aprendidos: "Rodada concluída", "Você já aprendeu X de N cards." e os botões "Continuar com N cards" (nova rodada com os que faltam), "Revisar todos os cards" e "Voltar aos flashcards".
- **RF-17:** Sem cards a aprender: "Você aprendeu todos os cards!", "Revise quando quiser para não esquecer." e os botões "Revisar todos os cards" e "Voltar aos flashcards". Um conjunto já todo aprendido abre direto nesse resumo.
- **RF-18:** "Revisar todos os cards" começa uma rodada com o conjunto inteiro. Responder "ainda aprendendo" a um card já aprendido volta o card para "aprendendo", como no site.
- **RF-19:** Conjunto sem cards mostra "Nenhum card disponível" e "Este flashcard não possui cards ainda", os textos do site.
- **RF-20:** Dois toques seguidos no mesmo botão respondem um card só.
- **RF-21:** Com "reduzir movimento" ligado no aparelho, o giro e a saída acontecem sem animação.
- **RF-22:** Para o leitor de tela, o card de cima é um botão que lê o lado visível e vira ao ser ativado; o card de baixo fica escondido. Os dois botões de resposta têm rótulo.

## Critérios de aceite

- [ ] Abrir um conjunto mostra o primeiro card não aprendido, pelo lado configurado no DatoCMS.
- [ ] Tocar vira o card; tocar de novo desvira.
- [ ] Arrastar para a direita até o fim marca "aprendi": o contador verde sobe e o próximo card assume, sem espera.
- [ ] Arrastar um pouco e soltar devolve o card ao centro, sem resposta.
- [ ] Os botões fazem o mesmo que o arrasto, com a mesma animação.
- [ ] Trinta respostas seguidas, rápidas, não travam nem pulam card.
- [ ] No fim da rodada aparece o resumo; "Continuar com N cards" traz só os que ficaram como "ainda aprendendo".
- [ ] Um card marcado "aprendi" no app some da sessão do mesmo conjunto no site.
- [ ] Em modo avião, as respostas seguem e o aviso de não salvo aparece.
- [ ] Um conjunto todo aprendido abre no resumo, e "Revisar todos os cards" funciona.
- [ ] Card com imagem mostra a imagem inteira.
- [ ] No Android e no iOS, o giro não mostra o texto espelhado.

## Desenho técnico

**Criar**

- `src/hooks/useFlashcard.ts`: carga do conjunto, como `src/hooks/useLesson.ts` (uma vez por abertura, `401` encerra a sessão).
- `src/hooks/useFlashcardSession.ts`: o estado descrito em `architecture.md`.
- `src/components/flashcards/StudyCard.tsx`: o card. `Gesture.Pan` e `Gesture.Tap` em `Gesture.Race`; a saída chama `onAnswer` por `scheduleOnRN` (`react-native-worklets`) quando a animação termina.
- `src/components/flashcards/StudySession.tsx`: contadores, barra, pilha e botões.
- `src/components/flashcards/StudySummary.tsx`: o resumo.
- `src/app/(app)/practice/flashcards/[slug].tsx`: a tela.

**Alterar**

- `src/utils/flashcards.ts`: `getCardsToStudy`, `countByStatus`, `getCardFontSize` e `getSideLabel`.

**Notas**

- Cada lado do card gira meia volta e fica com opacidade zero depois de passar do perfil. Assim o verso não aparece espelhado, sem depender de `backfaceVisibility`, que se comporta diferente entre Android e iOS.
- O toque para virar roda na thread do JavaScript (`runOnJS(true)`), porque muda um estado do React usado no rótulo de acessibilidade. O arrasto roda inteiro fora dela.
- A sessão recebe `key` com o id do conjunto, para um conjunto novo não herdar o estado do anterior.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar: percorrer os critérios de aceite, no Android e no iOS. As respostas gravam progresso real na conta usada.

## Tarefas

- [x] `useFlashcard` e a tela do conjunto.
- [x] `useFlashcardSession`.
- [x] `StudyCard`, com virar, arrastar e sair.
- [x] `StudySession`, com contadores, barra, pilha e botões.
- [x] Registro da resposta e aviso de falha.
- [x] `StudySummary` e as novas rodadas.
- [x] Conferir no aparelho (feito pelo dono do projeto).
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
