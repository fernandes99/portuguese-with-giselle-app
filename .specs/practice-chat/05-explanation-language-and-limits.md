# 05. Idioma das explicações, limites de uso e proteções

- **Status:** em andamento
- **Depende de:** [04-chat-style.md](04-chat-style.md) e a fase `06-explanation-language-and-limits` do site no ar

## Contexto

A explicação dos erros e a tradução da fala da Gisa saem no idioma nativo das boas-vindas, sem como trocar. O dono do projeto quer a troca no chat, por um botão ou pedindo à própria Gisa, e um limite de uso por aluno: 50 mensagens por dia, um freio por minuto e um teto mensal escondido. O chat também ganha limite de tamanho e um aviso de que a Gisa é uma IA.

O backend grava o idioma, aplica a troca pedida na conversa, confere os limites e devolve quantas mensagens restam (fase `06-explanation-language-and-limits` do site).

## Escopo

- Tela de escolha do idioma das explicações, aberta pelo cabeçalho do chat.
- Aviso no chat quando a Gisa troca o idioma a pedido do aluno.
- Mensagens restantes no dia, bloqueio nos limites e recomeço quando a conversa fica longa.
- Limite de 500 caracteres no campo de mensagem.
- Aviso fixo de IA e de dados pessoais.

## Fora do escopo

- Trocar o idioma da conversa: a Gisa sempre conversa em português.
- Escolher o idioma das explicações no Perfil.
- Mostrar o consumo ao aluno além das mensagens restantes no dia.

## Requisitos

### Idioma das explicações

- **RF-01:** O cabeçalho do chat ganha um botão de idioma (ícone `language-outline`, `accessibilityLabel` "Idioma das explicações"), antes do de estilo. Ele abre a tela "Idioma das explicações".
- **RF-02:** A tela mostra o texto "A Gisa sempre conversa em português. Escolha em que idioma ela explica seus erros e traduz as mensagens." e um `ChoiceCard` por idioma de `options.explanationLanguages` de `GET /api/mobile/preferences`, com o emoji, o título e a descrição, na ordem do backend. O idioma atual (`preferences.explanationLanguage`) vem marcado.
- **RF-03:** "Salvar" chama `PUT /api/mobile/preferences/chat-language` e volta ao chat. A troca não recomeça a conversa: vale a partir da próxima resposta. Falha ao salvar mostra o erro e mantém a tela; falha ao carregar mostra o erro com "Tentar de novo".
- **RF-04:** Quando a resposta do turno traz `explanationLanguage` (o aluno pediu a troca na conversa), o chat mostra, depois da resposta da Gisa, um aviso centralizado: "Explicações agora em {título do idioma}" (English, Español ou Português). O aviso não vai para o backend no histórico.

### Limites

- **RF-05:** A abertura e o turno trazem `remainingToday`. Com 10 ou menos, aparece acima do campo de mensagem: "Restam {n} mensagens hoje" ("Resta 1 mensagem hoje" com 1).
- **RF-06:** `429` com `code` `DAILY_LIMIT` ou `MONTHLY_LIMIT`, na abertura ou no turno: o campo de mensagem dá lugar a um aviso com a mensagem do backend, e a mensagem do aluno fica com a falha. Na abertura, a abertura de reserva aparece, como em qualquer falha.
- **RF-07:** `429` com `RATE_LIMIT` no turno: a mensagem fica com a falha, a mensagem do backend e o "Tentar de novo", como numa falha de rede.
- **RF-08:** `400` com `CONVERSATION_TOO_LONG`: o campo de mensagem dá lugar a um aviso com a mensagem do backend e o botão "Recomeçar", que recomeça a conversa sem pedir confirmação.
- **RF-09:** Recomeçar a conversa ou trocar o estilo limpa os avisos de RF-08. Os de RF-06 continuam até o aluno sair do chat.

### Proteções

