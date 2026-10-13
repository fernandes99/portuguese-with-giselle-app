# Planos e assinatura

Tela de venda do curso: compara o aluno gratuito, o Básico e o Premium, mostra os preços e leva à assinatura. Abre pelo botão "Seja Premium" do Perfil.

## Contexto

O app não vende a assinatura. O aluno gratuito encontra avisos de "exclusivo para assinantes" (aulas, chat com IA, chat com a professora) e não tem para onde ir. A única compra do app é a de aulas particulares (`src/app/(app)/practice/private-lessons/buy.tsx`), que abre o Checkout do Stripe no navegador e volta para uma tela de resultado.

O app só conversa com o backend. Os planos, os preços, a lista de benefícios e o Checkout estão descritos no repositório do site (`portuguese-with-giselle`, em `.specs/subscription-plans/` de lá).

## Objetivos

1. O aluno entende, numa tela, o que ganha em cada nível.
2. O aluno gratuito assina o Básico ou o Premium sem sair do fluxo do app.
3. Depois de pagar, o app já se comporta como assinante, sem entrar de novo.

## Como funciona

1. Perfil > "Seja Premium" (com a coroa) abre a tela.
2. No alto, uma chamada de venda. Abaixo, os planos pagos como cartões para escolher, com o preço por mês; o Premium vem escolhido e destacado.
3. Em seguida, a tabela "Compare os planos", com uma linha por benefício e as colunas Gratuito, Básico e Premium.
4. No rodapé fixo, o botão de assinar o plano escolhido e uma linha sobre o pagamento.
5. O botão abre o Checkout do Stripe no navegador. Na volta, a tela de resultado confere a compra e dá as boas-vindas.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                   | Motivo                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A tela mostra as diferenças entre gratuito, Básico e Premium e as ofertas | Pedido direto                                                              |
| Preços e planos vêm do Stripe, pelo backend, como no site                 | Pedido direto                                                              |
| Linguagem de venda, centrada em benefício                                 | Pedido direto                                                              |
| A entrada é um botão "Seja Premium", com ícone de coroa, no Perfil        | Pedido direto: por enquanto fica lá                                        |
| O pagamento é pelo Checkout do Stripe, no navegador                       | Escolha do dono do projeto, ciente do risco de recusa na revisão das lojas |
| Os benefícios vêm do backend                                              | Mudar o texto não pede novo build                                          |
| Quem já é Básico vê o Premium, sem trocar de plano pelo app               | A troca fica para outra entrega                                            |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs das fases):

| Decisão                                                                                                      | Motivo                                                                                        |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| "Três ofertas" são os níveis gratuito, Básico e Premium; dois são compráveis                                 | São os produtos que existem no Stripe                                                         |
| A tela usa o tema claro do app, com um bloco verde no alto e o Premium destacado                             | As referências enviadas são escuras, mas o resto do app é claro; a tela não destoa            |
| Tela cheia, fora das abas, com um X para fechar no alto                                                      | É como as telas de venda das referências funcionam                                            |
| O botão do Perfil aparece para o gratuito e para o Básico; Premium, professora e admin não o veem            | Para eles não há o que vender                                                                 |
| Para o Básico, o Premium aparece com "Para mudar de plano, fale com a professora" e um botão que abre o chat | O Básico tem acesso ao chat com a professora; a troca é feita por ela                         |
| A tela não leva o aluno ao navegador sem ele tocar em assinar                                                | O aluno escolhe quando sair do app                                                            |
| O preço aparece em dólar, como vem do backend, com "/mês"                                                    | É a moeda dos planos; o Checkout converte para a moeda do aluno                               |
| Quem diz se a compra foi paga é o backend, consultado pela tela de resultado                                 | O fechamento do navegador não prova nada, como nas aulas particulares                         |
| Depois de paga, a conta é relida (`me`) e a sessão guardada é atualizada                                     | A role nova passa a valer em todas as telas sem novo login                                    |
| Nenhuma dependência nova                                                                                     | `expo-web-browser` e `@expo/vector-icons` já estão no projeto; não exige build por biblioteca |

## Fora do escopo

- Cobrança pelas lojas (Google Play Billing, compra no app da Apple).
- Troca de plano, cancelamento, reativação e troca de cartão.
- Plano anual, cupom e período de teste.
- Levar os avisos de "exclusivo para assinantes" das outras telas para esta (pode vir depois).
- Abrir a tela sozinha, como oferta, em algum momento do uso.

## Contrato das rotas

Espelho do contrato em `.specs/subscription-plans/README.md` do site; ao mudar um, mude o outro. Todas com o token da sessão. Erros como `{ "error": string }`; o `401` encerra o login pelo `api`.

`GET /api/mobile/plans`

```json
{
  "currentTier": "free",
  "canSubscribe": true,
  "plans": [
    {
      "tier": "free",
      "name": "Gratuito",
      "tagline": "Para conhecer o app",
      "price": null,
      "priceId": null,
      "highlighted": false
    },
    {
      "tier": "premium",
      "name": "Premium",
      "tagline": "O curso com a professora ao seu lado",
      "price": { "amount": 8990, "currency": "usd", "interval": "month" },
      "priceId": "price_...",
      "highlighted": true
    }
  ],
  "benefits": [
    {
      "id": "course",
      "label": "Todas as aulas e atividades do curso",
      "tiers": ["basic", "premium"]
    }
  ]
}
```

- `plans` vem na ordem `free`, `basic`, `premium`. Um nível pago pode faltar, se não houver produto à venda.
- `amount` é em centavos. `interval` é `month` ou `year`.
- `currentTier` é o nível da conta; `canSubscribe` é verdadeiro só para o aluno gratuito.
- `benefits` vem na ordem de exibição; `tiers` lista os níveis que têm o benefício.

`POST /api/mobile/plans/checkout`, com `{ "priceId": "price_..." }`. Responde `{ "url": "...", "sessionId": "cs_..." }`. `400` para plano inválido; `409` quando a conta já tem plano.

`GET /api/mobile/plans/checkout/<sessionId>`. Responde `{ "status": "paid", "tier": "premium" }`, com `status` igual a `paid`, `pending` ou `expired`. `404` quando a compra não é da conta.

O Stripe devolve o aluno a uma página do site, que abre `pwg://plans/result?result=success&session_id=...` ou `pwg://plans/result?result=cancel`.

## Pré-requisitos

- Fase `01-plans-api` do site no ar, para a fase 01 daqui.
- Fase `02-plan-checkout` do site no ar, para a fase 02 daqui.

## Fases

| Fase                                    | Entrega                                                          | Status       |
| --------------------------------------- | ---------------------------------------------------------------- | ------------ |
| [01-plans-screen](01-plans-screen.md)   | Botão "Seja Premium" no Perfil e tela de planos com a comparação | em andamento |
| [02-plan-purchase](02-plan-purchase.md) | Checkout no navegador, tela de resultado e atualização da conta  | em andamento |

## Glossário

- **Nível (`tier`):** `free`, `basic` ou `premium`.
- **Plano:** um nível com o preço dele.
- **Assinante:** aluno com role `BASIC_STUDENT` ou `PREMIUM_STUDENT`.
