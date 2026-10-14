# 02. Push no aparelho

- **Status:** em andamento
- **Depende de:** [01](01-notifications-screens.md), fase 02 do site (tokens e envio) e os pré-requisitos abaixo

## Contexto

Com a fase 01, o aluno vê as notificações quando abre o app. Esta fase faz o aviso chegar com o app fechado: o app pede permissão, pega o token de push da Expo, manda o token para o backend e trata o toque no push.

`expo-notifications` tem código nativo: a fase exige um novo development build e um novo build de loja.

## Pré-requisitos

Quem faz é o dono do projeto. Nenhuma chave ou arquivo de credencial entra no repositório.

1. **Android (Firebase):**
   - Criar um projeto no Firebase com um app Android de pacote `com.portuguesewithgiselle.app`.
   - Baixar o `google-services.json`. Para o EAS, ele entra como variável de ambiente do tipo arquivo, `GOOGLE_SERVICES_JSON`, nos ambientes `development`, `preview` e `production`. Para builds locais, o arquivo fica na raiz do app (fora do git) e o `.env` aponta para ele: `GOOGLE_SERVICES_JSON=./google-services.json`. Sem a variável, o build sai sem push no Android.
   - Gerar uma chave de conta de serviço do Firebase e cadastrá-la no EAS como credencial de push FCM V1 (`eas credentials`, Android, "Google Service Account Key for Push Notifications (FCM V1)").
2. **iOS (Apple):** com a conta paga do Apple Developer, criar a chave de push pelo `eas credentials` (iOS, "Push Notifications"). Sem a conta, o push no iOS fica para depois; o Android funciona sozinho.

## Escopo

- Dependências `expo-notifications` e `expo-device`, plugin no `app.config.ts` e o `google-services.json`.
- Canal de notificações do Android.
- Pedido de permissão, registro e remoção do token.
- Push com o app aberto, em segundo plano e fechado; toque no push.
- Aviso na tela de notificações quando a permissão foi negada.

## Fora do escopo

- Número no ícone do app.
- Ações no push (responder, marcar como lida).
- Notificações locais agendadas pelo app.

## Requisitos

- **RF-01:** ao abrir, o app cria o canal `default` do Android, com nome "Notificações" e importância alta, antes de qualquer pedido de permissão.
- **RF-02:** na primeira vez que as abas aparecem depois do login, se a permissão ainda não foi decidida, o app a pede. A marca de que já pediu fica no aparelho (`src/lib/storage.ts`) e não é apagada ao sair da conta.
- **RF-03:** com permissão, o app pega o token (`getExpoPushTokenAsync` com o `projectId` do EAS de `app.config.ts`) e o manda para `POST /api/mobile/push-tokens` com a plataforma. Isso acontece a cada abertura do app com sessão e quando o sistema troca o token (`addPushTokenListener`).
- **RF-04:** em emulador sem serviços do Google, ou no simulador do iOS, falha ao pegar o token não mostra erro ao aluno; vai para o log de desenvolvimento.
- **RF-05:** com o app aberto, o push aparece como banner com som, e o contador do sino é buscado de novo.
- **RF-06:** tocar no push, com o app aberto, em segundo plano ou fechado, marca a notificação como lida (`POST .../read`, atualizando o contador) e abre o destino do `data.link`: `screen` com `router.push`, `url` no navegador do app; sem link, abre `/notifications/<notificationId>`.
- **RF-07:** um toque que abriu o app fechado é tratado uma vez só, depois que a sessão foi carregada; sem sessão, o toque é ignorado e o app segue para o login.
- **RF-08:** `signOut` (`src/contexts/AuthContext.tsx`) chama `DELETE /api/mobile/push-tokens` com o token do aparelho antes de apagar a sessão. Falha nessa chamada não impede a saída.
- **RF-09:** com a permissão negada, a tela de notificações mostra no topo um aviso com borda: "Ative as notificações para saber quando a professora responder." e o botão "Ativar", que abre os ajustes do app (`Linking.openSettings()`).
- **RF-10:** no Android, o ícone pequeno do push é uma versão branca sobre fundo transparente do símbolo do app (`assets/notification-icon.png`), com a cor de destaque verde do tema.

## Critérios de aceite

- [ ] Primeira entrada depois do login: o pedido de permissão aparece uma vez; ao sair e entrar de novo, não aparece mais.
- [ ] Com permissão, há uma linha em `push_tokens` para a conta, com a plataforma certa.
- [ ] Com o app fechado, uma notificação enviada pelo painel chega com título e descrição; tocar nela abre o app na tela do destino e o sino já mostra um a menos.
- [ ] Com o app aberto em outra tela, o push aparece como banner e o sino atualiza.
- [ ] Um push sem destino abre o detalhe da notificação.
- [ ] Depois de sair da conta, uma notificação nova para ela não chega ao aparelho.
- [ ] Com a permissão negada, a tela de notificações mostra o aviso, e "Ativar" abre os ajustes do app.
- [ ] `yarn lint` sem avisos, `yarn tsc --noEmit` e `npx expo-doctor` passam; o development build novo instala e abre.

