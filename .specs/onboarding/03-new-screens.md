# 03. Idioma nativo, nome, nível de A0 a C2 e boas-vindas

- **Status:** rascunho
- **Depende de:** [01](01-onboarding-flow.md), [02](02-edit-preferences.md) e a fase 02 do site (`portuguese-with-giselle/.specs/onboarding/02-language-name-level.md`) no ar

## Contexto

O dono do projeto pediu mais telas no fluxo: o idioma nativo, o nome, um nível mais detalhado (como na referência visual que mandou, com A0 a C2 em três grupos) e uma tela final de boas-vindas, com uma frase de incentivo. A tela de temas continua, depois do objetivo.

## Escopo

- Duas telas novas antes do nível: idioma nativo e nome.
- A tela de nível com os grupos e o selo do código.
- A tela final de boas-vindas, só no fluxo.
- A edição pelo Perfil com as telas novas, menos a de boas-vindas.
- O nome novo na sessão do app.

## Fora do escopo

- Mudar o idioma da interface pelo idioma nativo.
- Obrigar quem já respondeu a passar pelo fluxo de novo.
- Áudio nas perguntas.

## Ordem das telas

| #   | Tela          | Fluxo           | Edição pelo Perfil | Barra (fluxo / edição) |
| --- | ------------- | --------------- | ------------------ | ---------------------- |
| 1   | Idioma nativo | sim             | sim                | 1/6 / 1/5              |
| 2   | Nome          | sim             | sim                | 2/6 / 2/5              |
| 3   | Nível         | sim             | sim                | 3/6 / 3/5              |
| 4   | Objetivo      | sim             | sim                | 4/6 / 4/5              |
| 5   | Temas         | sim             | sim ("Salvar")     | 5/6 / 5/5              |
| 6   | Boas-vindas   | sim ("Começar") | não                | 6/6 / —                |

No fluxo, as respostas são gravadas no "Começar" da tela de boas-vindas; na edição, no "Salvar" dos temas. Um `PUT` só, como hoje.

## Telas

As telas de pergunta mantêm o layout da fase 01: barra de progresso, a professora com a pergunta num balão, a instrução e as opções em cartões, sem sombras.

**1. Idioma nativo**

- Balão: "Olá! Antes de começar, quero conhecer você. Qual é a sua língua nativa?" (edição: "Qual é a sua língua nativa?").
- Instrução: "Escolha a opção que faz mais sentido pra você:".
- `ChoiceCard` com o emoji da bandeira à esquerda e o título da rota ("Español", "English", "Outro idioma").
- No fluxo, o "X" pergunta "Sair da conta?", como o primeiro passo de hoje.

**2. Nome**

- Balão: "Como você quer que eu te chame?".
- Campo de texto, já com o nome da conta; borda `gray-200`, `green-600` com o foco; teclado com maiúscula em cada palavra e o botão "próximo" do teclado avançando.
- Abaixo, em `gray-500`: "É assim que a professora vai te chamar nas aulas e no app."
- "Continuar" desligado com o campo vazio (aviso: "Digite seu nome para continuar."). Limite de 80 caracteres no campo.
- O rodapé sobe com o teclado.

**3. Nível**

- Balão: "Prazer, {primeiro nome}! Como você descreveria seu português hoje?" (edição: "Como você descreveria seu português hoje?").
- Instrução: "Não existe resposta errada: as aulas se adaptam ao seu ritmo.".
- As opções vêm agrupadas pelo `group` da rota, na ordem em que chegam. Cada grupo tem um título em maiúsculas, `gray-500`, `text-xs`.
- Cada cartão tem, à esquerda, um selo quadrado de cantos arredondados com o código (`A0`), em `green-700` sobre `green-50`, e a descrição ao lado. Selecionado: borda `green-600`, fundo `green-50`, selo `green-600` com texto branco e o círculo com check.

```
│ INICIANTE                           │
│ ┌─────────────────────────────────┐ │
│ │ [A0]  Estou começando do zero ○ │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [A1]  Entendo e uso frases    ○ │ │
│ │       simples do dia a dia      │ │
│ └─────────────────────────────────┘ │
│ ...                                 │
│ INTERMEDIÁRIO                       │
```

**4. Objetivo** e **5. Temas:** como hoje.

