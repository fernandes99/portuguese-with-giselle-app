# 02. Prática de pronúncia no detalhe do item

- **Status:** em andamento
- **Depende de:** [01](01-vocabulary-screen.md); fase 05 do site (`.specs/vocabulary/05-pronunciation-api.md` em `portuguese-with-giselle`), publicada; um development build novo, com a permissão de microfone

## Contexto

O detalhe do item já toca a palavra e o exemplo. Esta fase deixa o aluno falar a palavra no microfone e ver o que um brasileiro entenderia. A gravação vai para a rota do site, que transcreve com a ElevenLabs (Scribe) e compara palavra por palavra com o termo.

O Scribe pega o erro que troca a palavra (no teste, "olho" mal pronunciado saiu "óleo"), mas não o sotaque que deixa a palavra reconhecível. A tela não promete mais do que isso: o texto fala em "entender", não em "pronúncia perfeita".

## Escopo

- Permissão de microfone na configuração do app.
- Gravação com o `expo-audio`, envio para a rota e bloco de resultado no detalhe.
- Envio de `FormData` pelo cliente `api`.

## Fora do escopo

- Prática na lista ou nos itens trancados.
- Vibração ao começar a gravar (exigiria o `expo-haptics` e um build novo).
- Prática da frase de exemplo.
- Tudo o que está no "Fora do escopo" do README.

## Requisitos

Os requisitos foram revistos depois do primeiro teste no aparelho, a pedido do dono do projeto: a verificação passou a ser só para assinantes, num box próprio, com um microfone de segurar para falar.

- **RF-01:** o detalhe tem, fixo no pé da tela (perto do polegar, no lugar do antigo botão "Salvar"), o box "Verificar pronúncia", com o ícone de microfone e a frase "Fale a expressão e veja se um brasileiro entenderia.".
- **RF-02:** para o aluno gratuito, o box mostra o `PremiumBadge`, e o toque fecha o detalhe e abre `/plans`. Vale também para os itens liberados (`is_free`): a verificação é só para assinantes, e a rota recusa o gratuito.
- **RF-03:** para o assinante, o toque pede a permissão de microfone (só na primeira vez) e abre o box no lugar, com o microfone grande e redondo e "Segure para falar". A permissão é pedida aqui, e não ao segurar o botão, porque o aviso do sistema tiraria o dedo do botão.
- **RF-04:** com a permissão negada, o box mostra "Permita o acesso ao microfone nas configurações para verificar a pronúncia.", o botão "Abrir configurações" (`Linking.openSettings`) e "Tentar de novo", que pede a permissão outra vez.
- **RF-05:** segurar o microfone grava. Enquanto grava, o botão fica vermelho e cresce, um anel pulsa com o volume da voz, uma barra corre até os 5 segundos com o tempo ("0:03 / 0:05"), e o texto acima diz "‹ Deslize para cancelar".
- **RF-06:** arrastar o dedo para a esquerda leva o botão junto. Passando de 96 pontos, o botão fica cinza com um "x" e o texto vira "Solte para cancelar", em vermelho; soltar ali descarta a gravação, sem enviar, e mostra "Gravação cancelada.".
- **RF-07:** soltar fora da área de cancelar envia a gravação e mostra "Conferindo..." até a resposta. Aos 5 segundos, a gravação é enviada sozinha.
- **RF-08:** soltar antes de meio segundo não envia nada e mostra "Segure o botão enquanto fala.".
- **RF-09:** o resultado aparece no próprio box, acima do microfone: com `correct`, "Muito bem! Um brasileiro entenderia você." em verde; com `incorrect`, "Entendemos:" e as palavras do termo (`ok` normal, `wrong` com a ouvida riscada em vermelho e a certa ao lado em verde, `missing` em vermelho, sublinhada); com `not_understood`, "Não conseguimos ouvir. Fale mais perto do microfone e tente de novo.". Fora do `correct`, vem o botão "Ouvir a pronúncia" (quando o termo tem áudio). Embaixo do microfone, "Segure o microfone para tentar de novo.".
- **RF-10:** os erros da rota (limite do dia, falha da ElevenLabs, sem conexão) aparecem num `Alert` com a mensagem da rota, e o box volta a mostrar só o microfone.
- **RF-11:** fechar o detalhe interrompe a gravação, descarta o áudio e fecha o box. Começar a tocar um áudio durante a gravação a cancela, e começar a gravar para o áudio que estiver tocando.
- **RF-12:** depois de gravar, os áudios do detalhe voltam a tocar pelo alto-falante, no volume normal, também no iPhone.