## Desenho técnico

Criar:

- `src/lib/pushNotifications.ts`: canal, permissão, token e o `setNotificationHandler` (banner e som com o app aberto).
- `src/hooks/usePushRegistration.ts`: pedido na primeira entrada, registro do token e o listener de troca de token.
- `src/hooks/usePushResponse.ts`: trata o toque (`useLastNotificationResponse`), uma vez por notificação.
- `src/lib/push.ts` e `src/lib/pushEnabled.ts`: detectam se o app instalado tem o push e só então carregam o `expo-notifications`.
- `assets/notification-icon.png`.

Alterar:

- `package.json`: `expo-notifications` e `expo-device`, instalados com `npx expo install`.
- `app.config.ts`: plugin `expo-notifications` (cor e canal padrão) e `android.googleServicesFile`, lido de `process.env.GOOGLE_SERVICES_JSON`.
- `.gitignore`: `google-services.json` e `GoogleService-Info.plist`.
- `src/contexts/NotificationsContext.tsx`: usar os dois hooks e expor se a permissão foi negada.
- `src/contexts/AuthContext.tsx`: remover o token no `signOut`.
- `src/services/notifications.ts`: `savePushToken` e `deletePushToken`.
- `src/lib/storage.ts`: a marca de permissão já pedida.
- `src/app/(app)/notifications/index.tsx`: o aviso de permissão negada.
- `CLAUDE.md`: a dependência nativa e o `google-services.json` fora do git.

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`, `npx expo-doctor`.
2. Novo development build (`eas build --profile development` ou `yarn android`) num aparelho Android com serviços do Google.
3. Com o backend com a fase 02 do site: os critérios acima, enviando notificações pelo script do site ou pelo painel (fase 03 do site).
4. Dizer quais critérios foram conferidos no aparelho e quais ficaram para o dono do projeto (o iOS depende da conta da Apple).

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passaram, e as rotas de token foram conferidas no site (fase 02 de lá, com um push de verdade para um token inventado). Nada foi testado no aparelho: falta o development build novo, que depende das credenciais do Firebase. Todos os critérios de aceite ficam para o dono do projeto.

O `expo-notifications` pede o `expo-constants` 57.0.22, e o projeto tinha o 57.0.21: o `expo-constants` subiu para `~57.0.22` e o `yarn.lock` ficou com uma cópia só, como o `expo-doctor` exige para o build nativo. O `expo-doctor` continua acusando outras versões de patch do SDK 57 mais novas que as instaladas, o que já acontecia antes.

Divergências da spec:

- Sem `google-services.json` no build, o `app.config.ts` não aponta arquivo nenhum (em vez de usar `./google-services.json` como padrão): um arquivo que não existe quebraria o build de quem ainda não tem as credenciais.
- O ícone do push no Android (RF-10) não foi feito: precisa de uma versão branca, sobre fundo transparente, do símbolo do app, e o projeto não tem esse desenho. Sem ele, o Android usa o ícone do app. O plugin já tem a cor verde.
- Ao abrir o app sem sessão, um toque pendente no push é descartado em `src/app/_layout.tsx` (RF-07).
- O app também volta a conferir a permissão quando volta ao primeiro plano: quem ativa nos ajustes passa a receber sem reabrir o app.
- O push é opcional (`src/lib/push.ts`): ele só liga quando o app instalado tem os módulos nativos do `expo-notifications` e não é o Expo Go. Num build anterior à dependência, o import do pacote quebrava o app (`Cannot find native module 'ExpoTopicSubscriptionModule'`). Sem os módulos, o pacote nem é carregado (`src/lib/pushEnabled.ts`, por `require`), não há pedido de permissão nem aviso de permissão negada, e o sino, a lista e o detalhe funcionam igual. Nenhum outro arquivo de fora do push importa o `expo-notifications`.

## Tarefas

- [x] Dependências, plugin, `googleServicesFile` e `.gitignore`.
- [ ] Ícone do push no Android.
- [x] `pushNotifications.ts`, canal e handler.
- [x] Permissão e registro do token.
- [x] Toque no push.
- [x] Remoção do token no `signOut`.
- [x] Aviso de permissão negada.
- [x] `CLAUDE.md`.
- [ ] Development build e verificação no aparelho.
- [x] Status desta spec e da tabela do README.