**6. Boas-vindas** (só no fluxo)

- Sem balão: a foto da professora maior (96), centralizada no meio da tela.
- Título: "Boas-vindas, {primeiro nome}!" (`font-poppins-semibold`, `text-2xl`).
- Frase: "Ninguém fica fluente de um dia para o outro. Um passo de cada vez, todos os dias, é o que vai fazer você falar português com confiança."
- Assinatura em `gray-500`: "Professora Giselle".
- Botão "Começar"; erro na gravação aparece acima dele, com as escolhas mantidas. A seta do topo volta para os temas.

## Contrato

O da fase 02 do site:

- `PreferenceOption` ganha `group: string | null`.
- `Preferences` ganha `nativeLanguage: 'SPANISH' | 'ENGLISH' | 'OTHER' | null`, e `level` passa a ser `'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'`.
- `options` ganha `nativeLanguages`.
- `PUT` com `{ nativeLanguage, name, level, goal, interests }`; a resposta traz `{ preferences, name }`.

## Requisitos

- **RF-01:** o fluxo segue a [ordem das telas](#ordem-das-telas), com a barra de progresso e os botões da tabela.
- **RF-02:** a tela de idioma mostra as opções de `options.nativeLanguages` com o emoji; a de nível agrupa por `group`, com o selo do código.
- **RF-03:** a tela de nome vem preenchida com o nome da conta e só avança com algum texto; o nome vai no `PUT` sem espaços nas pontas.
- **RF-04:** a tela de boas-vindas usa o nome digitado; "Começar" grava e leva às abas.
- **RF-05:** depois de gravar (fluxo ou edição), a sessão do app passa a ter o nome devolvido pela rota, em memória e na sessão guardada.
- **RF-06:** na edição, quem respondeu antes desta fase vê a tela de idioma sem nada marcado e precisa escolher para avançar.
- **RF-07:** voltar (seta do topo ou do Android) mantém todas as escolhas, inclusive o nome digitado.

## Critérios de aceite

- [ ] Conta nova: as 6 telas na ordem, com a barra andando; "Começar" leva às abas.
- [ ] Depois do fluxo, o Perfil e as saudações mostram o nome digitado.
- [ ] A tela de nível mostra os três grupos e os 7 níveis com o selo.
- [ ] Nome apagado: "Continuar" mostra o aviso e não avança.
- [ ] Voltar da tela de boas-vindas até a primeira mantém as escolhas.
- [ ] Pelo Perfil: 5 telas, já preenchidas; "Salvar" volta ao Perfil.
- [ ] Sem rede, "Começar" mostra o erro e mantém as escolhas.
- [ ] `yarn lint` sem avisos novos e `yarn tsc --noEmit` passam.

## Desenho técnico

Criar:

- `src/components/preferences/LevelCard.tsx`: o cartão com o selo.
- `src/components/preferences/NameStep.tsx`: o campo do nome.
- `src/components/preferences/WelcomeStep.tsx`: a tela de boas-vindas.

Alterar:

- `src/services/preferences.ts`: os tipos do [contrato](#contrato) e o retorno do `savePreferences`.
- `src/components/preferences/PreferencesFlow.tsx`: os passos novos, a lista de passos por modo (no lugar do número fixo), o estado do idioma e do nome e o `KeyboardAvoidingView`.
- `src/components/preferences/ChoiceCard.tsx`: o emoji à esquerda, como opção.
- `src/utils/preferences.ts`: os passos por modo e os textos novos.
- `src/contexts/AuthContext.tsx`: `completeOnboarding` recebe o nome, e um `updateUser` grava o nome depois da edição.
- `src/app/(onboarding)/index.tsx` e `src/app/(app)/preferences.tsx`: passar o nome devolvido.
- `.specs/onboarding/architecture.md`: o contrato, o layout e os textos novos.

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`.
2. Não exige build novo: nenhuma dependência nativa entra.
3. No aparelho, com o site da fase 02 no ar: os critérios acima, pelo dono do projeto.

## Tarefas

- [ ] Tipos e serviço.
- [ ] Telas de idioma e nome.
- [ ] Tela de nível com grupos.
- [ ] Tela de boas-vindas.
- [ ] Edição pelo Perfil com as telas novas.
- [ ] Nome na sessão.
- [ ] `architecture.md`.
