# 02. Assinatura pelo Checkout e tela de resultado

- **Status:** em andamento
- **Depende de:** [01-plans-screen](01-plans-screen.md); fase `02-plan-checkout` do site no ar

## Contexto

A fase 01 mostra os planos, mas o botão de assinar ainda não vende. Esta fase liga o botão ao Checkout do Stripe, confere a compra na volta e atualiza a conta no app. O caminho é o mesmo da compra de aulas particulares (`src/app/(app)/practice/private-lessons/buy.tsx` e `purchase.tsx`). O contrato está no [README.md](README.md).

## Escopo

- Botão de assinar abrindo o Checkout no navegador.
- Tela `/plans/result`, que confere a compra.
- Atualização da conta guardada depois da compra paga.

## Fora do escopo

- Troca de plano, cancelamento e troca de cartão.
- Cobrança pelas lojas.

## Requisitos

**Pagamento**

- **RF-01:** O botão "Assinar o ..." chama `POST /api/mobile/plans/checkout` com o `priceId` do plano escolhido e abre a `url` recebida com `WebBrowser.openAuthSessionAsync`, esperando o retorno em `pwg://plans/result`.
- **RF-02:** Enquanto a chamada e o navegador estão abertos, o botão mostra carregamento e não aceita outro toque.
- **RF-03:** Se o aluno volta do Checkout com `result=cancel`, ele continua na tela de planos, com o mesmo plano escolhido e sem mensagem de erro.
- **RF-04:** Em qualquer outro retorno (pagou ou fechou o navegador), o app abre `/plans/result` com o `sessionId`, no lugar da tela de planos. Se o endereço de retorno já abriu essa tela, ela não é aberta de novo.
- **RF-05:** Falha ao criar o Checkout mostra a mensagem do backend (ou "Não foi possível iniciar o pagamento.") acima do botão. O `409` (conta que já tem plano) recarrega os planos, e a tela passa a mostrar "Seu plano".
- **RF-06:** (Sem efeito.) O aviso da fase 01 não chegou a existir.

**Resultado**

- **RF-07:** `/plans/result` consulta `GET /api/mobile/plans/checkout/<sessionId>` ao abrir, mostrando "Confirmando o pagamento...".
- **RF-08:** Com `status` igual a `paid`, a tela relê a conta (`me`), grava a sessão atualizada e mostra a coroa, "Bem-vindo ao " seguido do nome do nível (Básico ou Premium), "Seu plano já está ativo. Bons estudos!" e o botão "Começar a estudar", que leva à aba Aprender.
- **RF-09:** Com `status` igual a `pending`, a tela consulta de novo a cada 3 segundos, até 10 vezes. Passado isso, mostra "Ainda estamos confirmando o pagamento. Se você pagou, seu plano aparece em instantes." com "Conferir de novo" e "Voltar".
- **RF-10:** Com `status` igual a `expired`, ou sem `sessionId`, a tela mostra "O pagamento não foi concluído." com o botão "Ver os planos", que volta para `/plans`.
- **RF-11:** Falha na consulta mostra a mensagem do backend (ou "Erro ao conferir a compra.") com "Tentar de novo".
- **RF-12:** O botão de voltar do aparelho, na tela de resultado, leva à aba Aprender depois de uma compra paga e à tela de planos nos outros casos; nunca de volta ao navegador.

**Conta**

- **RF-13:** O `AuthContext` ganha `refreshUser`, que chama `me` com o token atual, grava a sessão e atualiza o `user`. Falha nessa chamada não derruba o login (a não ser o `401`, que já é tratado pelo `api`).
- **RF-14:** Depois do RF-08, o Perfil deixa de mostrar "Seja Premium" para quem assinou o Premium, e as telas que conferem a role (aulas, chat com IA, chat com a professora) liberam o acesso sem novo login.

## Critérios de aceite

Conferidos no aparelho, com o backend usando a chave de teste do Stripe:

- [ ] Conta gratuita toca em "Assinar o Premium", paga com cartão de teste, volta para o app e vê "Bem-vindo ao Premium".
- [ ] Depois disso, sem sair do app, uma aula abre e o chat com a professora mostra o campo de mensagem.
- [ ] O Perfil não mostra mais "Seja Premium" para quem assinou o Premium, e continua mostrando para quem assinou o Básico.
- [ ] Voltar do Checkout sem pagar deixa o aluno na tela de planos, sem erro.
- [ ] Fechar o navegador no meio do pagamento leva à tela de resultado, que mostra "O pagamento não foi concluído." ou a espera, conforme o backend.
- [ ] Tocar duas vezes rápido em assinar abre um Checkout só.
- [ ] Com o backend fora do ar, o botão de assinar mostra o erro e a tela continua usável.

## Desenho técnico

**Criar**

- `src/app/(app)/plans/result.tsx`: a tela de resultado.
- `src/hooks/usePlanCheckoutStatus.ts`: a consulta com as repetições do RF-09.

**Alterar**

- `src/services/plans.ts`: `createPlanCheckout(token, priceId)` e `getPlanCheckoutStatus(token, sessionId)`.
- `src/app/(app)/plans/index.tsx` e `src/components/plans/PlansFooter.tsx`: o pagamento no botão.
- `src/contexts/AuthContext.tsx`: `refreshUser`.
- `src/constants/config.ts`: `plansCheckout`, `planCheckoutStatus` e `PLANS_RETURN_URL` (`pwg://plans/result`).
- `CLAUDE.md`: o fluxo de assinatura.

**Notas**

- O fluxo do botão repete o de `pay`, em `src/app/(app)/practice/private-lessons/buy.tsx`, incluindo a leitura do caminho atual por `ref` depois que o navegador fecha.
- A tela de resultado repete a estrutura de `src/app/(app)/practice/private-lessons/purchase.tsx`.
- O esquema `pwg` já está registrado no app; a rota `plans/result` passa a existir com o arquivo novo, sem mudança nativa.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

O teste do pagamento depende do ambiente de teste do Stripe preparado pelo dono do projeto no backend (ver `02-plan-checkout` do site). A conta usada volta para gratuita no fim, por SQL do dono do projeto. Quem implementa diz quais passos fez e quais ficaram para ele.

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passam. O backend foi conferido no modo de teste do Stripe (ver `02-plan-checkout` do site), mas nada desta fase foi visto no aparelho: o botão de assinar, a volta do navegador, a tela de resultado e a conta atualizada ficam para o teste do dono do projeto. A volta para a aba Aprender (`dismissAll` seguido de `navigate`) é o ponto que mais precisa de olho.

## Tarefas

- [x] `refreshUser` no `AuthContext`.
- [x] Funções do serviço e rotas em `config.ts`.
- [x] Pagamento no botão da tela de planos.
- [x] `usePlanCheckoutStatus` e a tela de resultado.
- [x] `CLAUDE.md`.
- [ ] Percorrer os critérios de aceite no aparelho.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
