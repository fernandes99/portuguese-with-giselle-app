# Pronúncia pelo reconhecimento do aparelho

A conferência de pronúncia do vocabulário passa a poder usar o reconhecimento de fala do Android e do iPhone, que é de graça, no lugar da transcrição da ElevenLabs. O site escolhe o motor por uma constante e manda a escolha para o app, que não guarda cópia dela.

## Contexto

Hoje o app grava a fala do aluno (`usePronunciationRecorder`, `src/hooks/`, com o gravador de `useHoldToTalk`) e manda o áudio para a rota de pronúncia do site, que transcreve com a ElevenLabs. No plano free da ElevenLabs, a cota de créditos acabou, e a conferência parou no detalhe do vocabulário e no "Fale a palavra" da atividade de vocabulário.

A decisão, o contrato das rotas e a arquitetura estão em `.specs/device-pronunciation/` do repositório `portuguese-with-giselle` (README e `architecture.md`). Em resumo:

- O site tem a constante `PRONUNCIATION_ENGINE` (`'elevenlabs'` ou `'device'`) e manda o valor no campo `pronunciationEngine` da lista do vocabulário e de cada atividade de vocabulário da aula.
- No modo `'device'`, o app transcreve no aparelho e manda `{ "transcripts": string[] }` (de 0 a 5 alternativas) em JSON para a mesma rota, em vez do áudio.
- A conferência continua só para assinantes, com o limite de 50 por dia, a mesma comparação e o mesmo resultado na tela.

## Objetivos

- Conferir a pronúncia sem gastar créditos da ElevenLabs.
- Trocar o motor sem build nem versão nova do app: a troca é no site.

## Decisões

| Decisão                                                                                                                      | Motivo                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| O app segue o `pronunciationEngine` que vem do site, sem constante própria                                                   | Uma chave só para o site e o app                                                                        |
| O reconhecimento usa `expo-speech-recognition`, na linha 57 (a do SDK 57)                                                    | É o módulo do Expo para o reconhecimento do Android e do iPhone, com alternativas e volume para o botão |
| O botão continua o de segurar para falar (`HoldToTalkButton`): ao encostar começa, ao soltar para, e o texto vai para a rota | O aluno não percebe a troca de motor                                                                    |
| Até 5 alternativas, em `pt-BR`, sem resultados parciais e sem o termo como dica (`contextualStrings`)                        | Decisões da iniciativa no site                                                                          |
| O reconhecimento pode usar a rede: não se exige o reconhecimento dentro do aparelho                                          | Mais aparelhos atendidos; o reconhecimento só no aparelho depende do modelo de idioma baixado           |
| Sem reconhecimento no aparelho (Android sem o serviço do Google), o app usa a gravação de hoje                               | Decisão da iniciativa no site, para nenhum aluno ficar sem a conferência                                |

## Fora do escopo

- A resposta falada do chat de prática, que continua pela gravação e pela ElevenLabs.
- Mudar o visual do detalhe do vocabulário e do "Fale a palavra".

## Pré-requisitos

- A fase 01 da iniciativa no site, com `pronunciationEngine` nas respostas e a rota aceitando o texto.
- Build novo de desenvolvimento (Android e iPhone), por causa da biblioteca nativa.

## Fases

| Fase                           | Assunto                                                | Status   |
| ------------------------------ | ------------------------------------------------------ | -------- |
| [01](01-device-recognition.md) | O reconhecimento do aparelho no detalhe e na atividade | rascunho |
