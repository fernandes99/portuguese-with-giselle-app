# 01. Botão de download da transcrição

- **Status:** concluída
- **Depende de:** fase 01 do site (`.specs/lesson-transcriptions/01-transcription-download.md` em `portuguese-with-giselle`), publicada

## Contexto

A rota da aula do site passa a mandar `lesson.hasTranscription`, e `GET /api/mobile/lessons/[lessonId]/transcription` devolve `{ url }`, uma URL assinada de 60 segundos que baixa o PDF. Falta o botão na tela da aula.

## Escopo

- `hasTranscription` no tipo da aula.
- Função de serviço e rota em `API_ROUTES`.
- Componente do botão, usado na aula clássica e na guiada.

## Fora do escopo

- O que está em "Fora do escopo" no README.

## Requisitos

- **RF-01:** com `hasTranscription: true`, a aula clássica mostra o botão depois do texto da aba "Conteúdo", antes de "Marcar como concluída".
- **RF-02:** com `hasTranscription: true`, a tela de parabéns da aula guiada mostra o botão antes dos recursos da aula.
- **RF-03:** o toque pede a URL ao site e a abre com `WebBrowser.openBrowserAsync`; enquanto espera, o botão mostra um indicador e fica desabilitado.
- **RF-04:** se o pedido falhar, aparece uma mensagem curta sob o botão ("Não foi possível baixar a transcrição. Tente de novo."), e o botão volta a funcionar.
- **RF-05:** com `hasTranscription: false` ou ausente (site antigo), nada aparece.

## Critérios de aceite

- [ ] Na aula `vowels`, nos dois formatos, o botão abre o PDF no navegador.
- [ ] Numa aula sem transcrição, o botão não aparece.
- [ ] Sem internet, o toque mostra a mensagem de erro e não trava o botão.

## Desenho técnico

- `src/services/lesson.ts`: `hasTranscription?: boolean` em `Lesson` (opcional, para não quebrar com o site antigo) e `getLessonTranscriptionUrl(token, lessonId)`.
- `src/constants/config.ts`: `API_ROUTES.lessonTranscription(lessonId)`.
- `src/components/lesson/TranscriptionButton.tsx` (novo): recebe `lessonId` e pega o token de `useAuth`; a mensagem de erro é fixa. Cartão com borda (sem sombra), ícone `document-text-outline`, título "Transcrição da aula", texto "PDF com o texto completo, vocabulário e gramática." e o ícone de download à direita (um indicador enquanto espera).
- `src/components/lesson/LessonContent.tsx` e `src/components/lesson-flow/Congratulations.tsx`: renderizam o botão quando `lesson.hasTranscription`.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- No aparelho: aula `vowels` nos dois formatos, uma aula sem transcrição e o modo avião.

## Resultado

- `yarn lint` e `yarn tsc --noEmit` passam.
- Falta o teste no aparelho (critérios acima), depois do deploy do site com a rota nova.

## Tarefas

- [x] Tipo, serviço e rota.
- [x] `TranscriptionButton`.
- [x] Botão na aula clássica e na guiada.
