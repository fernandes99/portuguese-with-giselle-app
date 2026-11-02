# 01. Base de tradução e escolha do idioma

- **Status:** em andamento (código pronto; falta a build nova e o teste no aparelho, com o dono)
- **Depende de:** fase 01 do site (`.specs/app-translation/01-language-in-the-account.md`)

## Contexto

O app não tem biblioteca de tradução nem noção de idioma. Esta fase monta a base e a escolha do idioma, com uma tela já traduzida para provar o caminho: a da troca no Perfil.

## Escopo

- Dependências novas e a build nativa.
- `src/lib/i18n.ts` e `src/locales/`.
- Idioma do celular, idioma guardado e idioma da conta.
- Cabeçalho `X-App-Language` em toda chamada.
- Mudança de idioma nas boas-vindas.
- Tela de idioma aberta pelo Perfil.
- Textos de `src/lib/api.ts`.

## Fora do escopo

- Traduzir as outras telas (fases 02 a 05).
- Textos de permissão do iOS (fase 05).

## Requisitos

- **RF-01:** sem idioma guardado, o app usa o primeiro idioma do celular que seja `pt`, `en` ou `es`, e `en` quando nenhum for.
- **RF-02:** a splash fica na tela até o idioma estar decidido.
- **RF-03:** toda chamada de `api()` manda `X-App-Language` com o idioma atual.
- **RF-04:** ao abrir a sessão, um `user.appLanguage` preenchido vira o idioma do app e é guardado no aparelho; `null` não muda nada.
- **RF-05:** nas boas-vindas, escolher `SPANISH` ou `ENGLISH` muda o app na hora e recarrega as opções dos passos seguintes; `OTHER` não escolhe idioma: o app fica no idioma em que as boas-vindas abriram, mesmo que outra opção tenha sido tocada antes.
- **RF-06:** a gravação do fim das boas-vindas manda `appLanguage` com o idioma atual.
- **RF-07:** o Perfil tem uma linha "Idioma do app" com o idioma atual, que abre a tela com as três opções, com o nome de cada uma no próprio idioma.
- **RF-08:** tocar numa opção chama `PUT /api/mobile/preferences/app-language` e, só com sucesso, muda o app e guarda a escolha.
- **RF-09:** se a gravação falhar, a tela mostra o erro e o app fica no idioma atual.
- **RF-10:** sair da conta mantém o idioma guardado.
- **RF-11:** ao voltar para as outras abas depois da troca, os textos vindos do backend aparecem no idioma novo.

## Critérios de aceite

- [ ] Com o celular em espanhol, a primeira abertura já traz as chamadas com `X-App-Language: es`.
- [ ] Com o celular em francês, as chamadas saem com `en`.
- [ ] Depois de escolher espanhol nas boas-vindas, os níveis, objetivos e temas aparecem em espanhol.
- [ ] Com "Outro idioma" e o celular em português, tudo continua em português, e a conta grava `pt`.
- [ ] Trocar no Perfil muda a tela na hora, e a próxima explicação da Gisa vem no idioma novo.
- [ ] Sem internet, a troca mostra o erro e nada muda.
- [ ] Reinstalar o app e entrar na mesma conta volta ao idioma da conta.

## Desenho técnico

- Dependências: `npx expo install expo-localization`, depois `i18next` e `react-i18next` na última versão estável. Conferir no aparelho se o `Intl.PluralRules` existe no Hermes, que o i18next usa no plural.
- `app.config.ts`: plugin `expo-localization`.
- `src/lib/i18n.ts`: inicia o i18next, com `t`, `AppLanguage`, `APP_LANGUAGES`, `getAppLanguage()`, `getLocale()` (`pt-BR`, `en-US`, `es-ES`), `restoreLanguage()` e `changeAppLanguage(language)`, que também guarda no aparelho.
- `src/locales/{pt,en,es}/index.ts`: juntam os arquivos de cada área. `en` e `es` são tipados por `typeof pt`.
- `src/lib/storage.ts`: `loadLanguage` e `saveLanguage`, com a chave `pwg.language`.
- `src/lib/api.ts`: o cabeçalho, com `getAppLanguage()`, e as mensagens de erro de rede em `t`.
- `src/contexts/AuthContext.tsx`: `restoreLanguage()` é a primeira coisa de `restore`, e `user.appLanguage` é aplicado onde a sessão chega (`restore`, `signIn` e `refreshUser`). Divergiu do desenho inicial, que punha o idioma em `ready` no `src/app/_layout.tsx`: a splash já espera o status `loading`, e assim a chamada do `me` não corre antes do idioma guardado.
- `src/services/auth.ts`: `appLanguage` no tipo `User`.
- `src/services/preferences.ts`: `saveAppLanguage(token, language)` e `appLanguage` na gravação.
- `src/components/preferences/PreferencesFlow.tsx`: a mudança no passo do idioma, só no modo `onboarding`.
- `src/app/(app)/language.tsx`: a tela nova, com o `ChoiceCard` de `src/components/preferences/`, como em `ExplanationLanguageSelector`.
- `src/app/(app)/(tabs)/profile.tsx`: a linha nova, e a tela passa a rolar, porque a lista de opções não cabe nos celulares pequenos com mais uma linha.
- `src/services/simulations.ts`: limpar `cachedList` no evento `languageChanged`, porque a lista guardada viria no idioma anterior.
- As telas com `useApiQuery` recarregam sozinhas ao voltar ao foco, então a troca não precisa recriar a navegação.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com uma build nova: os critérios de aceite, trocando o idioma do celular nas configurações. Ficam com o dono.

## Tarefas

- [x] Dependências e plugin. Avisar o dono da build nova.
- [x] `i18n.ts`, `locales/` e o armazenamento.
- [x] Cabeçalho em `api()`.
- [x] Idioma na abertura e na sessão.
- [x] Mudança nas boas-vindas.
- [x] Tela de idioma e linha no Perfil.
- [x] Atualizar `CLAUDE.md`.
- [ ] Teste no aparelho, com o dono, incluindo o plural no Hermes.
