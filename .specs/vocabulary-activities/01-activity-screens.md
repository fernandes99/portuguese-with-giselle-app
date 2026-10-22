# 01. A atividade de vocabulário nas aulas

- **Status:** concluída
- **Depende de:** as fases 01 e 02 do site (`.specs/vocabulary-activities/` de lá)

## Contexto

Depois da fase 02 do site, a rota da aula devolve a atividade de vocabulário com `type: 'vocabulary'`, `exerciseTypes` (os tipos marcados) e `questions`; cada pergunta traz o próprio `exerciseType`. O formato está na seção "Formato" do `architecture.md` do site, e a fila, na seção "Fila".

Hoje, cada atividade do app tem um componente próprio, escolhido por `ActivityExercises` (`src/components/activity/ActivityExercises.tsx`), que segue o mesmo padrão:

- uma pergunta por tela, com `ExerciseHeader` no topo;
- `ActivityCheck` no rodapé, com o botão "Verificar";
- `ExerciseFeedbackSheet` para o acerto ou o erro;
- `ActivityResult` no fim, com o placar e "Tentar de novo".

Os dois callbacks da atividade, `onProgress(completed)` e `onFinishedChange(finished)`, avisam a aula.

## Escopo

- O tipo `VocabularyActivity` no contrato.
- O componente `VocabularyActivity`, com a fila e as quatro formas de pergunta.
- O ramo novo no `ActivityExercises`.

## Fora do escopo

- Mudanças nas outras atividades.
- Lista de atividades fora da aula.

## Requisitos

### Geral

- **RF-01:** `ActivityExercises` mostra `VocabularyActivity` quando `activity.type === 'vocabulary'`, com os mesmos `onProgress` e `onFinishedChange`.
- **RF-02:** a fila segue a seção "Fila" do `architecture.md` do site:
  - `onProgress(false)` vai na primeira resposta;
  - `onProgress(true)` vai quando a fila acaba, mesmo com itens pulados;
  - `onFinishedChange` avisa a chegada ao placar e o recomeço.
- **RF-03:** o topo usa `ExerciseHeader`, com o título e as instruções da atividade, e mostra o texto do tipo da pergunta da tela (a atividade pode misturar tipos) e o progresso (itens resolvidos sobre o total):

| Tipo              | Texto do topo                     |
| ----------------- | --------------------------------- |
| `meaning_choice`  | Escolha o significado             |
| `term_choice`     | Escolha a palavra                 |
| `listen_choice`   | Ouça e escolha a palavra          |
| `listen_write`    | Ouça e escreva o que ouviu        |
| `translate_write` | Escreva em português              |
| `match_pairs`     | Ligue os pares                    |
| `listen_example`  | Ouça a frase e escolha a tradução |
| `speak`           | Fale a palavra                    |

- **RF-04:** o retorno usa `ExerciseFeedbackSheet`, aberto pelo `VocabularyActivity` (como na múltipla escolha, o painel desce enquanto a próxima pergunta aparece). No erro, ele mostra "Resposta certa:" com o termo, o significado e o botão de ouvir a palavra (`AudioButton`) quando há áudio; em `listen_example`, também o exemplo e a tradução. No acerto, só "Correto!", como nas outras atividades. Na fala, o painel mostra "O que ouvimos:" com as palavras trocadas.
- **RF-05:** o placar usa `ActivityResult`, com os itens acertados de primeira sobre o total (`unit="de primeira"`) e a prop nova `message` ("Atividade concluída."), que troca o texto de baixo sem mudar as outras atividades. "Tentar de novo" recomeça a fila como diz a seção "Fila" do site.
- **RF-06:** a atividade sem perguntas fica fora da aula, como as outras atividades sem nada para responder (`isPlayableActivity`, `src/utils/activityScreens.ts`). O `EmptyState` com "Esta atividade ainda não está disponível." fica só como reserva, e não chama `onProgress`.

### Por forma de pergunta

- **RF-07:** **escolha:**
  - a pergunta mostra o `prompt.text` em destaque e, quando há `prompt.audioUrl`, o `AudioButton`. O áudio toca sozinho ao abrir quando o tipo é de ouvir (ver "Formato" no `architecture.md` do site), com `useActivityAudio`, como na múltipla escolha;
  - as opções usam os estilos de `ChoiceAlternatives` (`ALTERNATIVE_STYLES`);
  - "Verificar" fica desligado até uma opção ser escolhida.
- **RF-08:** **escrita:**
  - um `TextInput` com o placeholder "Escreva em português", `autoCorrect={false}`, `autoCapitalize="none"` e `autoComplete="off"`;
  - "Verificar" fica desligado com o campo vazio, e o botão de enviar do teclado confere;
  - a conferência usa `normalizeAnswer`, em `src/utils/vocabularyActivity.ts`, com as regras do site.