## Critérios de aceite

- [ ] O build novo pede a permissão de microfone com o texto do app, no iPhone e no Android, ao tocar no box (e não ao segurar o microfone).
- [ ] Com conta gratuita, o box mostra o selo Premium e leva à tela de planos, também num item liberado.
- [ ] Segurar, falar o termo certo e soltar mostra o resultado verde.
- [ ] Falar outra palavra mostra a ouvida riscada e a certa ao lado.
- [ ] Arrastar para a esquerda até "Solte para cancelar" e soltar não envia nada.
- [ ] Um toque rápido mostra "Segure o botão enquanto fala." e não envia nada.
- [ ] Segurar por mais de 5 segundos envia sozinho.
- [ ] O anel do microfone acompanha o volume da voz.
- [ ] Rolar o detalhe com o dedo fora do microfone não começa a gravar.
- [ ] Negar a permissão mostra a mensagem e o botão que abre as configurações.
- [ ] Depois de uma gravação, "Ouvir" toca no alto-falante, e não no fone de ouvido do iPhone.
- [ ] Fechar o detalhe durante a gravação para a gravação.

## Desenho técnico

**Configuração** (exige development build novo, combinado com o dono do projeto)

- `app.config.ts`: `['expo-audio', { microphonePermission: 'Permita o acesso ao microfone para praticar a pronúncia.' }]` em `plugins`. O plugin põe a descrição no iOS e o `RECORD_AUDIO` no Android.

**Rotas e serviço**

- `src/lib/api.ts`: opção `formData` em `RequestOptions`. Com ela, o corpo vai como `FormData`, sem o `Content-Type` (o `fetch` põe o `boundary`).
- `src/constants/config.ts`: `vocabularyPronunciation: (id) => '/api/mobile/vocabulary/<id>/pronunciation'` em `API_ROUTES`, com `encodeURIComponent`.
- `src/services/vocabulary.ts`: os tipos do contrato (`PronunciationResult`, `PronunciationWord`, `PronunciationEvaluation`) e `evaluatePronunciation(token, id, uri)`, que monta o `FormData` com o arquivo no campo `audio` como `File` do `expo-file-system`. O `fetch` global do app é o do Expo (`expo/fetch`), que recusa o formato `{ uri, name, type }` do React Native no `FormData` antes de enviar; o `File` funciona como um `Blob`. O `expo-file-system` já vem com o `expo` e já está no build; só foi declarado no `package.json`.

**Gravação**

- `src/hooks/usePronunciationRecorder.ts`: `useAudioRecorder` com `RecordingPresets.HIGH_QUALITY` (m4a) e `isMeteringEnabled`, e `useAudioRecorderState` para o volume. Expõe `requestPermission` (chamado ao abrir o box), `pressIn` e `release(cancel)`, os estados (`idle` com um aviso, `denied`, `starting`, `recording`, `checking`, `result`), o limite de 5 segundos e o mínimo de meio segundo. Soltar enquanto o gravador ainda abre conta como toque rápido.
- Antes de gravar, `setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })`; ao parar, volta para `allowsRecording: false`. Sem isso, o iPhone continua tocando pelo fone de ouvido depois da gravação (RF-10). Confira se `ActivityAudioProvider` (`src/components/activity/ActivityAudio.tsx`) muda o modo de áudio ao tocar, para os dois não brigarem.

