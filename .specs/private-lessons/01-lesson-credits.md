# 01. Saldo e compra de aulas

- **Status:** em andamento
- **Depende de:** fase `01-lesson-credits` do site no ar

## Contexto

A aba Praticar tem duas opções. Esta fase acrescenta a terceira e entrega a parte de compra: a tela com o saldo, a escolha de quantidade, a ida ao pagamento e a tela de resultado. Agendar fica para a fase 02. O fluxo da compra e os contratos estão em `architecture.md`.

## Escopo

- Opção "Aulas particulares" na aba Praticar.
- Tela principal, com o saldo e o botão de comprar.
- Tela de compra, com a quantidade e o total.
- Ida ao Checkout e volta ao app.
- Tela de resultado da compra.

## Fora do escopo

- Agendar, próxima aula e lista de agendamentos (fase 02).
- Histórico de compras.
- Qualquer campo de cartão no app.

## Requisitos

**Aba Praticar**

- **RF-01:** A aba mostra, abaixo de "Flashcards", a opção "Aulas particulares", com ícone de calendário e a descrição "Aulas individuais com a professora Giselle.". Tocar abre `/practice/private-lessons`.

**Tela principal**

- **RF-02:** Cabeçalho de voltar com o título "Aulas particulares".
- **RF-03:** O cartão de saldo mostra o rótulo "Seu saldo", o número grande (verde; cinza quando é zero) e o texto "aula disponível" ou "aulas disponíveis". Com zero, acrescenta "Compre uma aula para agendar com a professora Giselle.".
- **RF-04:** A compra fica na parte de baixo do mesmo cartão: a linha "Aula individual ao vivo" com o preço ("US$ 25,00 por aula", vindo de `price`) e o botão, que abre `/practice/private-lessons/buy`. Sem saldo, o botão é o principal da tela, "Comprar aulas"; com saldo, é de contorno, "Comprar mais aulas".
- **RF-05:** Nesta fase o botão "Agendar aula" aparece apagado, com o texto "Em breve" abaixo. A fase 02 o liga.
- **RF-06:** Enquanto a primeira carga acontece, a tela mostra o indicador verde. Em erro, a mensagem recebida e "Tentar de novo". Puxar a tela recarrega. Voltar para a tela recarrega o saldo.

**Tela de compra**

- **RF-07:** Cabeçalho de voltar com o título "Comprar aulas".
- **RF-08:** A tela mostra o preço de uma aula, a quantidade com os botões de menos e mais, e o total ("3 aulas · US$ 75,00"). A quantidade começa em 1, não desce de 1 e não passa de `maxQuantity`; no limite, o botão correspondente fica apagado.
- **RF-09:** Abaixo do total há o texto "O pagamento é feito com cartão, em uma página segura do Stripe. Depois de pagar, você volta para o app.".
- **RF-10:** "Continuar para o pagamento" chama o checkout com a quantidade, mostra o botão em estado de carregando e abre o endereço recebido no navegador de autenticação do sistema. Um segundo toque durante a chamada é ignorado.
- **RF-11:** Se a chamada do checkout falha, a tela mostra a mensagem recebida acima do botão e continua na mesma quantidade.
- **RF-12:** Quando o navegador fecha, o app substitui a tela de compra pela de resultado, passando o `sessionId`. A exceção é o aluno que toca em voltar no Checkout: o site o devolve com `result=cancel`, e ele continua na tela de compra, com a mesma quantidade.

**Tela de resultado**

- **RF-13:** Enquanto a compra consta como `pending`, a tela mostra o indicador verde e "Confirmando seu pagamento...", consultando o backend a cada 2 segundos, até 10 vezes.
- **RF-14:** Com `paid`: um ícone de confirmação verde, "Compra confirmada!", "{N} aulas adicionadas à sua conta." (ou "1 aula adicionada") e "Você tem {saldo} aulas disponíveis.". O botão "Voltar para as aulas" leva à tela principal, sem deixar a tela de resultado na pilha.
- **RF-15:** Se as tentativas acabam e a compra ainda consta como `pending`: "Não recebemos a confirmação do pagamento." e "Se você não concluiu o pagamento, nada foi cobrado. Se concluiu, suas aulas aparecem em instantes.", com os botões "Verificar de novo" e "Voltar para as aulas".
- **RF-16:** Com `expired` ou `404`: "Compra não concluída." e "Nada foi cobrado.", com "Tentar novamente" (volta à tela de compra) e "Voltar para as aulas".
- **RF-17:** A tela aceita o id da compra pelo parâmetro `sessionId` (navegação interna) ou `session_id` (endereço `pwg://`). Sem nenhum dos dois, redireciona para a tela principal.
- **RF-18:** O gesto e o botão de voltar do sistema, na tela de resultado, levam à tela principal, e não à tela de compra.
- **RF-19:** A consulta para quando a tela sai de foco.

