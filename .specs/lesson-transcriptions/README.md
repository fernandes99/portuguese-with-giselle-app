# Transcrições das aulas

O aluno assinante baixa, no fim da aula, a transcrição dela em PDF.

## Contexto

As transcrições das aulas são PDFs em inglês, guardados num bucket privado do Supabase e ligados à aula pelo banco do site. O site entrega o armazenamento, o envio dos PDFs, a rota de download do app e o campo `hasTranscription` na rota da aula, descritos em `.specs/lesson-transcriptions/` do repositório `portuguese-with-giselle`.

Este repositório entrega o botão de download na tela da aula.

## Objetivos

1. Toda aula com transcrição mostra o botão "Transcrição da aula" no fim da aula, nos dois formatos de aula (clássica e guiada).
2. O botão abre o PDF no navegador do aparelho, de onde o aluno salva ou compartilha.

## Decisões

| Decisão                                                                                                                                   | Motivo                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| O botão fica no fim da aula: na aula clássica, depois do texto da aba "Conteúdo"; na aula guiada, na tela de parabéns, junto dos recursos | Pedido do dono do projeto ("no final da aula")                                                                        |
| O app pede a URL na hora do toque (`GET /api/mobile/lessons/[lessonId]/transcription`) e abre com `expo-web-browser`                      | A URL é assinada e vale 60 segundos; não pode vir pronta na rota da aula                                              |
| Sem salvar o arquivo no aparelho pelo app                                                                                                 | Evita dependência nativa nova (`expo-file-system`/`expo-sharing`) e um build novo; o navegador já salva e compartilha |
| O botão só aparece com `hasTranscription: true`                                                                                           | Aula sem transcrição não mostra nada                                                                                  |

## Fora do escopo

- Ver o PDF dentro do app.
- Baixar para uso offline.
- Transcrição nas aulas gratuitas.

## Fases

| Fase                        | Assunto              | Status    |
| --------------------------- | -------------------- | --------- |
| [01](01-download-button.md) | Botão no fim da aula | concluída |
