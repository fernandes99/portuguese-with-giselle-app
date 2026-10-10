# Portuguese With Giselle (app)

App do curso Portuguese With Giselle, feito com React Native e Expo. Usa a mesma conta do site: o backend é o app Next.js do repositório `portuguese-with-giselle`.

Hoje o app tem splash screen, login, cadastro (com código por email e Google) e uma tela inicial em branco.

## Rodando

O login com Google usa código nativo, então o app **não roda no Expo Go**. É preciso um development build.

```bash
yarn install
cp .env.example .env   # e preencha os valores
yarn android           # gera e instala o development build (Android Studio + JDK)
yarn start             # nas próximas vezes, só o servidor de desenvolvimento
```

No Windows só dá para gerar o Android localmente. Para iOS, ou sem Android Studio, use o EAS:

```bash
npx eas-cli@latest build --profile development --platform android
```

### Sem Android Studio: Expo Go

Para testar só email e senha, sem build nativo, instale o Expo Go no celular e rode:

```bash
yarn start:go
```

O comando abre um túnel e mostra um QR code. No Expo Go o login com Google fica desligado e a splash e o ícone são os do próprio Expo Go.

O túnel só expõe o bundle do app. Para o celular alcançar o site local, use o IP da máquina na rede em `EXPO_PUBLIC_API_URL` (mesmo Wi-Fi) ou aponte para o site em produção.

## Variáveis de ambiente

Ficam em `.env`, que não é versionado. Veja `.env.example`.

| Variável                           | O que é                                                         |
| ---------------------------------- | --------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`              | URL do site. Em produção, `https://portuguesewithgiselle.com`.  |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth client Web do Google, o mesmo `GOOGLE_CLIENT_ID` do site. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth client iOS do Google.                                     |

Para testar contra o site rodando na sua máquina (`yarn dev` no outro repositório):

- emulador Android: `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`
- aparelho físico: `http://<ip-da-máquina>:3000`

Variáveis `EXPO_PUBLIC_*` entram no bundle do app. Não coloque segredos nelas.

## Login com Google

No Google Cloud, no **mesmo projeto** do OAuth client Web que o site já usa, crie mais dois clients:

1. **Android**: pacote `com.portuguesewithgiselle.app` e o SHA-1 do certificado que assina o build.
   - Build local: depois do primeiro `yarn android`, rode `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android`.
   - Build do EAS: `npx eas-cli@latest credentials` mostra o SHA-1.
   - Cada keystore (debug, EAS, Play Store) tem um SHA-1 diferente e precisa do seu próprio client Android.
2. **iOS**: bundle ID `com.portuguesewithgiselle.app`. O client ID vai em `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

O client Android não aparece em nenhuma variável: o Google confere o pacote e o SHA-1 sozinho. O ID token que o app recebe tem como audiência o client Web, e é isso que o backend valida.

Depois de mudar a variável do iOS, gere o build de novo, porque ela vira URL scheme nativo (`app.config.ts`).

## Backend

O app chama estas rotas do site:

| Rota                           | Uso                                                 |
| ------------------------------ | --------------------------------------------------- |
| `POST /api/mobile/auth/login`  | Login com email e senha. Devolve `{ token, user }`. |
| `POST /api/mobile/auth/google` | Login com o ID token do Google.                     |
| `GET /api/mobile/auth/me`      | Valida o token guardado e devolve um renovado.      |
| `POST /api/email/send`         | Cadastro: envia o código de 6 dígitos.              |
| `POST /api/auth/verify-code`   | Cadastro: confere o código.                         |
| `POST /api/auth/register`      | Cadastro: cria a conta.                             |

O token vale 30 dias, fica no `expo-secure-store` e vai no header `Authorization: Bearer`.

## Comandos

```bash
yarn lint          # Biome
yarn tsc --noEmit  # typecheck
yarn format        # Prettier
npx expo-doctor    # confere dependências e configuração
```

## Pendências

- O ícone e a splash usam o favicon do site ampliado. Falta a arte final em 1024x1024.
- "Esqueci a senha" não existe porque o site ainda não tem esse fluxo.
