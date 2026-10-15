# Arquitetura

O desenho completo do backend está no repositório do site, em `.specs/onboarding/01-preferences-api.md` e `02-language-name-level.md`. Este arquivo repete o contrato que o app usa e descreve as telas.

## Rotas

Autenticadas com o token Bearer (`api` de `src/lib/api.ts`). Sem token válido, `401`, tratado como nas outras telas.

### Usuário da sessão

`User` (`src/services/auth.ts`) ganha `onboardingCompleted?: boolean`, devolvido pelo login, pelo login com Google e pelo `me`. Ausente conta como `true`.

### `GET /api/mobile/preferences`

```ts
type PreferenceOption = {
  id: string;
  title: string;
  description: string | null; // null nos interesses e nos idiomas
  emoji: string | null; // nos interesses e nos idiomas
  group: string | null; // só nos níveis: "Iniciante", "Intermediário", "Avançado"
};

type Preferences = {
  nativeLanguage: 'SPANISH' | 'ENGLISH' | 'OTHER' | null; // null: respondeu antes da fase 03
  level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  goal: 'PROFESSIONAL' | 'PERSONAL' | 'TRAVEL' | 'ACADEMIC';
  interests: string[];
};

type PreferencesResponse = {
  preferences: Preferences | null; // null: ainda não respondeu
  options: {
    nativeLanguages: PreferenceOption[];
    levels: PreferenceOption[];
    goals: PreferenceOption[];
    interests: PreferenceOption[];
    interestsCount: number; // 3
  };
};
```

Nos níveis, o título é o código (`A0`), e a descrição é a frase do cartão.

### `PUT /api/mobile/preferences`

Corpo `{ nativeLanguage, name, level, goal, interests }`. O nome troca o nome da conta (de 1 a 80 caracteres; o backend tira os espaços sobrando). `200` com `{ preferences, name }`, o nome sendo o da conta depois de gravar; `400` com `{ "error": "Respostas inválidas." }`; `500` com `{ "error": "Não foi possível salvar suas respostas." }`.

O backend aceita o corpo sem `nativeLanguage` e sem `name` (o das fases 01 e 02), mas o app manda os dois.

## Navegação

`src/app/_layout.tsx` passa a ter três grupos protegidos:

| Grupo          | Guarda                                           |
| -------------- | ------------------------------------------------ |
| `(auth)`       | sem login                                        |
| `(onboarding)` | com login e `user.onboardingCompleted === false` |
| `(app)`        | com login e `user.onboardingCompleted !== false` |

Quando a gravação termina, o `AuthContext` marca `onboardingCompleted: true` e grava o nome devolvido no usuário (em memória e na sessão guardada), e o Expo Router troca de grupo sozinho. Os providers de `(app)` (sino, chat da professora, push) só montam nessa hora; um toque de push pendente é tratado então.

A edição pelo Perfil é a rota `/preferences`, dentro de `(app)`, com o mesmo componente do fluxo. Ao gravar, o nome devolvido vai para a sessão (`updateUser`).

## Passos

| Passo         | Fluxo           | Edição         |
| ------------- | --------------- | -------------- |
| Idioma nativo | 1/6             | 1/5            |
| Nome          | 2/6             | 2/5            |
| Nível         | 3/6             | 3/5            |
| Objetivo      | 4/6             | 4/5            |
| Temas         | 5/6             | 5/5 ("Salvar") |
| Boas-vindas   | 6/6 ("Começar") | —              |

Os passos são estado de uma tela só (`getPreferencesSteps` em `src/utils/preferences.ts`). As respostas são gravadas uma vez, no último passo.

## Layout de cada passo

```
┌─────────────────────────────────────┐
│ ←  ████████████░░░░░░░░░░░░░░░░░░░  │  FlowHeader: voltar (ou X) e barra verde
│                                     │
│ (foto)  ╭───────────────────────╮   │  TeacherAvatar 56 + balão branco,
│         │ Qual é a sua língua   │   │  borda gray-200, cantos 2xl
│         │ nativa?               │   │  (o de cima à esquerda menor)
│         ╰───────────────────────╯   │
│                                     │
│ Escolha a opção que faz mais        │  instrução, gray-500, text-sm
│ sentido pra você:                   │
│ ┌─────────────────────────────────┐ │
│ │ 🇪🇸  Español                  ○  │ │  ChoiceCard: branco, borda gray-200,
│ └─────────────────────────────────┘ │  rounded-2xl; selecionado: borda
│ ┌─────────────────────────────────┐ │  green-600, fundo green-50 e o
│ │ 🇺🇸  English                  ○  │ │  círculo verde com check
│ └─────────────────────────────────┘ │
│                ...                  │
├─────────────────────────────────────┤
│ [          Continuar           ]    │  FlowFooter (Button lg, verde)
└─────────────────────────────────────┘
```

