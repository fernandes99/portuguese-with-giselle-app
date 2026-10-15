# 01. Tela de pagamentos

- **Status:** concluída
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

- [x] Do Perfil, "Pagamentos" abre a tela; voltar retorna ao Perfil.
- [x] Aluno gratuito sem compras: "Você está no plano gratuito.", "Ver planos", saldo "Nenhuma aula disponível", "Nenhum pagamento ainda.", sem bloco de cartão.
- [x] Aluno Premium com compras de aula: assinatura com valor e próxima cobrança, cartão, saldo e o histórico com os dois tipos, na ordem de data.
- [x] Tocar num pagamento abre o recibo; voltar do navegador mantém a tela.
- [x] "Gerenciar assinatura" abre o portal; cancelar lá e voltar mostra "Cancelada, com acesso até <data>".
- [x] Sem rede, a tela mostra o erro e "Tentar de novo"; com rede, puxar para atualizar recarrega.
- [x] Leitor de tela lê cada linha do histórico com descrição, data, valor e situação.
- [x] `yarn lint` sem avisos novos e `yarn tsc --noEmit` passam.

## Desenho técnico

Criar (detalhes em [architecture.md](architecture.md#arquivos)):

- `src/services/billing.ts` e `src/utils/billing.ts`.
- `src/components/billing/SubscriptionCard.tsx`, `CardSummary.tsx`, `PrivateLessonsSummary.tsx`, `PaymentRow.tsx` e `StatusBadge.tsx`.
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

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passaram. Os textos da tela foram conferidos rodando as funções de `src/utils/billing.ts` sobre a resposta real de `GET /api/mobile/billing` no backend local, com os alunos de teste da fase 01 do site:

- Premium: "Premium Plan", "Ativa", "US$ 89,90/mês", "Próxima cobrança em 14 de nov. de 2026", "Visa •••• 4242", "Validade 10/27", "6 aulas disponíveis" e o histórico "Assinatura Premium | 14 de out. de 2026 | US$ 89,90 | Pago", "2 aulas particulares | … | Pago", "1 aula particular | … | Reembolsado", "3 aulas particulares | … | Pago" (sem recibo).
- Gratuito: "Você está no plano gratuito.", "Nenhuma aula disponível" e histórico vazio.
- Depois de cancelar a assinatura de teste no fim do período, a rota devolveu `cancelAtPeriodEnd: true`, que a tela mostra como "Cancelada, com acesso até <data>".

No aparelho, o dono do projeto conferiu os critérios de aceite com o backend local e a sandbox do Stripe. Para o portal abrir, o `stripeCustomerId` dessa conta foi trocado temporariamente pelo cliente da sandbox (o banco é o de produção, e o cliente gravado é do modo live) e depois voltou ao valor original.

Divergências da spec:

- A descrição da assinatura no histórico é "Assinatura Premium", fixa: há um plano pago só, e o item do histórico não traz o nome do plano. O site faz o mesmo.
- As datas ("14 de out. de 2026") são montadas à mão, sem `Intl`, como as outras datas do app (`src/utils/date.ts`, `src/utils/privateLessons.ts`).
- Sem `useBilling`: a tela usa `useApiQuery` direto, que já recarrega ao voltar o foco.
- A etiqueta de situação virou um componente próprio, `StatusBadge`, usado pela assinatura e pelo histórico.
- Assinatura cancelada no fim do período mantém a etiqueta "Ativa" (o aluno tem acesso até a data); quem diz que foi cancelada é a linha da data.

## Tarefas

- [x] Serviço, rotas em `API_ROUTES` e `BILLING_RETURN_URL`.
- [x] Textos em `src/utils/billing.ts`.
- [x] Componentes dos blocos.
- [x] Tela `/billing` com carga, erro e atualização.
- [x] "Gerenciar assinatura" com a volta do portal.
- [x] Linha no Perfil.
