# Arquitetura

O app só lê do backend. O desenho completo (de onde vem cada campo, como as falhas no Stripe são tratadas) está no repositório do site, em `.specs/billing/architecture.md`. Este arquivo repete o contrato que o app usa.

## Rotas

Autenticadas com o token Bearer, como as outras (`api` de `src/lib/api.ts`). Sem token válido, `401`, tratado como nas outras telas (`signOut`).

### `GET /api/mobile/billing`

```ts
type BillingSubscription = {
  id: string;
  // active, trialing, past_due, unpaid, canceled, incomplete,
  // incomplete_expired, paused
  status: string;
  planName: string;
  amount: number; // centavos
  currency: string; // "brl", "usd"...
  interval: 'day' | 'week' | 'month' | 'year';
  currentPeriodStart: string; // ISO
  currentPeriodEnd: string; // ISO
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
};

type BillingCard = {
  id: string;
  brand: string; // visa, mastercard, amex...
  last4: string;
  expMonth: number;
  expYear: number;
};

type BillingPayment = {
  id: string;
  type: 'subscription' | 'private_lessons';
  quantity: number | null; // aulas; null na assinatura
  amount: number; // centavos, na moeda cobrada
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string; // ISO
  receiptUrl: string | null;
};

type BillingOverview = {
  subscription: BillingSubscription | null;
  card: BillingCard | null;
  privateLessons: { balance: number };
  payments: BillingPayment[]; // do mais novo para o mais antigo
  canManage: boolean; // o portal pode ser aberto
};
```

Erro do backend: `500` com `{ "error": "Não foi possível carregar seus pagamentos." }`.

### `POST /api/mobile/billing/portal`

- `200` com `{ "url": "https://billing.stripe.com/..." }`.
- `409` com `{ "error": "Você ainda não tem pagamentos para gerenciar." }` quando o aluno não tem cliente no Stripe.
- `502` com `{ "error": "Não foi possível abrir o portal de pagamentos." }`.

A volta do portal passa por uma página do site, que redireciona para `pwg://billing`.

## Textos

| Dado                               | Texto                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `type: 'subscription'`             | "Assinatura Premium" (há um plano pago só)                                             |
| `type: 'private_lessons'`          | "1 aula particular" / "N aulas particulares"                                           |
| `status` do pagamento              | `paid` "Pago", `pending` "Pendente", `failed` "Falhou", `refunded` "Reembolsado"       |
| `status` da assinatura `active`    | "Ativa"                                                                                |
| `trialing`                         | "Em teste grátis"                                                                      |
| `past_due`, `unpaid`, `incomplete` | "Pagamento pendente"                                                                   |
| `canceled`, `incomplete_expired`   | "Cancelada"                                                                            |
| `paused`                           | "Pausada"                                                                              |
| ativa com `cancelAtPeriodEnd`      | "Cancelada, com acesso até <data>"                                                     |
| ativa sem `cancelAtPeriodEnd`      | "Próxima cobrança em <data>"                                                           |
| valor                              | `formatPrice` de `src/utils/privateLessons.ts` ("US$ 89,90", com a moeda do pagamento) |
| intervalo                          | `formatPlanInterval` de `src/utils/plans.ts` ("/mês", "/ano")                          |
| data                               | "14 de out. de 2026", montada à mão como as outras datas do app, no fuso do aparelho   |
| cartão                             | "Visa •••• 4242", "Validade 12/30"                                                     |

Situação desconhecida da assinatura aparece com o próprio código do Stripe, sem quebrar a tela.

## Arquivos

- `src/services/billing.ts`: tipos acima, `getBilling(token)` e `createBillingPortal(token)`.
- `src/utils/billing.ts`: os textos da tabela acima.
- `src/components/billing/`: `SubscriptionCard`, `CardSummary`, `PrivateLessonsSummary`, `PaymentRow` e `StatusBadge`.
- `src/app/(app)/billing.tsx`: a tela, com a carga, a atualização e o erro por `useApiQuery` (`src/hooks/useApiQuery.ts`).