**Acessibilidade**

- **RF-20:** O cartão de saldo lê "3 aulas disponíveis"; os botões de quantidade leem "Diminuir quantidade" e "Aumentar quantidade", e a quantidade é anunciada a cada mudança.

## Critérios de aceite

- [ ] Praticar mostra as três opções; "Aulas particulares" abre a tela e o voltar retorna a Praticar.
- [ ] Uma conta sem compras vê "Nenhuma aula disponível".
- [ ] Na tela de compra, o total acompanha a quantidade, de 1 a 10.
- [ ] "Continuar para o pagamento" abre o Checkout com a mesma quantidade e o mesmo total.
- [ ] Pagando com o cartão de teste, o navegador fecha sozinho e o app mostra "Compra confirmada!" com o saldo novo.
- [ ] "Voltar para as aulas" mostra o saldo novo, e o voltar do sistema a partir dali vai para Praticar.
- [ ] Fechando o navegador sem pagar, o app mostra "Não recebemos a confirmação do pagamento." e o saldo não muda.
- [ ] Pagando e fechando o navegador à mão antes do retorno, o app ainda mostra "Compra confirmada!".
- [ ] No Android e no iOS, a tela de resultado aparece uma vez só, sem duplicar na pilha.
- [ ] Em modo avião, a tela de compra mostra o erro e não abre o navegador.
- [ ] Uma conta gratuita compra normalmente e continua gratuita.

## Desenho técnico

**Criar**

- `src/services/privateLessons.ts`: tipos `PrivateLessonsSummary` e `PurchaseStatus`; `getPrivateLessons(token)`, `createLessonCheckout(token, quantity)` e `getPurchaseStatus(token, sessionId)`.
- `src/utils/privateLessons.ts`: `formatPrice` e `formatAvailable`.
- `src/hooks/usePurchaseStatus.ts`.
- `src/components/privateLessons/BalanceCard.tsx` e `QuantityStepper.tsx`.
- `src/app/(app)/practice/private-lessons/index.tsx`, `buy.tsx` e `purchase.tsx`.

**Alterar**

- `src/constants/config.ts`: em `API_ROUTES`, `privateLessons`, `privateLessonsCheckout` e `privateLessonPurchase(sessionId)`; e a constante `PURCHASE_RETURN_URL` (`pwg://practice/private-lessons/purchase`).
- `src/app/(app)/(tabs)/practice.tsx`: a terceira `PracticeOption` e o comentário da tela.
- `CLAUDE.md` e `.specs/README.md`: as telas e a iniciativa.

**Notas**

- `openAuthSessionAsync` devolve `success` com o endereço quando o retorno acontece e `cancel` ou `dismiss` quando o aluno fecha; o RF-12 trata todos do mesmo jeito, e quem decide o que mostrar é a rota de conferência.
- No Android, o endereço de retorno pode abrir a tela de resultado pelo Expo Router antes de a chamada do navegador resolver. A tela de compra confere o caminho atual e só navega se a tela de resultado ainda não abriu; nesse caso a tela de compra fica embaixo na pilha, e por isso o voltar da tela de resultado (botão, gesto e voltar do Android) usa `router.dismissTo` para a tela principal.
- `formatPrice` monta o texto à mão ("US$ 25,00"), sem `Intl`, para o resultado ser o mesmo em qualquer aparelho.
- O `sessionId` fica numa variável da tela de compra, obtido antes de abrir o navegador. O app não confia nos parâmetros do endereço de retorno para saber qual compra conferir, a não ser quando a tela é aberta direto pelo endereço (RF-17).
- O esquema `pwg` já está em `app.config.ts`; esta fase não muda a configuração nativa.
- O Checkout pode mostrar o valor na moeda do aluno; a tela do app mostra sempre em dólar, que é o preço de referência.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend em modo de teste do Stripe: percorrer os critérios de aceite no Android e no iOS. Com o backend em produção, cada compra é cobrança real.

## Tarefas

- [x] `API_ROUTES`, `PURCHASE_RETURN_URL` e `src/services/privateLessons.ts`.
- [x] `formatPrice` e `formatAvailable`.
- [x] `BalanceCard` e a tela principal.
- [x] `QuantityStepper` e a tela de compra, com a ida ao pagamento.
- [x] `usePurchaseStatus` e a tela de resultado.
- [x] Opção na aba Praticar.
- [x] Atualizar o `CLAUDE.md` e o `.specs/README.md`.
- [ ] Conferir no aparelho, nas duas plataformas.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
