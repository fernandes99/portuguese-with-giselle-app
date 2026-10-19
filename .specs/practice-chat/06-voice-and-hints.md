# 06. Nova tela do chat: foto da Gisa, voz, microfone e dica

- **Status:** em andamento (código pronto; falta o teste no aparelho)
- **Depende de:** [05-explanation-language-and-limits.md](05-explanation-language-and-limits.md), a fase `07-voice-and-hints` do site no ar e um build com `expo-audio` e `expo-file-system` (o build preview da versão 0.0.31 em diante)

## Contexto

O chat é só texto, com balões verdes e um "G" no lugar da foto. O dono do projeto quer a tela parecida com a de apps de conversação por voz, mantendo a identidade do app: a foto da Gisa nas falas, a Gisa falando em voz alta, o aluno respondendo pelo microfone, uma dica quando ele não sabe o que dizer e um cartão de correção que mostra o que mudou na frase.

O backend devolve a dica e as assinaturas das falas na abertura e no turno, gera a voz de uma fala assinada e transcreve a gravação do aluno (fase `07-voice-and-hints` do site). O contrato está em [architecture.md](architecture.md).

## Escopo

- Foto da Gisa no chat e no cartão "Chat com IA" da aba Praticar.
- Cabeçalho com a foto e uma folha de configurações no lugar dos três botões.
- Balões novos, com os botões de traduzir e ouvir na fala da Gisa.
- Voz da Gisa tocando sozinha, com a opção de desligar.
- Cartão de correção com a frase riscada e corrigida, o selo "Boa resposta" e o "Tentar de novo" da última resposta.
- Barra de baixo com o teclado, o microfone de segurar para falar e a dica.

## Fora do escopo

- Esconder o texto da fala, salvar frases, denunciar uma fala e avaliar a correção (curtir ou não curtir).
- Tema da conversa com progresso no topo.
- Avaliar a pronúncia da resposta falada.
- Ouvir a dica em voz alta.
- Guardar os áudios depois de sair do chat.
- Biblioteca nova: tudo usa `expo-audio` e `expo-file-system`, já instalados.

## Requisitos

### Foto da Gisa

- **RF-01:** A imagem da Gisa fica em `assets/gisa-avatar.png`, quadrada, com 256 px, gerada a partir da ilustração enviada pelo dono do projeto (1254 px, em webp).
- **RF-02:** O componente `GisaAvatar` mostra a imagem em círculo, no tamanho pedido, com `accessibilityIgnoresInvertColors` e sem rótulo de leitor de tela (o nome já aparece ao lado). Ele aparece:
  - com 40 px, ao lado de cada fala da Gisa e do indicador de digitação, no lugar do "G";
  - com 32 px, no cabeçalho do chat, à esquerda do nome;
  - com 48 px, no cartão "Chat com IA" da aba Praticar, no lugar do ícone.

### Cabeçalho e configurações

- **RF-03:** O cabeçalho mantém o botão de voltar, mostra a foto, "Gisa" e o subtítulo "Parceira de conversação com IA", e à direita só um botão de engrenagem (`settings-outline`, rótulo "Configurações do chat").
- **RF-04:** A engrenagem abre uma folha de baixo (`Modal`, como `ActivityInfoSheet`, com `useModalBottomInset`) com, nesta ordem:
  - **Voz automática:** um `Switch` com a descrição "A Gisa lê cada resposta em voz alta.";
  - **Idioma das explicações:** abre `/practice/language`, como o botão de hoje;
  - **Estilo da Gisa:** abre a troca de estilo, com a mesma confirmação de hoje quando há mensagens do aluno;
  - **Recomeçar conversa:** a mesma confirmação de hoje; fica desabilitado sem mensagens do aluno.
- **RF-05:** Escolher uma opção que sai da tela ou recomeça a conversa fecha a folha. A voz automática fica gravada no aparelho (`src/lib/storage.ts`, com `expo-secure-store`) e começa ligada.

### Falas da Gisa

- **RF-06:** O balão da Gisa fica branco, com borda `border-gray-200`, texto `text-gray-900` e sem sombra. Embaixo do texto, uma linha de botões redondos de 32 px:
  - **Traduzir** (`language`), quando a fala tem tradução, como hoje;
  - **Ouvir** (`volume-medium`), quando a fala tem `replySignature`. Enquanto baixa, mostra um indicador de carregamento; enquanto toca, troca para `stop` e anima o fundo. Tocar de novo para.
