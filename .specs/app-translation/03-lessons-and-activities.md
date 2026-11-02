# 03. Cursos, aulas e atividades

- **Status:** em andamento (código pronto; falta o teste no aparelho, com o dono)
- **Depende de:** fase 01

## Contexto

A aula mistura conteúdo, que não muda, com a interface em volta dele. O limite é este: o que vem do CMS fica como está, e os enunciados fixos, botões e avisos seguem o idioma do app.

## Escopo

- `src/app/(app)/courses.tsx`, `src/app/(app)/course/` e `src/app/(app)/lesson/`.
- `src/components/course/`, `lesson/`, `lesson-flow/` e `activity/`.
- `src/utils/lesson.ts`, `lessonFlow.ts`, `activityScreens.ts`, `vocabularyActivity.ts`, `course.ts`, `learn.ts`, `sentence.ts`, `choice.ts` e `trueFalse.ts`.

## Fora do escopo

- O texto da aula, as frases e as respostas das atividades.
- Os itens de vocabulário dentro das atividades.

## Requisitos

- **RF-01:** os enunciados dos tipos de exercício, os botões, o placar e os avisos de acerto e erro seguem o idioma do app.
- **RF-02:** nenhum texto vindo do CMS passa por tradução.
- **RF-03:** a comparação de respostas não muda: ela vale sobre o texto em português das atividades.

## Critérios de aceite

- [ ] Uma aula com os cinco tipos de atividade aparece com a interface em espanhol e o conteúdo como foi escrito.
- [ ] Uma resposta certa continua certa nos três idiomas.

## Desenho técnico

`src/locales/<idioma>/lesson.ts`, seguindo as regras do `README.md`. O `unit` do `ActivityResult` passou a ser um código (`blanks`, `statements`, `firstTry`), porque a palavra muda de lugar na frase em inglês ("You got 2 of 3 blanks right"). As funções que comparam respostas (`src/utils/sentence.ts`, `vocabularyActivity.ts`, `trueFalse.ts` e `dragDrop.ts`) não mudaram. Antes de trocar um texto em `src/utils/`, conferir se ele é usado em comparação: o que serve de regra não vira tradução.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, fazer uma aula de cada tipo com o app em inglês. Fica com o dono.

## Tarefas

- [x] Trocar os textos e escrever `en` e `es`.
- [ ] Marcar a fase como concluída no `README.md`, depois do teste no aparelho.
