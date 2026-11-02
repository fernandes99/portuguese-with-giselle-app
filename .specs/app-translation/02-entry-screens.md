# 02. Telas de entrada

- **Status:** em andamento (código pronto; falta o teste no aparelho, com o dono)
- **Depende de:** fase 01

## Contexto

São as primeiras telas que o aluno vê, antes de escolher qualquer coisa, então elas dependem do idioma do celular.

## Escopo

- `src/components/WelcomeScreen.tsx`, `AuthScreen.tsx`, `PasswordRules.tsx`, `GoogleButton.tsx`, `TextField.tsx`, `CodeInput.tsx`.
- `src/app/(auth)/`.
- `src/app/(onboarding)/`, `src/components/preferences/` e `src/utils/preferences.ts`.
- `src/components/AppTabBar.tsx`, `TabTopBar.tsx` e `src/app/(app)/(tabs)/_layout.tsx`, `index.tsx` e `profile.tsx`.
- `src/app/(app)/preferences.tsx` e `src/components/learn/`.

## Fora do escopo

- Títulos de cursos e módulos na aba Início, que são conteúdo.

## Requisitos

- **RF-01:** todo texto fixo dessas telas sai de `src/locales/`, nos três idiomas.
- **RF-02:** as regras de senha e as mensagens de validação do cadastro seguem o idioma do app.
- **RF-03:** a mensagem da tela final das boas-vindas (`WELCOME_MESSAGE`) segue o idioma do app.

## Critérios de aceite

- [ ] Com o celular em espanhol, a introdução, o login e o cadastro aparecem em espanhol.
- [ ] Os nomes dos idiomas nas boas-vindas continuam no próprio idioma.
- [x] Com o app em português, nenhum texto mudou.

## Desenho técnico

`src/locales/<idioma>/entry.ts`, seguindo as regras do `README.md`, e `common.ts` para o que outras áreas repetem (voltar, tentar de novo, salvar). `formatLessons` e `formatModules` (`src/utils/course.ts`) entraram aqui, porque o Início usa os dois, e a mensagem do Google no Expo Go (`src/lib/google.ts`) também. A frase dos termos, com dois links no meio, fica em partes (`termsPrefix`, `termsAnd`), para os links não dependerem da ordem das palavras.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, percorrer o cadastro nos três idiomas. Fica com o dono.

## Tarefas

- [x] Trocar os textos e escrever `en` e `es`.
- [ ] Marcar a fase como concluída no `README.md`, depois do teste no aparelho.