- **RF-07:** A abertura de reserva, escrita no app, não tem assinatura e não mostra o botão de ouvir.
- **RF-08:** O indicador de digitação fica no mesmo balão branco, com os pontos em `bg-gray-400`.

### Voz da Gisa

- **RF-09:** O hook `useGisaVoice` cuida de baixar e tocar as falas. Ele pede a voz a `POST /api/mobile/practice/speech` com o texto e a assinatura, grava o MP3 num arquivo do cache (`expo-file-system`) e toca com `expo-audio`.
- **RF-10:** O arquivo de cada fala fica guardado enquanto a tela está aberta: ouvir de novo não chama o backend. Sair da tela para o som e apaga os arquivos.
- **RF-11:** Só uma fala toca por vez: tocar outra, começar a gravar ou recomeçar a conversa para a que está tocando.
- **RF-12:** Com a voz automática ligada, cada fala nova da Gisa com assinatura (a abertura do backend e as respostas) toca sozinha quando chega, se o aluno não estiver gravando. Ligar a opção não toca as falas que já estão na tela.
- **RF-13:** Falha ao gerar a voz mostra um `Alert` "Não foi possível tocar o áudio" com a mensagem do backend, só quando o aluno tocou no botão. Na voz automática, a falha é silenciosa e o botão volta ao normal. `429` `SPEECH_DAILY_LIMIT` desliga a voz automática até sair do chat, sem mudar a opção gravada, e o toque no botão mostra a mensagem do backend.

### Mensagem do aluno e correção

- **RF-14:** O balão do aluno fica `bg-green-50` com borda `border-green-200`. Os trechos de `mistakes` ficam com sublinhado vermelho (`text-red-700`, `underline`, `decoration-red-500`), sem fundo.
- **RF-15:** Resposta sem erros: embaixo do balão, à direita, o selo "Boa resposta", com `checkmark` verde, borda `border-green-200` e fundo branco. Substitui o "Muito bem!".
- **RF-16:** Resposta com erros: o cartão de correção ocupa a largura da conversa, branco, com borda `border-gray-200`:
  - título "Correção", com o ícone `sparkles` em `text-amber-500`;
  - a frase comparada palavra por palavra (RF-17): o que saiu, riscado e em `text-gray-400`; o que entrou, em `font-poppins-semibold` com fundo `bg-green-100` e `text-green-800`; o resto, em `text-gray-900`;
  - a explicação, em `text-gray-600`, quando houver;
  - o botão de ouvir a frase corrigida, quando o turno trouxe `correctedSignature`. Só toca quando o aluno toca, nunca pela voz automática;
  - "Tentar de novo" (`refresh`), como botão de largura total, só na última mensagem do aluno e só quando a Gisa não está respondendo.
- **RF-17:** `diffWords(original, corrected)` (`src/utils/diffWords.ts`, sem imports, para ser testado com o Node direto) divide as duas frases em palavras (separadas por espaço, com a pontuação junto), compara sem diferenciar maiúsculas e devolve as partes na ordem, cada uma `same`, `removed` ou `added`, pela maior sequência comum. "I good, thanks." e "I'm good, thanks." viram `removed` "I", `added` "I'm" e `same` "good, thanks.".
- **RF-18:** "Tentar de novo" tira da conversa a mensagem do aluno e a resposta da Gisa a ela. Os avisos do app ficam. A pergunta anterior da Gisa volta a ser a última, com a dica dela. No modo teclado, o campo recebe o texto que o aluno tinha mandado. A nova resposta conta no limite do dia como qualquer mensagem.

### Barra de baixo

- **RF-19:** A barra tem dois modos. O modo voz é o padrão:

```
 [⌨]      ( 🎤 )      [💡]
teclado   segurar     dica
```

