# Arquitetura

O que as duas fases compartilham.

## Navegação

```
(tabs)/practice                       Praticar             ganha a opção "Aulas particulares"
practice/private-lessons              Aulas particulares   saldo, próxima aula e ações        fase 01
practice/private-lessons/buy          Comprar aulas        quantidade e total                 fase 01
practice/private-lessons/purchase     Resultado da compra  confirmação, espera ou cancelada   fase 01
practice/private-lessons/bookings     Agendamentos         lista                              fase 02
```

Todas são da pilha de `src/app/(app)/_layout.tsx`, abertas por cima das abas, com o cabeçalho de voltar (`LessonHeader`). A tela de resultado é também o destino do endereço `pwg://practice/private-lessons/purchase`, para onde o site devolve o aluno depois do pagamento.

## Contrato das rotas

Espelho do contrato em `.specs/private-lessons/README.md` do site; ao mudar um, mude o outro. Todas com o token da sessão. Erros como `{ "error": string }`; o `401` encerra o login pelo `api`.

`GET /api/mobile/private-lessons`

```json
{
  "available": 3,
  "price": { "unitAmount": 2500, "currency": "usd" },
  "maxQuantity": 10,
  "changeNoticeHours": 12,
  "contactEmail": "gisellemayra6@gmail.com",
  "nextLesson": null
}
```

- `available`: aulas disponíveis.
- `price.unitAmount`: preço de uma aula, em centavos.
- `nextLesson`: um agendamento (formato abaixo) ou `null`. Até a fase 02 do site, sempre `null`.

`POST /api/mobile/private-lessons/checkout`, com `{ "quantity": 2 }`. Responde `{ "url": "...", "sessionId": "cs_..." }`. `400` para quantidade inválida.

`GET /api/mobile/private-lessons/purchases/[sessionId]`. Responde `{ "status": "paid" | "pending" | "expired", "quantity": 2, "available": 5 }`. `404` quando a compra não é da conta.

`POST /api/mobile/private-lessons/scheduling-link`, sem corpo. Responde `{ "url": "..." }`. `409` sem aulas disponíveis; `502` quando a agenda falha.

`GET /api/mobile/private-lessons/bookings`

```json
{
  "bookings": [
    {
      "id": "ckx...",
      "title": "Private Lesson",
      "startTime": "2026-10-20T17:00:00.000Z",
      "endTime": "2026-10-20T17:50:00.000Z",
      "status": "scheduled",
      "joinUrl": "https://meet.google.com/abc-defg-hij",
      "canChange": true,
      "rescheduleUrl": "https://calendly.com/reschedulings/...",
      "cancelUrl": "https://calendly.com/cancellations/...",
      "creditReturned": false
    }
  ]
}
```

- `status`: `scheduled`, `completed` ou `canceled`, já calculado pelo backend.
- A lista vem na ordem de exibição: os `scheduled` primeiro, do mais próximo ao mais distante; depois os demais, do mais recente ao mais antigo.
- `canChange`: faltam `changeNoticeHours` horas ou mais. `rescheduleUrl` e `cancelUrl` só vêm nesse caso; `joinUrl`, só em `scheduled`.
- `creditReturned`: em `canceled`, se a aula voltou para o saldo.
- Datas são instantes em ISO; o app mostra no fuso do aparelho.

## Compra: do toque à confirmação

1. `buy` chama o checkout com a quantidade e recebe `url` e `sessionId`.
2. Abre `url` com `WebBrowser.openAuthSessionAsync(url, 'pwg://practice/private-lessons/purchase')`.
3. O Stripe devolve o aluno à página do site, que redireciona para o endereço `pwg://`. O navegador fecha e a chamada resolve.
4. Qualquer que seja o resultado da chamada (retorno, fechado à mão ou cancelado), o app vai para `purchase` com o `sessionId` que guardou no passo 1. Não depende dos parâmetros do endereço de retorno.
5. `purchase` consulta a rota de conferência: a cada 2 segundos, até 10 vezes, enquanto vier `pending`.

No Android, o endereço `pwg://` pode abrir a rota `purchase` direto pelo Expo Router, com `session_id` nos parâmetros. A tela aceita o id pelos dois caminhos (`sessionId` da navegação interna ou `session_id` do endereço), e a navegação do passo 4 usa `replace`, para não empilhar duas telas iguais.

## Estado

- O resumo (`getPrivateLessons`) e a lista (`getBookings`) usam `useApiQuery` (`src/hooks/useApiQuery.ts`): carregam ao abrir, recarregam ao voltar ao foco e expõem `refresh`.
- A conferência da compra tem um hook próprio, `usePurchaseStatus(sessionId)`, que repete a consulta e para ao sair da tela.
- Nada é guardado no aparelho: saldo, compras e agendamentos são sempre os do backend.
- Funções puras em `src/utils/privateLessons.ts`: `formatPrice(unitAmount, currency, quantity)`, `formatAvailable(count)` ("1 aula disponível", "3 aulas disponíveis", "Nenhuma aula disponível"), `formatLessonDate`, `formatLessonTime`, `isLessonNow` e `canChangeLesson(lesson, changeNoticeHours, now)`.

## Arquivos

| Arquivo                                               | Papel                                               | Fase   |
| ----------------------------------------------------- | --------------------------------------------------- | ------ |
| `src/services/privateLessons.ts`                      | Chamadas às rotas e tipos do contrato               | 01, 02 |
| `src/utils/privateLessons.ts`                         | Textos, preço, datas e regra de prazo               | 01, 02 |
| `src/hooks/usePurchaseStatus.ts`                      | Conferência repetida da compra                      | 01     |
| `src/hooks/useRefreshAfterBrowser.ts`                 | Recargas depois de voltar de uma página do Calendly | 02     |
| `src/app/(app)/practice/private-lessons/index.tsx`    | Tela principal                                      | 01, 02 |
| `src/app/(app)/practice/private-lessons/buy.tsx`      | Escolha de quantidade e ida ao pagamento            | 01     |
| `src/app/(app)/practice/private-lessons/purchase.tsx` | Resultado da compra                                 | 01     |
| `src/components/privateLessons/BalanceCard.tsx`       | Saldo em destaque                                   | 01     |
| `src/components/privateLessons/QuantityStepper.tsx`   | Mais e menos da quantidade                          | 01     |
| `src/app/(app)/practice/private-lessons/bookings.tsx` | Lista de agendamentos                               | 02     |
| `src/components/privateLessons/NextLessonCard.tsx`    | Próxima aula                                        | 02     |
| `src/components/privateLessons/BookingRow.tsx`        | Um agendamento na lista                             | 02     |
| `src/components/privateLessons/LessonActions.tsx`     | Entrar, remarcar, cancelar ou enviar email          | 02     |

## Reaproveitado sem alterar

- `api`, `ApiError` e `getErrorMessage` (`src/lib/api.ts`); `useApiQuery`; `useAuth`.
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), `EmptyState` (`src/components/lesson/EmptyState.tsx`), `Button` e `colors`.
- `PracticeOption`, dentro de `(tabs)/practice.tsx`.
- `expo-web-browser` (pagamento e páginas do Calendly) e `expo-linking` (sala da aula e email).

## Padrões visuais

- Textos em português. O título da aula vem do Calendly e aparece como está.
- Preço no formato "US$ 25,00".
- Fonte Poppins, cores do tema; verde para a ação principal e para "agendada", cinza para "realizada", vermelho suave para "cancelada".
- Cartões separados por borda ou cor de fundo, sem sombra pequena.
- Datas e horas no fuso do aparelho, em formato de 24 horas.