- Fundo `bg-background`, como as outras telas. O conteúdo rola; o topo e o rodapé ficam fixos, e o rodapé sobe com o teclado.
- **Idioma:** `ChoiceCard` com o emoji da bandeira à esquerda, só o título.
- **Nome:** o `TextField` do app ("Seu nome"), já com o nome da conta, e a frase de ajuda abaixo. O "próximo" do teclado avança.
- **Nível:** os níveis agrupados pelo `group`, cada grupo com o título em maiúsculas (`gray-500`, `text-xs`). `LevelCard`: selo quadrado (`rounded-xl`, 48) com o código em `green-700` sobre `green-100`, a frase ao lado e o círculo de marcado; selecionado, o selo fica `green-600` com o texto branco.
- **Objetivo:** `ChoiceCard`, com um ícone à esquerda (tabela abaixo).
- **Temas:** "chips" que quebram linha: `rounded-full`, borda `gray-200`, fundo branco; cada um com o emoji do tema (vindo da rota) antes do nome; selecionado com borda `green-600`, fundo `green-50` e texto `green-700` (tema sem emoji mostra um ícone de check quando selecionado). Acima deles, o contador "2 de 3".
- **Boas-vindas:** sem balão; a foto da professora (96), o título, a frase e a assinatura, centralizados no meio da tela.
- Sem sombras: cartões e chips separados por borda.

## Textos

| Onde                           | Texto                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Balão, idioma (fluxo)          | "Olá! Antes de começar, quero conhecer você. Qual é a sua língua nativa?"                                                                 |
| Balão, idioma (edição)         | "Qual é a sua língua nativa?"                                                                                                             |
| Balão, nome                    | "Como você quer que eu te chame?"                                                                                                         |
| Ajuda, nome                    | "É assim que a professora vai te chamar nas aulas e no app."                                                                              |
| Balão, nível (fluxo)           | "Prazer, {primeiro nome}! Como você descreveria seu português hoje?" (sem nome, ou na edição: só a pergunta)                              |
| Instrução, nível               | "Não existe resposta errada: as aulas se adaptam ao seu ritmo."                                                                           |
| Balão, objetivo                | "Por que você quer aprender português?"                                                                                                   |
| Balão, temas                   | "Sobre quais temas você mais gosta de conversar?"                                                                                         |
| Instrução, idioma e objetivo   | "Escolha a opção que faz mais sentido pra você:"                                                                                          |
| Instrução, temas               | "Escolha 3 temas:"                                                                                                                        |
| Contador, temas                | "{n} de 3"                                                                                                                                |
| Título, boas-vindas            | "Boas-vindas, {primeiro nome}!" (sem nome: "Boas-vindas!")                                                                                |
| Frase, boas-vindas             | "Ninguém fica fluente de um dia para o outro. Um passo de cada vez, todos os dias, é o que vai fazer você falar português com confiança." |
| Assinatura, boas-vindas        | "Professora Giselle"                                                                                                                      |
| Botão                          | "Continuar"; "Começar" nas boas-vindas; "Salvar" nos temas, na edição                                                                     |
| Toque no botão sem resposta    | aviso "Escolha uma opção para continuar." / "Digite seu nome para continuar." / "Escolha 3 temas para continuar."                         |
| 4º tema                        | aviso "Você já escolheu 3 temas. Desmarque um para trocar."                                                                               |
| Sair no primeiro passo (fluxo) | alerta "Sair da conta?" com "Cancelar" e "Sair"                                                                                           |

Os títulos, as descrições, os grupos e os emojis das opções vêm da rota. Ícones dos objetivos, por código (desconhecido usa `ellipse-outline`):

| Código         | Ícone (Ionicons)    |
| -------------- | ------------------- |
| `PROFESSIONAL` | `briefcase-outline` |
| `PERSONAL`     | `heart-outline`     |
| `TRAVEL`       | `airplane-outline`  |
| `ACADEMIC`     | `school-outline`    |

## Arquivos

- `src/services/preferences.ts`: tipos acima, `getPreferences(token)` e `savePreferences(token, input)`.
- `src/components/preferences/`:
  - `PreferencesFlow.tsx`: os passos, com `mode: 'onboarding' | 'edit'`, a carga das opções, o estado das escolhas e a gravação.
  - `TeacherPrompt.tsx`: a foto e o balão com a pergunta.
  - `ChoiceCard.tsx`: cartão de opção única, com título, descrição e ícone ou emoji opcionais; exporta o `RadioMark`, o círculo de marcado.
  - `LevelCard.tsx`: cartão do nível, com o selo do código.
  - `NameStep.tsx`: o campo do nome.
  - `InterestChip.tsx`: chip de tema.
  - `WelcomeStep.tsx`: a tela de boas-vindas.
- `src/utils/preferences.ts`: os passos por modo, os textos e o agrupamento dos níveis.
- `src/app/(onboarding)/_layout.tsx` e `src/app/(onboarding)/index.tsx`: o fluxo.
- `src/app/(app)/preferences.tsx`: a edição.
- `src/contexts/AuthContext.tsx`: `completeOnboarding(name)` e `updateUser(changes)`.
- `FlowHeader` (`src/components/lesson-flow/FlowHeader.tsx`) ganha o ícone de voltar como opção, além do "X".
