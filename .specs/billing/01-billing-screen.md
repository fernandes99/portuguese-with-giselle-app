# 01. Tela de pagamentos

- **Status:** rascunho
- **Depende de:** fase 01 do site (`portuguese-with-giselle/.specs/billing/01-billing-service.md`)

## Contexto

O backend já devolve a assinatura, o cartão, o saldo de aulas e o histórico unificado em `GET /api/mobile/billing`, e abre o portal do Stripe em `POST /api/mobile/billing/portal` ([architecture.md](architecture.md)). Esta fase cria a tela que mostra tudo e o caminho até ela.

## Escopo

- Linha "Pagamentos" no Perfil.
- Tela `/billing` com quatro blocos: assinatura, cartão, aulas particulares e histórico.
- Botão "Gerenciar assinatura", que abre o portal do Stripe e recarrega a tela na volta.
- Recibo de cada pagamento no navegador do app.

## Fora do escopo

- Ações de cobrança dentro do app (cancelar, reativar, trocar cartão).
- Paginação do histórico.

## Requisitos

- **RF-01:** o Perfil tem a linha "Pagamentos" (ícone `card-outline`), no mesmo estilo de "Meus cursos" e "Histórico", logo abaixo delas, que abre `/billing`.
- **RF-02:** a tela tem o cabeçalho de voltar com o título "Pagamentos" (`LessonHeader`, `src/components/lesson/ClassicLesson.tsx`) e rola com puxar para atualizar.
- **RF-03:** o bloco **Assinatura**, com assinatura, mostra o nome do plano, a etiqueta de situação, o valor com o intervalo ("R$ 29,90/mês") e a linha de data da tabela de [Textos](architecture.md#textos). Assinatura `canceled` mostra só o plano e "Cancelada".
- **RF-04:** sem assinatura, o bloco mostra "Você está no plano gratuito." e, se `canSeePlans` (`src/utils/plans.ts`), o botão "Ver planos", que abre `/plans`.
- **RF-05:** com assinatura e `canManage`, o bloco tem o botão "Gerenciar assinatura". Ele chama `POST /api/mobile/billing/portal`, abre o `url` com `WebBrowser.openAuthSessionAsync(url, 'pwg://billing')` e recarrega a tela quando o navegador fecha. Enquanto a rota responde, o botão mostra carregando e não aceita outro toque. Erro mostra a mensagem do backend abaixo do botão.
- **RF-06:** o bloco **Cartão** mostra a bandeira, o final e a validade; sem cartão, o bloco não aparece.
- **RF-07:** o bloco **Aulas particulares** mostra o saldo (`formatAvailable`, `src/utils/privateLessons.ts`) e o botão "Comprar aulas", que abre `/practice/private-lessons/buy`.
- **RF-08:** o bloco **Histórico** lista os pagamentos na ordem recebida. Cada linha tem a descrição, a data, o valor e a etiqueta de situação ([Textos](architecture.md#textos)). Sem pagamentos: "Nenhum pagamento ainda."
- **RF-09:** linha com `receiptUrl` abre o recibo com `WebBrowser.openBrowserAsync` e tem o ícone `open-outline` e a dica "Abre o recibo" para o leitor de tela; sem `receiptUrl`, a linha não é tocável.
- **RF-10:** carregando pela primeira vez, a tela mostra o indicador; com erro e sem dados, a mensagem e "Tentar de novo"; com erro ao atualizar e dados já na tela, os dados ficam e a mensagem aparece acima deles.
- **RF-11:** os blocos são cartões brancos separados por borda (`border-gray-200`), sem sombra. Etiquetas: "Pago" e "Ativa" em verde, "Pendente" e "Pagamento pendente" em amarelo, "Falhou" em vermelho, "Reembolsado", "Cancelada" e "Pausada" em cinza.
- **RF-12:** `pwg://billing` abre a tela `/billing` (rota do Expo Router), o que também cobre a volta no Android, quando o endereço abre o app antes de o navegador fechar.

## Critérios de aceite

- [ ] Do Perfil, "Pagamentos" abre a tela; voltar retorna ao Perfil.
- [ ] Aluno gratuito sem compras: "Você está no plano gratuito.", "Ver planos", saldo "Nenhuma aula disponível", "Nenhum pagamento ainda.", sem bloco de cartão.
- [ ] Aluno Premium com compras de aula: assinatura com valor e próxima cobrança, cartão, saldo e o histórico com os dois tipos, na ordem de data.
- [ ] Tocar num pagamento abre o recibo; voltar do navegador mantém a tela.
- [ ] "Gerenciar assinatura" abre o portal; cancelar lá e voltar mostra "Cancelada, com acesso até <data>".
- [ ] Sem rede, a tela mostra o erro e "Tentar de novo"; com rede, puxar para atualizar recarrega.
- [ ] Leitor de tela lê cada linha do histórico com descrição, data, valor e situação.
- [ ] `yarn lint` sem avisos novos e `yarn tsc --noEmit` passam.

## Desenho técnico

Criar (detalhes em [architecture.md](architecture.md#arquivos)):

- `src/services/billing.ts`, `src/hooks/useBilling.ts`, `src/utils/billing.ts`.
- `src/components/billing/SubscriptionCard.tsx`, `CardSummary.tsx`, `PrivateLessonsSummary.tsx` e `PaymentRow.tsx`.
- `src/app/(app)/billing.tsx`.

Alterar:

- `src/constants/config.ts`: `API_ROUTES.billing`, `API_ROUTES.billingPortal` e `BILLING_RETURN_URL = 'pwg://billing'`.
- `src/app/(app)/(tabs)/profile.tsx`: a linha "Pagamentos".

Reutilizar:

- `api`, `ApiError` e `getErrorMessage` (`src/lib/api.ts`), `useAuth`, `formatPrice` e `formatAvailable` (`src/utils/privateLessons.ts`), `formatPlanInterval` e `canSeePlans` (`src/utils/plans.ts`), `Button` e `LessonHeader`.
- O fluxo de `openAuthSessionAsync` da tela de planos (`src/app/(app)/plans/index.tsx`).

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`.
2. Com o backend local da fase 01 do site e o aluno de teste dela: os critérios acima no aparelho ou no emulador.
3. Dizer quais critérios foram conferidos e quais ficaram para o dono do projeto.

## Tarefas

- [ ] Serviço, rotas em `API_ROUTES` e `BILLING_RETURN_URL`.
- [ ] Textos em `src/utils/billing.ts`.
- [ ] Componentes dos blocos.
- [ ] Tela `/billing` com carga, erro e atualização.
- [ ] "Gerenciar assinatura" com a volta do portal.
- [ ] Linha no Perfil.