- **RF-20:** **Microfone:** o `HoldToTalkButton` da pronúncia, com 80 px no chat. Segurar grava até 30 segundos (a gravação para e é enviada sozinha no fim); soltar envia; arrastar para o lado e soltar cancela; gravação de menos de meio segundo não é enviada. O tempo aparece em `m:ss`.
- **RF-21:** Ao soltar, a mensagem do aluno aparece com o texto "Ouvindo..." e `opacity-60`, e o app manda a gravação a `POST /api/mobile/practice/transcription`. Com o texto, a mensagem segue o envio normal (`send`), já com o texto transcrito.
- **RF-22:** Transcrição vazia ou com falha: a mensagem "Ouvindo..." some, e aparece acima da barra, por 4 segundos, "Não entendi, tente de novo." ou a mensagem do backend. `429` `TRANSCRIPTION_DAILY_LIMIT` passa a barra para o modo teclado, com a mensagem do backend no mesmo lugar.
- **RF-23:** A permissão do microfone é pedida ao abrir o chat, não ao segurar o botão. Negada, a barra abre no modo teclado e o botão de voltar para o microfone mostra o aviso de abrir as configurações do sistema, como na pronúncia.
- **RF-24:** **Teclado:** troca a barra pelo campo de texto de hoje, com um botão de microfone (`mic`) à esquerda do campo para voltar ao modo voz. O teclado abre junto.
- **RF-25:** **Dica:** o botão (`bulb-outline`, rótulo "O que eu deveria dizer?") aparece quando a última fala da Gisa tem `suggestion`. Ele abre, acima da barra, o cartão "O que eu deveria dizer?" com a sugestão, o botão de traduzir quando há `suggestionTranslation` e um botão de fechar. O cartão fecha ao enviar uma mensagem, gravar ou tocar de novo na dica. Sem sugestão, o lugar do botão fica vazio, para o microfone continuar no centro.
- **RF-26:** Enquanto a Gisa responde, há uma mensagem com falha ou o chat está bloqueado, o microfone, a dica e o envio ficam desabilitados, como o campo de hoje. Os avisos de limite (fase 05) continuam no lugar da barra.

## Critérios de aceite

- [ ] A foto da Gisa aparece nas falas, no cabeçalho e no cartão da aba Praticar.
- [ ] A engrenagem abre a folha; desligar a voz automática, sair e voltar mantém desligada.
- [ ] Com a voz automática ligada, a abertura e cada resposta tocam sozinhas; tocar em ouvir numa fala antiga para a atual e toca a antiga sem nova chamada ao backend na segunda vez.
- [ ] Segurar o microfone, dizer "Eu trabalho em uma hospital" e soltar mostra "Ouvindo...", depois a frase, o cartão com "uma" riscado e "um" destacado e a resposta da Gisa.
- [ ] Uma resposta certa mostra "Boa resposta".
- [ ] "Tentar de novo" na correção tira a resposta e a fala seguinte, e a Gisa espera a nova resposta à mesma pergunta.
- [ ] A dica mostra uma resposta possível à última pergunta e a tradução.
- [ ] Com o microfone negado, o chat abre no teclado e continua funcionando.
- [ ] Com o backend antigo (sem os campos novos), o chat funciona sem os botões de ouvir e de dica.
- [ ] A pronúncia do vocabulário continua gravando até 5 segundos, como antes.

## Desenho técnico

**Criar**

- `assets/gisa-avatar.png` (RF-01).
- `src/components/practice/GisaAvatar.tsx` (RF-02).
- `src/components/practice/ChatSettingsSheet.tsx` (RF-04).
- `src/components/practice/ListenButton.tsx`: o botão redondo de ouvir, com os estados `idle`, `loading` e `playing`.
- `src/components/practice/ChatVoiceBar.tsx`: a barra no modo voz (RF-19 a RF-23).
- `src/components/practice/HintCard.tsx` (RF-25).
- `src/hooks/useGisaVoice.ts` (RF-09 a RF-13).
- `src/utils/diffWords.ts` (RF-17).
- `src/hooks/useHoldToTalk.ts`: o gravador de segurar para falar, tirado de `usePronunciationRecorder`, com a duração máxima e o que fazer com a gravação passados por quem usa. O `usePronunciationRecorder` passa a usá-lo, com 5 segundos e a avaliação de pronúncia.

**Alterar**

