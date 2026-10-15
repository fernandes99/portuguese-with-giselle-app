# Arquitetura

O desenho completo do backend está no repositório do site, em `.specs/onboarding/01-preferences-api.md`. Este arquivo repete o contrato que o app usa e descreve as telas.

## Rotas

Autenticadas com o token Bearer (`api` de `src/lib/api.ts`). Sem token válido, `401`, tratado como nas outras telas.

### Usuário da sessão

`User` (`src/services/auth.ts`) ganha `onboardingCompleted?: boolean`, devolvido pelo login, pelo login com Google e pelo `me`. Ausente conta como `true`.

### `GET /api/mobile/preferences`

```ts
type PreferenceOption = {
  id: string;
  title: string;
  description: string | null; // null nos interesses
};

type Preferences = {
  level: 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';
  goal: 'PROFESSIONAL' | 'PERSONAL' | 'TRAVEL' | 'ACADEMIC';
  interests: string[];
};

type PreferencesResponse = {
  preferences: Preferences | null; // null: ainda não respondeu
  options: {
    levels: PreferenceOption[];
    goals: PreferenceOption[];
    interests: PreferenceOption[];
    interestsCount: number; // 3
  };
};
```

### `PUT /api/mobile/preferences`

Corpo `{ level, goal, interests }`. `200` com `{ preferences }`; `400` com `{ "error": "Respostas inválidas." }`; `500` com `{ "error": "Não foi possível salvar suas respostas." }`.

## Navegação

`src/app/_layout.tsx` passa a ter três grupos protegidos:

| Grupo          | Guarda                                           |
| -------------- | ------------------------------------------------ |
| `(auth)`       | sem login                                        |
| `(onboarding)` | com login e `user.onboardingCompleted === false` |
| `(app)`        | com login e `user.onboardingCompleted !== false` |

Quando a gravação termina, o `AuthContext` marca `onboardingCompleted: true` no usuário (em memória e na sessão guardada), e o Expo Router troca de grupo sozinho. Os providers de `(app)` (sino, chat da professora, push) só montam nessa hora; um toque de push pendente é tratado então.

A edição pelo Perfil é a rota `/preferences`, dentro de `(app)`, com o mesmo componente do fluxo.

## Layout de cada passo

```
┌─────────────────────────────────────┐
│ ←  ████████████░░░░░░░░░░░░░░░░░░░  │  FlowHeader: voltar (ou X) e barra verde
│                                     │
│ (foto)  ╭───────────────────────╮   │  TeacherAvatar 56 + balão branco,
│         │ Qual é o seu nível de │   │  borda gray-200, cantos 2xl
│         │ português?            │   │  (o de cima à esquerda menor)
│         ╰───────────────────────╯   │
│                                     │
│ Escolha a opção que faz mais        │  instrução, gray-500, text-sm
│ sentido pra você:                   │
│ ┌─────────────────────────────────┐ │
│ │ Iniciante                    ○  │ │  ChoiceCard: branco, borda gray-200,
│ │ Estou começando, sei poucas...  │ │  rounded-2xl; selecionado: borda
│ └─────────────────────────────────┘ │  green-600, fundo green-50 e o
│ ┌─────────────────────────────────┐ │  círculo verde com check
│ │ Básico                       ○  │ │
│ └─────────────────────────────────┘ │
│                ...                  │
├─────────────────────────────────────┤
│ [          Continuar           ]    │  FlowFooter (Button lg, verde)
└─────────────────────────────────────┘
```

- Fundo `bg-background`, como as outras telas. O conteúdo rola; o topo e o rodapé ficam fixos.
- O objetivo usa o mesmo `ChoiceCard`, com um ícone à esquerda (tabela abaixo).
- Os interesses são "chips" que quebram linha: `rounded-full`, borda `gray-200`, fundo branco; selecionado com borda `green-600`, fundo `green-50`, texto `green-700` e um ícone de check. Acima deles, o contador "2 de 3".
- Sem sombras: cartões e chips separados por borda.
- Barra de progresso: 1/3, 2/3 e 3/3 nos passos 1, 2 e 3.

## Textos

| Onde                        | Texto                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Balão, passo 1 (fluxo)      | "Olá, {primeiro nome}! Antes de começar, quero conhecer você. Qual é o seu nível de português?" (sem nome: "Olá! Antes de…") |
| Balão, passo 1 (edição)     | "Qual é o seu nível de português?"                                                                                           |
| Balão, passo 2              | "Por que você quer aprender português?"                                                                                      |
| Balão, passo 3              | "Sobre quais temas você mais gosta de conversar?"                                                                            |
| Instrução, passos 1 e 2     | "Escolha a opção que faz mais sentido pra você:"                                                                             |
| Instrução, passo 3          | "Escolha 3 temas:"                                                                                                           |
| Contador, passo 3           | "{n} de 3"                                                                                                                   |
| Botão, passos 1 e 2         | "Continuar"                                                                                                                  |
| Botão, passo 3              | "Começar" (fluxo) / "Salvar" (edição)                                                                                        |
| Toque no botão sem resposta | aviso "Escolha uma opção para continuar." / "Escolha 3 temas para continuar."                                                |
| 4º tema                     | aviso "Você já escolheu 3 temas. Desmarque um para trocar."                                                                  |
| Sair no passo 1 (fluxo)     | alerta "Sair da conta?" com "Cancelar" e "Sair"                                                                              |

Os títulos e descrições das opções vêm da rota. Ícones dos objetivos, por código (desconhecido usa `ellipse-outline`):

| Código         | Ícone (Ionicons)    |
| -------------- | ------------------- |
| `PROFESSIONAL` | `briefcase-outline` |
| `PERSONAL`     | `heart-outline`     |
| `TRAVEL`       | `airplane-outline`  |
| `ACADEMIC`     | `school-outline`    |

## Arquivos

- `src/services/preferences.ts`: tipos acima, `getPreferences(token)` e `savePreferences(token, input)`.
- `src/components/preferences/`:
  - `PreferencesFlow.tsx`: os três passos, com `mode: 'onboarding' | 'edit'`, a carga das opções, o estado das escolhas e a gravação.
  - `TeacherPrompt.tsx`: a foto e o balão com a pergunta.
  - `ChoiceCard.tsx`: cartão de opção única, com título, descrição e ícone opcional.
  - `InterestChip.tsx`: chip de tema.
- `src/app/(onboarding)/_layout.tsx` e `src/app/(onboarding)/index.tsx`: o fluxo.
- `src/app/(app)/preferences.tsx`: a edição (fase 02).
- `FlowHeader` (`src/components/lesson-flow/FlowHeader.tsx`) ganha o ícone de voltar como opção, além do "X".
