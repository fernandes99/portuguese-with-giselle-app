# Portuguese With Giselle (app)

App React Native + Expo do curso. O backend é o site Next.js do repositório `portuguese-with-giselle` (normalmente em `../portuguese-with-giselle`); este repositório não tem servidor nem banco.

Configuração, variáveis de ambiente e o passo a passo do Google estão em `README.md`.

## Stack

- Expo SDK 57, Expo Router (rotas em `src/app/`), React Native 0.86, TypeScript `strict`.
- NativeWind 4 com Tailwind 3. O NativeWind 5 ainda é release candidate; não suba.
- Yarn 1. Para pacotes do Expo ou com código nativo use `npx expo install <pacote>`, que escolhe a versão compatível com o SDK.
- Lint com Biome, formatação com Prettier (`prettier-plugin-tailwindcss`), como no site.

O Expo muda APIs a cada SDK. Antes de usar uma API do Expo, confira os tipos em `node_modules` ou a documentação da versão em `https://docs.expo.dev/versions/v57.0.0/`.

## Comandos

```bash
yarn start         # servidor de desenvolvimento (precisa de development build)
yarn android       # gera e instala o build Android
yarn lint          # Biome
yarn tsc --noEmit  # typecheck
yarn format        # Prettier
npx expo-doctor    # confere dependências e configuração
```

Antes de commitar: `yarn lint`, `yarn tsc --noEmit` e `npx expo-doctor`. Não há testes automatizados.

O terminal é PowerShell no Windows; use `;` para encadear comandos, não `&&`.

## Estrutura

- `src/app/`: rotas. `_layout.tsx` carrega fontes, segura a splash e separa `(auth)` de `(app)` com `Stack.Protected`.
- `src/app/(auth)/`: login e cadastro. `src/app/(app)/`: área logada. As abas de baixo (Dashboard, Cursos, Progresso, Perfil) ficam em `src/app/(app)/(tabs)/`; telas que abrem por cima das abas entram direto em `(app)/`.
- `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`.
- `src/contexts/AuthContext.tsx`: sessão (`status`, `user`, `token`, `signIn`, `signOut`).
- `src/lib/`: `api` (fetch com Bearer e `ApiError`), `storage` (SecureStore), `google`.
- `src/services/`: chamadas ao backend, uma função por rota.
- `app.config.ts`: configuração nativa. As pastas `android/` e `ios/` são geradas e não são versionadas; nunca edite à mão.

## Cuidados

- Rotas novas do backend entram em `API_ROUTES` (`src/constants/config.ts`) e precisam existir no site. Rotas autenticadas do site usam cookie; para o app, o site precisa aceitar Bearer com `getMobileUser` (`src/lib/mobile-auth.ts` de lá).
- Erros do backend vêm como `{ error: string }` em português; `api()` os transforma em `ApiError`.
- Textos da interface em português, iguais aos do site.
- Cada peso da Poppins é uma família: use `font-poppins`, `font-poppins-medium`, `font-poppins-semibold` e `font-poppins-bold`, não `font-bold`.
- Cores da marca ficam em `tailwind.config.js` e, para props sem `className`, em `src/constants/theme.ts`. Mantenha os dois iguais.
- `.env` não é versionado. Variáveis `EXPO_PUBLIC_*` vão para o bundle: nada de segredos.
- Bibliotecas com código nativo exigem novo development build.

## Commits

Mesmo padrão do site: `feat:`, `fix:` ou `chore:`, frase curta em inglês, minúsculas, imperativo, sem escopo e sem ponto final. Um commit por assunto. Documentação em português.

A branch principal é a `main`, como no site, e o trabalho vai direto nela.
