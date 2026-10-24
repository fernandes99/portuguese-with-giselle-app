# 01. Reconhecimento do aparelho

- **Status:** em andamento
- **Depende de:** fase 01 de `.specs/device-pronunciation/` no site (`portuguese-with-giselle`)

## Contexto

O app confere a pronúncia em dois lugares: no detalhe de um item do vocabulário (`PronunciationPractice`, `src/components/vocabulary/`) e no "Fale a palavra" da atividade de vocabulário (`VocabularySpeak`, `src/components/activity/vocabulary/`). Os dois usam `usePronunciationRecorder` (`src/hooks/`), que grava com `useHoldToTalk` e manda o áudio por `evaluatePronunciation` (`src/services/vocabulary.ts`). Com o modo do aparelho, o aparelho transcreve e o app manda o texto.

## Escopo

- A biblioteca `expo-speech-recognition` e a permissão de reconhecimento de fala.
- Um hook de reconhecimento com a mesma interface do gravador de hoje.
- A escolha entre ele e o gravador, pelo `pronunciationEngine` do site e pelo suporte do aparelho, nos dois lugares.

## Fora do escopo

- O chat de prática.
- Mudar o visual dos dois lugares.

## Requisitos

- **RF-01:** `VocabularyList` (`src/services/vocabulary.ts`) e `VocabularyActivity` (`src/services/lesson.ts`) ganham `pronunciationEngine: 'elevenlabs' | 'device'`.
- **RF-02:** com `pronunciationEngine` igual a `'device'` e o reconhecimento disponível (`isRecognitionAvailable()`), encostar no microfone começa o reconhecimento em `pt-BR`, com até 5 alternativas, sem resultados parciais e sem `contextualStrings`.
- **RF-03:** soltar o botão para o reconhecimento; o resultado vai para a rota de pronúncia como `{ transcripts }`, pela função nova `evaluatePronunciationText(token, id, transcripts)`.
- **RF-04:** o reconhecimento para sozinho em 5 segundos (`MAX_RECORDING_MS`), como a gravação de hoje; sem fala (`no-speech`), vai a lista vazia.
- **RF-05:** soltar antes do tempo mínimo de hoje mostra a mesma dica ("Segure o botão enquanto fala."), sem mandar nada; arrastar para cancelar cancela, como hoje.
- **RF-06:** o volume do reconhecimento (`volumechange`) alimenta a animação do botão, no lugar do `metering` da gravação.
- **RF-07:** com `pronunciationEngine` igual a `'elevenlabs'`, ou sem reconhecimento no aparelho, o app usa a gravação de hoje.
- **RF-08:** a permissão negada (microfone ou reconhecimento de fala) leva ao estado `denied` de hoje, com "Abrir configurações" e "Tentar de novo".
- **RF-09:** o limite do dia (429) e o plano (403) seguem o caminho de hoje, com o `onUnavailable` da atividade.
- **RF-10:** o áudio da palavra tocando para antes do reconhecimento começar, como hoje antes da gravação.

## Critérios de aceite

- [ ] Com o site em `'device'`, falar "Mermão" no detalhe do vocabulário dá o resultado certo, no Android e no iPhone, e a tentativa fica `DEVICE` no banco.
- [ ] O mesmo no "Fale a palavra" da aula guiada e do modal de atividades.
- [ ] Ficar calado dá "Não conseguimos ouvir".
- [ ] Soltar rápido mostra a dica, sem gastar tentativa.
- [ ] Negar a permissão mostra o estado de permissão negada.
- [ ] Com o site em `'elevenlabs'`, tudo funciona como antes.

## Desenho técnico

Criar:

- `src/hooks/useSpeechRecognitionHold.ts`: o reconhecimento de segurar para falar, com o mesmo retorno de `useHoldToTalk` que `usePronunciationRecorder` usa (estado, `metering`, `pressIn`, `release`, `requestPermission`), entregando as alternativas em vez da URI do áudio.
- `src/lib/speechRecognition.ts`: o módulo nativo carregado com `requireOptionalNativeModule`, e `isSpeechRecognitionAvailable()`. Não estava no desenho: o import normal do pacote quebra o app no Expo Go e num build sem o módulo, porque o pacote usa `requireNativeModule`. Assim, sem o módulo, o app usa a gravação. Do pacote só vêm os tipos.

Alterar:

- `package.json` e `app.config.ts`: `expo-speech-recognition` na linha 58, com o plugin e os textos das permissões em português (microfone e reconhecimento de fala).
- `src/services/vocabulary.ts`: `pronunciationEngine` em `VocabularyList` e `evaluatePronunciationText`.
- `src/services/lesson.ts`: `pronunciationEngine` em `VocabularyActivity`.
- `src/hooks/usePronunciationRecorder.ts`: recebe o motor e escolhe entre a gravação e o reconhecimento (os dois hooks são chamados sempre e só um é usado, pela regra dos hooks); o envio e o tratamento da resposta continuam num lugar só.
- `src/components/vocabulary/PronunciationPractice.tsx` e `src/components/activity/vocabulary/VocabularySpeak.tsx`: passar o motor (da lista do vocabulário e da atividade).
- `CLAUDE.md`: a iniciativa em andamento.

## Verificação

- `yarn lint` e `npx tsc --noEmit`.
- Build novo de desenvolvimento e os critérios de aceite no Android e no iPhone, com o site local em `'device'` e de novo em `'elevenlabs'`.

## Tarefas

- [x] Biblioteca (`expo-speech-recognition` 58), plugin e permissões no `app.config.ts`.
- [ ] Build novo de desenvolvimento.
- [x] Tipos e `evaluatePronunciationText`.
- [x] `useSpeechRecognitionHold`.
- [x] `usePronunciationRecorder` escolhendo o motor (opção `engine`, `'elevenlabs'` quando falta), e os dois lugares passando o motor: o detalhe recebe da lista do vocabulário, e o "Fale a palavra", da atividade.
- [ ] Teste no aparelho.
