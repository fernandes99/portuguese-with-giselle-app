# Atividades de vocabulário

Um tipo novo de atividade nas aulas do app, montado a partir dos itens do vocabulário do DatoCMS. A Giselle escolhe as palavras e o tipo, e as perguntas chegam prontas do site. Os tipos são:

- escolher o significado;
- escolher a palavra;
- ouvir e escolher;
- ouvir e escrever;
- traduzir e escrever;
- ligar os pares;
- entender a frase;
- falar a palavra.

## Contexto

As atividades do app (múltipla escolha, verdadeiro ou falso, preencher lacuna e arrastar) chegam na rota da aula e aparecem na aula guiada (`ActivityStep`) e no modal de atividades da aula em revisão (`LessonActivities`), pelo `ActivityExercises`. O conteúdo delas é escrito à mão no Dato.

O site passa a ter a atividade de vocabulário, que só linka itens do modelo `vocabulary` e tem um ou mais tipos de exercício: cada palavra aparece uma vez, num dos tipos marcados. As decisões, o formato das perguntas, o montador e a fila estão no site, em `.specs/vocabulary-activities/` (`README.md` e `architecture.md`), e valem aqui.

## Objetivos

1. O aluno faz a atividade de vocabulário na aula, no mesmo fluxo das outras atividades.
2. A palavra errada volta no fim até o aluno acertar, e o placar mostra quantas ele acertou de primeira.

## Decisões

As do site valem aqui. Do app:

| Decisão                                                                                                                                       | Motivo                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| O app recebe as perguntas prontas (`questions`) e não monta nada; só controla a fila                                                          | Uma regra só, no site                                                  |
| `normalizeAnswer` é repetida no app, com as mesmas regras da seção "Resposta digitada" do `architecture.md` do site                           | É curta, e a conferência da escrita precisa ser instantânea, sem rota  |
| A fala reaproveita o gravador e o resultado da tela de vocabulário (`HoldToTalkButton`, `usePronunciationRecorder` e `evaluatePronunciation`) | Mesmo comportamento e mesmo limite; o microfone já está no build atual |
| Os textos são em português, como as outras atividades do app                                                                                  | Idioma da tela                                                         |

## Fora do escopo

O mesmo do site. Do app, não há lista de atividades fora da aula: a atividade aparece só na aula, como as outras.

## Fases

| Fase                         | Assunto                                     | Status       |
| ---------------------------- | ------------------------------------------- | ------------ |
| [01](01-activity-screens.md) | A atividade de vocabulário nas aulas do app | em andamento |