- `src/app/(app)/practice/chat.tsx`: cabeçalho, folha, os dois modos da barra, a dica e a voz.
- `src/components/lesson/ClassicLesson.tsx`: `LessonHeader` ganha a prop opcional `avatar`, mostrada à esquerda do título.
- `src/components/practice/ChatBubble.tsx`: balões novos (RF-06, RF-08 e RF-14) e o botão de ouvir.
- `src/components/practice/CorrectionCard.tsx`: o cartão novo e o selo (RF-15 e RF-16).
- `src/components/practice/ChatComposer.tsx`: botão de voltar ao microfone e texto inicial (RF-18 e RF-24).
- `src/components/practice/TypingIndicator.tsx`: pontos cinza.
- `src/components/vocabulary/HoldToTalkButton.tsx`: prop `size` e o tempo em `m:ss`.
- `src/hooks/usePracticeChat.ts`: a mensagem do aluno ganha o status `transcribing`; as falas da Gisa guardam `signature` e `suggestion`; a do aluno guarda `correctedSignature`; novas funções `sendVoice(uri)` e `redo()`.
- `src/services/practice.ts`: os campos novos da abertura e do turno, `getPracticeSpeech` e `transcribePracticeAnswer`.
- `src/constants/config.ts`: `practiceSpeech` e `practiceTranscription` em `API_ROUTES`.
- `src/lib/storage.ts`: ler e gravar a voz automática.
- `src/app/(app)/(tabs)/practice.tsx`: a foto no cartão "Chat com IA".
- `README.md` e `architecture.md` da iniciativa: o contrato novo, o estado da conversa e os arquivos.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
```

- `diffWords` com um script local: frase igual, palavra trocada, palavra a mais, palavra a menos e maiúsculas diferentes.
- No aparelho, com o build preview e um assinante: os critérios de aceite, no Android e, se houver aparelho, no iPhone (modo silencioso ligado).
- No aparelho, com um aluno gratuito: o chat continua trancado.
- Cada fala ouvida e cada resposta por voz gasta créditos da ElevenLabs.

## O que foi conferido

- `yarn lint` e `yarn tsc --noEmit` passam, e o bundle do Android (`npx expo export --platform android`) fecha sem erros.
- `diffWords`, com testes do Node no scratchpad: troca no começo ("I good" para "I'm good", com a removida antes da adicionada), frases iguais, troca no meio ("uma" para "um"), palavra a mais e a menos, maiúsculas diferentes (o texto sai da corrigida) e espaços duplos sem partes vazias.
- A foto tem 256 × 256 px e 110 KB, com o rosto centralizado no círculo.
- **Falta:** os critérios de aceite no aparelho, com o build preview e o site da fase 07 no ar (com a migration aplicada).

## Divergências

- **Ajustes pedidos depois da primeira versão** (mudança pequena, combinada no chat):
  - a foto da Gisa foi trocada por uma ilustração nova, enviada pelo dono do projeto;
  - enquanto a Gisa fala, a borda do balão fica verde, a foto ganha um anel verde pulsando e a palavra que está sendo falada ganha fundo `bg-green-100`, acompanhando o áudio pelos tempos `wordStarts` da rota da voz (`activeWordOf`, em `useGisaVoice`, com o tempo do player a cada 100 ms); sem os tempos, fica só a borda e o anel;
  - o balão do aluno passou a verde sólido (`bg-green-600`) com texto branco, e os erros, a sublinhado amarelo. Substitui o `bg-green-50` de RF-14.

- **`diffWords` ficou em `src/utils/diffWords.ts`**, sem imports, para ser testado com o Node direto.
- **`HoldToTalkButton` ganhou `compact`, além de `size`:** sem a barra de progresso e com o tempo junto do aviso, para caber na barra do chat ao lado do teclado e da dica.
- **`useHoldToTalk` não tem `stop()`:** sair da tela já para a gravação no próprio hook. Ele ganhou a fase `sending`, enquanto a gravação é entregue, que a pronúncia mostra como "conferindo".
- **A voz descarta o que chega atrasado por um contador de pedidos**, não pelo id da conversa: cada pedido novo e cada `stop()` invalidam os anteriores, e a tela chama `stop()` ao gravar, recomeçar, trocar o estilo e no "Tentar de novo".
- **As ações da folha de configurações esperam a folha fechar** (350 ms) antes de abrir a confirmação ou sair da tela: no iPhone, um alerta aberto durante o fechamento pode não aparecer.
- **A preferência da voz automática fica em `pwg.chatAutoplay`**, no padrão das outras chaves de `src/lib/storage.ts`.

## Tarefas

- [x] Gerar `assets/gisa-avatar.png` e criar `GisaAvatar`.
- [x] Tirar `useHoldToTalk` de `usePronunciationRecorder`, sem mudar a pronúncia, e a prop `size` do botão.
- [x] Contrato novo em `services/practice.ts`, `API_ROUTES` e no hook do chat.
- [x] Balões, cartão de correção, `diffWords` e "Tentar de novo".
- [x] `useGisaVoice`, botão de ouvir e voz automática.
- [x] Cabeçalho e folha de configurações.
- [x] Barra no modo voz, transcrição e dica.
- [x] Foto no cartão da aba Praticar.
- [x] Atualizar o `README.md` e o `architecture.md` da iniciativa.
- [ ] Rodar a verificação, marcar as tarefas e atualizar o status aqui e no `README.md`.