- **RF-10:** O campo de mensagem aceita até 500 caracteres. A partir de 400, mostra o contador "{n}/500".
- **RF-11:** O topo da conversa mostra, centralizado e em cinza: "A Gisa é uma IA e pode errar. Não compartilhe dados pessoais sensíveis."

## Critérios de aceite

- [ ] O botão de idioma abre a tela com o idioma atual marcado; salvar outro volta ao chat, e a próxima explicação sai no idioma novo, sem recomeçar a conversa.
- [ ] Pedir "Can you explain in Spanish?" na conversa mostra "Explicações agora em Español", e a tela de idioma passa a marcar Español.
- [ ] Com 10 mensagens restantes, aparece "Restam 10 mensagens hoje".
- [ ] No limite do dia, o campo some e aparece "Você usou suas 50 mensagens de hoje. Volte amanhã!".
- [ ] O campo não aceita mais de 500 caracteres e mostra o contador a partir de 400.
- [ ] O aviso de IA aparece no topo da conversa.

## Desenho técnico

**Criar**

- `src/app/(app)/practice/language.tsx`: a tela de escolha, com `LessonHeader`.
- `src/components/practice/ExplanationLanguageSelector.tsx`: carrega as opções, mostra os `ChoiceCard` e salva.
- `src/components/practice/ChatNotice.tsx`: aviso centralizado no meio da conversa (RF-04, RF-11) e aviso no lugar do campo (RF-06, RF-08).

**Alterar**

- `src/lib/api.ts`: `ApiError` ganha `code`, lido do corpo do erro quando ele vem.
- `src/services/preferences.ts`: `ExplanationLanguage`, `ExplanationLanguageOption`, `explanationLanguage` em `Preferences`, `explanationLanguages` nas opções e `saveExplanationLanguage(token, language)`.
- `src/services/practice.ts`: `remainingToday` na abertura e no turno, e `explanationLanguage` no turno.
- `src/constants/config.ts`: `API_ROUTES.chatLanguage` e `PRACTICE_MESSAGE_MAX_LENGTH`.
- `src/hooks/usePracticeChat.ts`: mensagens de aviso (`role: 'notice'`), fora do histórico enviado; `remainingToday`; e o bloqueio (`limit`), com o tipo `blocked` ou `restart`.
- `src/components/practice/ChatComposer.tsx`: limite de caracteres e contador.
- `src/app/(app)/practice/chat.tsx`: botão de idioma, aviso de IA, aviso de troca, mensagens restantes e bloqueio.
- `CLAUDE.md`, `README.md` e `architecture.md` da iniciativa.

Nenhuma biblioteca nova.

## Verificação

```bash
yarn lint
npx tsc --noEmit
```

No aparelho, com uma conta assinante e o backend da fase 06 no ar, percorrer os critérios de aceite. O limite do dia pode ser conferido baixando `PRACTICE_LIMITS` no backend local.

## O que foi conferido

- `yarn lint` e `npx tsc --noEmit` passam.
- O comportamento da troca de idioma e os limites foram conferidos no backend (fase `06-explanation-language-and-limits` do site), sem o app.
- Falta percorrer os critérios de aceite no aparelho, com o backend da fase 06 no ar e a migration aplicada.

## Divergências

- Na resposta que confirma a troca pedida na conversa, a tradução ainda pode vir no idioma anterior (limite do modelo, registrado na fase 06 do site); a explicação já vem no idioma novo.
- O limite por minuto na abertura não tem aviso próprio: como qualquer falha da abertura, entra a abertura de reserva.

## Tarefas

- [x] Tipos, serviços e `code` no `ApiError`.
- [x] Tela e seletor do idioma das explicações.
- [x] Avisos, mensagens restantes e bloqueios no chat.
- [x] Limite de caracteres no campo e aviso de IA.
- [x] Atualizar `CLAUDE.md`, `README.md` e `architecture.md`.
- [ ] Rodar a verificação, marcar as tarefas e atualizar o status aqui e no `README.md`.