- **RF-09:** **pares:**
  - duas colunas, as palavras à esquerda e os significados à direita, cada uma embaralhada;
  - o par certo fica verde e desligado; o errado fica vermelho por um instante e as peças voltam a ficar soltas;
  - sem "Verificar": o grupo termina sozinho e mostra o retorno de acerto com "Continuar".
- **RF-10:** **fala:**
  - mostra a palavra, a pronúncia (quando há), o botão de ouvir e o `HoldToTalkButton`;
  - a conferência usa `evaluatePronunciation(token, vocabularyId, uri)` (`src/services/vocabulary.ts`), e as palavras trocadas aparecem como na tela de vocabulário;
  - abaixo, o link "Não posso falar agora" (`Button variant="link"`, no próprio componente) pula o item. O `skipLabel` do `ActivityFooter` não serve: ele é da tela da aula, não da atividade;
  - o microfone é pedido quando a pergunta aparece;
  - o limite do dia, o gratuito e os outros erros seguem a seção "Fila" do site, com os textos "Você usou as conferências de pronúncia de hoje." e, para o gratuito, a `PremiumBadge` com o convite da tela de vocabulário.

### Acessibilidade

- **RF-11:** cada opção e cada peça dos pares é um botão com o texto no rótulo e `accessibilityState` (`selected` e `disabled`). O botão de ouvir tem o rótulo "Ouvir a palavra" ou "Ouvir a frase".

## Desenho técnico

- **Contrato** (`src/services/lesson.ts`): `VocabularyExerciseType`, `VocabularyAnswer`, `VocabularyPrompt`, `VocabularyQuestion` e `VocabularyActivity` (`type: 'vocabulary'`, `exerciseTypes` e `questions`, com o `exerciseType` em cada pergunta), espelho do site. `Activity` passa a ser `ChoiceActivity | SentenceActivity | VocabularyActivity`.
- **Fila:** `useVocabularyQueue(questions)` em `src/hooks/useVocabularyQueue.ts`, com:
  - estado: a fila, a pergunta atual, resolvidos, de primeira e terminado;
  - ações: `answer(correct)`, `skip()`, `skipAllSpeak()` e `restart()`.

  A lógica é pura e fica em `src/utils/vocabularyActivity.ts`, para teste com o Node: o hook só guarda o estado.

- **Componentes** em `src/components/activity/vocabulary/`:
  - `VocabularyActivity.tsx`;
  - `VocabularyChoice.tsx`;
  - `VocabularyWrite.tsx`;
  - `VocabularyPairs.tsx`;
  - `VocabularySpeak.tsx`;
  - `VocabularyAnswer.tsx`, o conteúdo do retorno.
- **Fala:** reaproveita `HoldToTalkButton` e `usePronunciationRecorder`. O resultado com as palavras trocadas sai de `PronunciationPractice` para um componente próprio (`PronunciationResult`, em `src/components/vocabulary/`), usado pelas duas telas, sem mudar a tela de vocabulário.
- **Sem build novo:** o microfone e o áudio já estão no build atual.
- Siga a regra de não usar sombras pequenas: os cartões se separam por borda.

## Critérios de aceite

- [x] Cada um dos oito tipos abre na aula guiada e no modal da aula em revisão, aceita a resposta certa e recusa a errada.
- [x] A pergunta errada volta no fim, e o placar conta só as de primeira.
- [x] Nos pares, a peça errada pisca e o grupo termina quando todos estão ligados.
- [x] Na fala, "Não posso falar agora" pula o item, e a atividade termina mesmo assim.
- [x] Ao terminar, a atividade fica concluída na aula.
- [x] As outras atividades continuam iguais.

## Verificação

- `yarn lint`, `yarn tsc --noEmit` e Prettier.
- Testes com o Node (`npx tsx --test`) da fila e de `normalizeAnswer`:
  - a errada vai para o fim;
  - o pulo não conta erro;
  - `skipAllSpeak` tira só as de falar;
  - o grupo de pares conta tantos itens quantos pares tem;
  - os mesmos casos de `normalizeAnswer` do site.
- No aparelho, numa aula de teste com uma atividade de cada tipo, como assinante:
  - acertar, errar e ver voltar;
  - os pares;
  - a fala e o "Não posso falar agora";
  - concluir.

## Tarefas

- [x] Contrato e tipos.
- [x] `normalizeAnswer`, a fila e os testes.
- [x] `PronunciationResult` separado de `PronunciationPractice`. O `usePronunciationRecorder` ganhou a opção `onUnavailable`: com ela, o limite do dia (429) e o plano gratuito (403) não viram alerta.
- [x] `VocabularyActivity` e as quatro formas de pergunta.
- [x] Ramo no `ActivityExercises`, o rótulo "VOCABULÁRIO" em `LessonActivities` e o caso em `isPlayableActivity`.
- [x] Teste no aparelho.
