# 05. Conta, progresso e conferência final

- **Status:** em andamento (código pronto; falta a build nova e o teste no aparelho, com o dono)
- **Depende de:** fases 01 a 04

## Contexto

Fecha o restante das telas, as conquistas, as datas e os textos de permissão, e confere que não sobrou texto fixo.

## Escopo

- `src/app/(app)/plans/`, `billing.tsx`, `notifications/`, `history.tsx`, `achievements.tsx`, `teacher-chat.tsx` e `(tabs)/progress/`.
- `src/components/plans/`, `premium/`, `billing/`, `notifications/`, `progress/`, `ranking/`, `achievements/`, `teacherChat/`, `AchievementToast.tsx` e `StatCard.tsx`.
- `src/utils/billing.ts`, `plans.ts`, `notifications.ts`, `progress.ts`, `ranking.ts`, `teacherChat.ts`, `date.ts` e `format.ts`.
- Título e descrição das 8 conquistas, pelo `code`, nos três idiomas. Hoje elas estão em inglês no banco, e esse inglês é a referência.
- Datas e números no idioma do app.
- Textos de permissão do iOS (microfone e reconhecimento de fala) nos três idiomas.
- Conferidor de texto fixo.

## Fora do escopo

- Mensagens da professora.
- Preço e moeda, que vêm do Stripe.

## Requisitos

- **RF-01:** todo texto fixo dessas telas sai de `src/locales/`, nos três idiomas.
- **RF-02:** título e descrição de uma conquista saem da tabela do app pelo `code`, na lista, no histórico e no aviso de desbloqueio.
- **RF-03:** uma conquista com `code` desconhecido mostra o texto que veio do backend.
- **RF-04:** datas, tempos relativos e números seguem `getLocale()`.
- **RF-05:** o iPhone mostra os pedidos de permissão no idioma do celular.
- **RF-06:** o conferidor lista qualquer texto com letra acentuada ou palavra em português fora de `src/locales/` e da lista de exceções.

## Critérios de aceite

- [ ] O aviso de conquista aparece em espanhol com o app em espanhol.
- [ ] Datas e o período do ranking aparecem no formato do idioma.
- [x] O conferidor termina sem pendências.
- [ ] O pedido de microfone aparece em espanhol num iPhone em espanhol.

## Desenho técnico

- `src/locales/<idioma>/account.ts`, com as conquistas em `account.achievements.items`: os textos ficaram num arquivo só, porque são poucos. `translateAchievement` (`src/constants/achievements.ts`) troca o título e a descrição pelo `code`: a lista passa por ela em `getProgress`, e o aviso e o ranking na hora de mostrar. O ranking só mandava o título, então `scoreRules.achievements` ganhou o `code` no site (`getRanking`).
- `src/utils/date.ts` junta as datas (`formatShortDate`, `formatLongDate` e `formatDayMonth`), usadas por pagamentos, chat com a professora, conquistas e histórico.
- `src/utils/ranking.ts`: troca `pt-BR` por `getLocale()`. O fuso continua igual. Em inglês, a posição sai como "#4", sem ordinal.
- `locales/{pt,en,es}.json` e `locales` no `app.config.ts`, com `NSMicrophoneUsageDescription` e `NSSpeechRecognitionUsageDescription`. Confirmar no build do iPhone. O Android não usa esses textos: o pedido é do sistema.
- `scripts/check-translations.mjs`: varre `src/` em busca de texto fixo. As exceções ficam numa lista no próprio script, com o motivo: a abertura fixa da Gisa, os nomes dos idiomas e o `pt-BR` do reconhecimento de fala.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
node scripts/check-translations.mjs
```

No aparelho, percorrer o app nos três idiomas. Fica com o dono.

## Tarefas

- [x] Trocar os textos e escrever `en` e `es`.
- [x] Conquistas por `code`.
- [x] Datas e números.
- [x] Textos de permissão.
- [x] Conferidor, até zerar.
- [ ] Marcar a iniciativa como concluída nos dois repositórios, depois do teste do dono.
