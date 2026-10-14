# Arquitetura

Desenho técnico que as duas fases compartilham.

## Contrato das rotas

Espelho do contrato em `.specs/notifications/architecture.md` do site; ao mudar um, mude o outro. Todas com o token da sessão. Erros como `{ "error": string }`; o `401` encerra o login pelo `api` (`src/lib/api.ts`).

`GET /api/mobile/notifications?cursor=<cursor>`

```json
{
  "notifications": [
    {
      "id": "ckx...",
      "title": "Sua lição de casa foi corrigida",
      "body": "A professora corrigiu \"Minha rotina\". Veja a nota e o comentário no site.",
      "receivedAt": "2026-10-20T17:00:00.000Z",
      "readAt": null,
      "link": null
    },
    {
      "id": "ckx...",
      "title": "Curso novo no app",
      "body": "...",
      "receivedAt": "2026-10-19T12:00:00.000Z",
      "readAt": "2026-10-19T12:30:00.000Z",
      "link": {
        "type": "screen",
        "path": "/progress",
        "label": "Ver meu progresso"
      }
    }
  ],
  "nextCursor": "ckx...",
  "unread": 1
}
```

- Ordem: `receivedAt` do mais novo para o mais antigo, 20 por página. `nextCursor` é `null` na última página; o app só o devolve, sem interpretar.
- `link`: `{ "type": "screen", "path", "label" }`, `{ "type": "url", "url", "label" }` ou `null`.
- `unread`: total de não lidas da conta, não só da página.
- Uma notificação agrupada (ex.: várias mensagens da professora no chat) pode voltar ao topo com outro texto e o mesmo `id`.

`GET /api/mobile/notifications/unread` → `{ "unread": 3 }`

`GET /api/mobile/notifications/[id]` → `{ "notification": { ...mesmo formato do item } }`. Não marca como lida. `404` com "Notificação não encontrada." quando não é da conta ou foi excluída.

`POST /api/mobile/notifications/[id]/read` → `{ "unread": 2 }`. Idempotente.

`POST /api/mobile/notifications/read-all` → `{ "unread": 0 }`

`POST /api/mobile/push-tokens` (fase 02), corpo `{ "token": "ExponentPushToken[...]", "platform": "android" | "ios" }` → `{ "ok": true }`. `400` com "Token inválido."

`DELETE /api/mobile/push-tokens` (fase 02), corpo `{ "token": "..." }` → `{ "ok": true }`.

## Push

O backend envia pela Expo com `title`, `body` e `data: { notificationId, link }`, em que `link` tem o formato acima. Canal do Android: `default`.

## Peças do app

- `src/services/notifications.ts`: tipos (`NotificationItem`, `NotificationLink`) e as chamadas das rotas.
- `src/contexts/NotificationsContext.tsx`: o número de não lidas da conta, com `refreshUnread`, `setUnread` (para as rotas que já devolvem o número) e, na fase 02, o registro do push. Fica em `src/app/(app)/_layout.tsx`, ao lado de `TeacherChatUnreadProvider`.
- `src/utils/notifications.ts`: `openNotificationLink(router, link)` (tela com `router.push`, URL com `WebBrowser.openBrowserAsync`) e a formatação do contador (reutiliza `formatUnread` de `src/utils/teacherChat.ts`).
- `src/components/notifications/`: `NotificationBell`, `NotificationRow`.
- Telas: `src/app/(app)/notifications/index.tsx` e `src/app/(app)/notifications/[id].tsx`.
- Rotas em `API_ROUTES` (`src/constants/config.ts`): `notifications`, `notificationsUnread`, `notification(id)`, `notificationRead(id)`, `notificationsReadAll`, `pushTokens`.

O `path` vem do backend como texto; o app o passa a `router.push` com uma conversão de tipo (`as Href`), porque as rotas tipadas não conhecem caminhos montados em tempo de execução.
