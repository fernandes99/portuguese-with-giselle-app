# 04. Aba Praticar

- **Status:** em andamento (código pronto; falta o teste no aparelho, com o dono)
- **Depende de:** fase 01

## Contexto

É a maior área, com 171 linhas em português, e mistura interface com falas da Gisa e das personagens, que continuam em português.

## Escopo

- `src/app/(app)/practice/` e `src/app/(app)/(tabs)/practice/`.
- `src/components/practice/`, `simulations/`, `flashcards/`, `vocabulary/` e `privateLessons/`.
- `src/utils/practice.ts`, `simulations.ts`, `flashcards.ts`, `vocabulary.ts` e `privateLessons.ts`.
- Os textos dos hooks de prática (`usePracticeChat`, `useSimulation`, `useGisaVoice`, `useHoldToTalk`, `usePronunciationRecorder`, `useSpeechRecognitionHold`, `useVocabulary`, `useVocabularyQueue`, `useFlashcard`, `useFlashcardSession`).

## Fora do escopo

- A abertura fixa da Gisa em `src/utils/practice.ts`.
- As falas, correções e explicações geradas pelo modelo.
- O idioma do reconhecimento de fala, que continua `pt-BR`.

## Requisitos

- **RF-01:** toda a interface do chat, das simulações, dos flashcards, do vocabulário e das aulas particulares segue o idioma do app.
- **RF-02:** avisos de limite e de microfone seguem o idioma do app.
- **RF-03:** a abertura fixa da Gisa continua em português nos três idiomas.

## Critérios de aceite

- [ ] Com o app em espanhol, o chat mostra a interface em espanhol, as falas da Gisa em português e as explicações em espanhol.
- [ ] O reconhecimento de fala continua entendendo português com o app em inglês.

## Desenho técnico

`src/locales/<idioma>/practice.ts`, seguindo as regras do `README.md`. Entraram aqui, antes da fase 05, as datas e o preço das aulas particulares (`src/utils/privateLessons.ts`): o dia da semana e o mês saem dos textos, para o português continuar igual ("segunda, 3 de novembro"), e o preço usa `toLocaleString(getLocale())`. A tradução de reserva da abertura da Gisa (`getOpeningTranslation`) segue o idioma do app; a abertura continua em português. Os textos que saem em hooks usam `t` de `@/lib/i18n` quando não estão num componente.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, abrir cada tela da aba com o app em inglês, com uma conta Premium. Fica com o dono.

## Tarefas

- [x] Trocar os textos e escrever `en` e `es`.
- [ ] Marcar a fase como concluída no `README.md`, depois do teste no aparelho.