**Tela**

- `src/components/vocabulary/HoldToTalkButton.tsx`: o microfone de segurar para falar. `Gesture.Pan` do `react-native-gesture-handler` (com `minDistance(0)`, os callbacks no JS e o gesto criado uma vez, com os callbacks em refs) e as animações do `react-native-reanimated` (escala, anel do volume, arrasto e barra de progresso). Os dois pacotes já estavam no app.

- `src/components/vocabulary/PronunciationPractice.tsx`: o box fechado (convite ou selo Premium) e aberto (resultado, microfone e avisos), dentro do `ActivityAudioProvider` do detalhe, para o "Ouvir" e o RF-11 usarem o mesmo player.
- `src/utils/vocabulary.ts`: `canCheckPronunciation(user)`, a mesma regra do backend (role diferente de `FREE_STUDENT`). A tela passa o resultado e `onOpenPlans` (fecha o detalhe e abre `/plans`) ao detalhe.
- `src/components/vocabulary/VocabularyDetail.tsx`: o `PronunciationPractice` fixo no pé, fora da rolagem; o salvar virou um ícone de marcador ao lado da palavra (fase 01, RF-06). O conteúdo do Modal fica dentro de um `GestureHandlerRootView` próprio (o Modal é outra janela) e a rolagem usa o `ScrollView` do `react-native-gesture-handler`, para o microfone e a rolagem não brigarem. O Modal guarda o último item enquanto desce, então o detalhe não desmonta ao fechar: a chave do bloco muda ao fechar (`isVisible`), o que o desmonta, para a gravação e limpa o resultado (RF-09).

**Visual**

- Identidade do app: `bg-background`, Poppins, cantos `rounded-2xl`, separação por borda, sem sombras pequenas. Verde e vermelho só no resultado.

**Documentação**

- `CLAUDE.md`: a prática de pronúncia na iniciativa, com a permissão de microfone.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- Development build novo e, no aparelho (iPhone e Android), os critérios de aceite.

## Resultado

- `yarn lint` e `yarn tsc --noEmit` passaram.
- `npx expo config --type introspect` mostra `NSMicrophoneUsageDescription` com o texto do app e `RECORD_AUDIO` no Android. O plugin do `expo-audio` liga o áudio em segundo plano por padrão; ficou `enableBackgroundPlayback: false`, para o app não ganhar `UIBackgroundModes` nem o serviço de mídia no Android.
- Começar a gravar para o áudio que estiver tocando. Só um áudio que começa a tocar durante a gravação a descarta; o que acabou de ser parado não conta.
- A rota que o app chama é a do site (fase 05); com o app apontando para produção, ela só responde depois do deploy do site, com a `ELEVENLABS_API_KEY` na Vercel.
- No primeiro teste no aparelho, o envio falhava com "Sem conexão": o `expo/fetch` lançava erro com o arquivo no formato `{ uri, name, type }`, e `api` trata toda falha do `fetch` como falta de conexão. Corrigido com o `File` do `expo-file-system`.
- Depois do primeiro teste no aparelho, o dono do projeto pediu o box com o microfone de segurar para falar e a verificação só para assinantes. Os requisitos foram revistos; o backend passou a recusar o gratuito (fase 05 do site). Não entrou biblioteca nova nem exige build novo.
- `yarn lint` e `yarn tsc --noEmit` passaram de novo depois da revisão.
- Falta o teste no aparelho do novo desenho (critérios de aceite).

## Tarefas

- [x] Permissão no `app.config.ts`.
- [x] `formData` em `api`, rota e serviço.
- [x] Hook da gravação.
- [x] Botão e resultado no detalhe.
- [x] `CLAUDE.md`, status nesta spec e no README.
- [ ] Build novo e teste no aparelho.
