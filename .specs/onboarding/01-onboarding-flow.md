# 01. Fluxo de boas-vindas

- **Status:** em andamento (falta o teste no aparelho)
- **Depende de:** fase 01 do site (`portuguese-with-giselle/.specs/onboarding/01-preferences-api.md`)

## Contexto

O backend já diz, no usuário da sessão, se o aluno respondeu as perguntas de boas-vindas (`onboardingCompleted`), e entrega as opções e a gravação em `/api/mobile/preferences` ([architecture.md](architecture.md#rotas)). Esta fase cria o fluxo e o desvio para ele depois do login.

## Escopo

- Grupo `(onboarding)` e a guarda no layout raiz.
- Os três passos (nível, objetivo, interesses), com o layout de [architecture.md](architecture.md#layout-de-cada-passo).
- Gravação no fim e entrada nas abas.

## Fora do escopo

- Edição pelo Perfil (fase 02).
- Áudio nas perguntas e tela de boas-vindas antes delas.

## Requisitos

- **RF-01:** com login e `user.onboardingCompleted === false`, o app abre o fluxo, e não as abas; com o campo `true` ou ausente, abre as abas como hoje. Vale para o cadastro, o login (email e Google) e a abertura com sessão guardada.
- **RF-02:** ao abrir, o fluxo carrega `GET /api/mobile/preferences` e mostra um indicador; com erro, a mensagem, "Tentar de novo" e "Sair da conta".
- **RF-03:** cada passo tem o `FlowHeader` com a barra em 1/3, 2/3 e 3/3, o `TeacherPrompt` com a pergunta, a instrução e as opções; o `FlowFooter` fica embaixo. Textos em [Textos](architecture.md#textos).
- **RF-04:** passo 1 (nível) e passo 2 (objetivo) aceitam uma opção só, em `ChoiceCard`; tocar em outra troca a escolha. O objetivo mostra o ícone do código.
- **RF-05:** passo 3 (interesses) mostra os temas em `InterestChip`, na ordem da rota. Tocar marca ou desmarca; com 3 marcados, tocar num quarto não marca e mostra o aviso do [Textos](architecture.md#textos). O contador mostra quantos estão marcados.
- **RF-06:** o botão do rodapé fica desativado até o passo ter resposta (no 3, exatamente 3 temas); tocar nele desativado mostra o aviso do passo.
- **RF-07:** nos passos 2 e 3, o topo tem a seta de voltar, que volta um passo mantendo as escolhas; o voltar do Android faz o mesmo. No passo 1, o topo tem o "X", que pergunta "Sair da conta?" e, confirmado, chama `signOut`.
- **RF-08:** "Começar" envia `PUT /api/mobile/preferences` com as três respostas, mostrando carregando no botão e sem aceitar outro toque. Com `200`, o `AuthContext` marca `onboardingCompleted: true` no usuário e na sessão guardada, e o app abre as abas. Com erro, a mensagem do backend aparece acima do botão e as escolhas ficam.
- **RF-09:** se o `GET` já trouxer respostas (fluxo aberto por uma sessão antiga, depois de responder em outro aparelho), as opções vêm marcadas.
- **RF-10:** leitor de tela: os cartões e os chips têm papel de botão de opção, com o estado de selecionado; a barra tem o valor do passo; o balão é lido como texto.

## Critérios de aceite

- [ ] Conta nova: depois do cadastro, o app abre o passo 1, e não as abas.
- [ ] Conta antiga sem respostas: depois do login (email e Google), abre o passo 1.
- [ ] Conta com respostas: o login abre as abas direto.
- [ ] Os três passos aparecem com a barra avançando, a foto e o balão, e "Continuar" só funciona com resposta.
- [ ] No passo 3, um quarto tema não é marcado e o aviso aparece; desmarcar um libera outro.
- [ ] Voltar (topo e Android) mantém as escolhas; o "X" no passo 1 sai da conta depois de confirmar.
- [ ] "Começar" grava e abre as abas; fechar e abrir o app não mostra o fluxo de novo.
- [ ] Sem rede, "Começar" mostra o erro e mantém as escolhas; com rede, grava.
- [ ] Um push tocado com o app fechado, numa conta sem respostas, abre o destino depois do fluxo.
- [ ] `yarn lint` sem avisos novos e `yarn tsc --noEmit` passam.

## Desenho técnico

Criar (detalhes em [architecture.md](architecture.md#arquivos)):

- `src/services/preferences.ts`.
- `src/components/preferences/PreferencesFlow.tsx`, `TeacherPrompt.tsx`, `ChoiceCard.tsx` e `InterestChip.tsx`.
- `src/app/(onboarding)/_layout.tsx` e `index.tsx`.

Alterar:

- `src/services/auth.ts`: `onboardingCompleted?: boolean` em `User`.
- `src/contexts/AuthContext.tsx`: `completeOnboarding()`, que marca o campo no usuário e salva a sessão.
- `src/app/_layout.tsx`: a guarda de `(onboarding)` e a de `(app)`.
- `src/constants/config.ts`: `API_ROUTES.preferences`.
- `src/components/lesson-flow/FlowHeader.tsx`: o ícone de voltar como opção.

Reutilizar:

- `FlowHeader`, `FlowFooter` (com o aviso `toast`) e `FlowToast` (`src/components/lesson-flow/`).
- `TeacherAvatar` (`src/components/teacherChat/MessageBubble.tsx`).
- O estilo de selecionado de `MultipleChoiceActivity` (`src/components/activity/`).
- `useApiQuery`, `getErrorMessage` (`src/lib/api.ts`) e `getFirstName` (`src/utils/format.ts`).

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`.
2. Com o backend local da fase 01 do site e contas de teste (`@example.test`): os critérios acima no emulador.
3. Dizer quais critérios foram conferidos e quais ficaram para o dono do projeto.

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passaram. O backend da fase 01 do site foi conferido pelas rotas, com um aluno de teste (respostas, recusas e `onboardingCompleted` no login e no `me`). As telas ainda não foram abertas no aparelho: os critérios de aceite ficam para o dono do projeto.

Divergências da spec:

- Os textos e os ícones dos objetivos ficaram em `src/utils/preferences.ts`, que a spec não listava.
- `api` (`src/lib/api.ts`) passou a aceitar `PUT`.
- `FlowHeader` ganhou `closeIcon` (`'close' | 'back'`) e `closeLabel`; na aula, nada muda.
- Com erro ao carregar as perguntas, a tela mostra "Sair da conta" no fluxo e "Voltar" na edição, junto de "Tentar de novo".
- No primeiro passo, o voltar do Android segue o padrão do sistema (sai do app nas boas-vindas), como dizia o README; o "X" é que pergunta se o aluno quer sair da conta.

## Tarefas

- [x] Serviço, rota em `API_ROUTES` e `onboardingCompleted` no usuário.
- [x] `completeOnboarding` no `AuthContext` e as guardas no layout raiz.
- [x] Componentes `TeacherPrompt`, `ChoiceCard` e `InterestChip`.
- [x] `PreferencesFlow` com os três passos, voltar, avisos e gravação.
- [x] Grupo `(onboarding)`.
