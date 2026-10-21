# 04. Lista com fotos, tela de detalhes e personagem com rosto e voz

- **Status:** em andamento
- **Depende de:** [01](01-simulations-list.md), [02](02-simulation-screen.md), [03](03-goal-reminders.md) e a fase 04 do site (`.specs/simulations/04-scenario-media.md` de lá)

## Contexto

A lista de simulações é uma coluna de cartões com emoji, e a apresentação do cenário é um emoji grande com as tarefas. O dono do projeto quer uma tela mais bonita, a partir de uma print de outro app de idioma: uma grade de cartões com foto, um filtro por categoria e uma tela de detalhes antes de começar, com os objetivos, um aviso de que haverá um feedback no fim e as regras da simulação. A personagem ganha rosto (o avatar do Dato) e voz própria (o ID da voz do Dato).

Os rascunhos foram aprovados na conversa. Na lista, o dono do projeto escolheu o cartão com o título sobre a foto, e não o cartão com a foto em cima e o texto embaixo.

## Escopo

- A lista em grade, com o filtro por categoria.
- A tela de detalhes no lugar da apresentação (`SimulationIntro`), com a folha das regras.
- O avatar da personagem no chat e no resumo, no lugar do emoji.
- A voz da personagem com o `voiceId` do cenário.

## Fora do escopo

- Mostrar a dificuldade. Ela vem na rota, mas o dono do projeto ainda vai decidir como mostrá-la; por enquanto, nenhuma tela a usa.
- Filtrar os cenários pelo nível do aluno: todos veem todos.
- Aviso de Premium no topo da lista (a print tem; o dono do projeto não quer).
- Mudanças na conversa, nos avisos de desvio e no resumo além da troca do emoji pelo avatar.

## Requisitos

### Lista

- **RF-01:** o topo da lista tem o título "Simulações", a frase "Converse em situações do dia a dia e cumpra os objetivos." e a pílula verde "Restam N de M hoje" (`getRemainingTodayLabel`).
- **RF-02:** abaixo, uma faixa de filtros que rola de lado: "Todas" primeiro e depois uma pílula por categoria que aparece na lista, na ordem em que a categoria aparece pela primeira vez. A pílula escolhida é verde-600 com texto branco; as outras, brancas com borda cinza. Com menos de duas categorias, a faixa não aparece.
- **RF-03:** o filtro escolhido vale só enquanto a tela está aberta. Se a categoria escolhida sumir ao recarregar, o filtro volta para "Todas".
- **RF-04:** os cenários ficam em grade de duas colunas, com cartões de cantos grandes (`rounded-3xl`) e altura fixa (≈ 210). A foto (`thumbnailUrl`) cobre o cartão inteiro, com um degradê escuro de baixo para cima. Embaixo, sobre o degradê, ficam o título em branco e negrito (até 2 linhas) e a pílula da categoria (fundo branco quase opaco, texto escuro).
- **RF-05:** no alto do cartão, à direita: a pílula "Feita" (fundo branco, ✓ verde) quando o aluno já completou o cenário, ou a etiqueta Premium quando ele está trancado. O trancado mostra só a etiqueta Premium.
- **RF-06:** o toque num cenário liberado abre a tela de detalhes. O toque num trancado leva para `/plans`, como hoje.
- **RF-07:** enquanto a foto carrega, ou se ela falhar, o cartão mostra um fundo cinza-escuro (`bg-gray-700`), com o título e a categoria legíveis por cima. O topo da tela de detalhes faz o mesmo, o que também deixa legível a barra de status clara.

### Tela de detalhes

- **RF-08:** a tela de detalhes substitui a apresentação de hoje, na mesma rota (`/practice/simulations/[id]`), e continua sendo a fase `intro` da tela da simulação. Os textos de limite, erro e "Preparando..." continuam como estão.
- **RF-09:** no topo, a thumb em largura total (≈ 230 de altura), sem o cabeçalho comum da tela. Sobre a foto, à esquerda, o botão de voltar e, à direita, o botão "i" (`information-circle-outline`), os dois em círculos brancos quase opacos.
- **RF-10:** o avatar da personagem (72, redondo, com borda da cor do fundo) fica sobre a borda de baixo da foto, à esquerda. Sem avatar, o círculo fica verde-claro com um ícone de pessoa.
- **RF-11:** abaixo do avatar ficam:
  - a pílula da categoria;
  - o título;
  - a descrição;
  - a linha "Você vai conversar com: {aiRole}".
- **RF-12:** o cartão "Seus objetivos" lista as tarefas numeradas (o número num círculo verde-claro), com a quantidade no canto.
- **RF-13:** o cartão "Feedback no final", em azul-claro e com ícone, diz: "Ao terminar, você recebe um comentário sobre o seu desempenho, os objetivos cumpridos e as frases corrigidas."
- **RF-14:** a linha "Como funciona a simulação" (fundo `bg-surface`, ícone de informação e seta) abre a folha das regras, a mesma do botão "i".
- **RF-15:** o botão "Começar simulação" fica preso embaixo, como o "Começar" de hoje.

### Regras

- **RF-16:** a folha das regras sobe de baixo, como a das conquistas (`AchievementSheet`). Ela tem o título "Como funciona", o botão de fechar e quatro regras, cada uma com um ícone num quadrado colorido:
  - **Cumpra os objetivos:** "Converse em português até cumprir todos. Eles vão sendo marcados na tela."
  - **Fique na cena:** "Não mude de assunto, não escreva em outro idioma e não vá contra um objetivo."
  - **{maxDeviations} avisos encerram:** "A cada desvio você recebe um aviso. No {maxDeviations}º, a simulação é encerrada."
  - **Até {maxMessages} mensagens:** "Cada simulação começada conta no limite do dia, mesmo se você sair no meio."
- **RF-17:** os números vêm da lista (`maxMessages` e `maxDeviations`), não de constantes do app.
- **RF-18:** a folha fecha pelo "Entendi", pelo botão de fechar, pelo toque fora dela e pelo botão de voltar do Android.

### Personagem

- **RF-19:** no chat e no resumo, `SimulationAvatar` mostra o `avatarUrl` redondo, com o mesmo círculo do RF-10 quando não há avatar.
- **RF-20:** as falas da personagem pedem a voz com o `voiceId` que veio no começo. As frases corrigidas do aluno continuam sem `voiceId`, na voz da Gisa.

### Acessibilidade

- **RF-21:** cada cartão é um botão com o título, a categoria e "feita" ou "exclusivo do plano Premium" no rótulo, como hoje. As pílulas do filtro têm `accessibilityState.selected`. A foto e o avatar não são lidos.

## Desenho técnico

- **Contrato** (`src/services/simulations.ts`): `Simulation` troca `emoji` e `level` por `aiRole`, `thumbnailUrl`, `avatarUrl`, `category` (`{ id, title, color }`) e `difficulty`. `SimulationList` ganha `maxMessages` e `maxDeviations`, e `SimulationStart` ganha `voiceId`. `SimulationLevel` e `SIMULATION_LEVEL_TITLES` (`src/utils/simulations.ts`) saem.
- **Degradê do cartão:** `experimental_backgroundImage` com `linear-gradient` numa View por cima da foto. O React Native 0.86 já tem isso, então não é preciso `expo-linear-gradient` nem build novo. Se o NativeWind não passar a prop, ela vai em `style`.
- **Imagens:** `Image` do React Native, com `resizeMode="cover"`. Nenhuma biblioteca nova.
- **Componentes:**
  - `SimulationCard` reescrito;
  - `SimulationFilters`, novo, para as pílulas;
  - `SimulationIntro` reescrito como a tela de detalhes;
  - `SimulationRulesSheet`, novo;
  - `SimulationAvatar` com `avatarUrl` no lugar de `emoji`;
  - `SimulationSummary` passa o avatar.
- **Tela da lista** (`src/app/(app)/practice/simulations/index.tsx`): o estado do filtro e a grade (`flex-row flex-wrap`, cada cartão com `w-1/2 p-1.5`, como a grade de conquistas).
- **Tela da simulação** (`[id].tsx`): na fase `intro`, sem `LessonHeader`, com a tela de detalhes ocupando até o topo. A barra de status fica clara sobre a foto (`StatusBar style="light"` só nessa fase).
- **Voz:** `getPracticeSpeech(token, text, signature, voiceId?)`. `useGisaVoice` aceita `voiceId` opcional em `toggle` e `autoplay`. O cache por assinatura continua certo, porque a assinatura já muda com a voz. `useSimulation` guarda o `voiceId` do começo.

## Critérios de aceite

- [ ] A lista mostra a grade com fotos, e o filtro por categoria mostra só os cenários dela.
- [ ] "Feita" e Premium aparecem no alto dos cartões certos, e o trancado leva aos planos.
- [ ] A tela de detalhes mostra a foto, o avatar, a categoria, o título, a descrição, a personagem, os objetivos, o cartão do feedback e o link das regras.
- [ ] O "i" e o link abrem a folha das regras, com 12 e 3 vindos da rota.
- [ ] No chat, a personagem aparece com o avatar e fala com a voz do cenário. A frase corrigida fala com a voz da Gisa.
- [ ] Cenário sem avatar mostra o círculo com o ícone de pessoa.
- [ ] Nada da tela mostra a dificuldade.

## Verificação

- `yarn lint`, `yarn tsc --noEmit` e Prettier.
- No aparelho ou emulador, com o site da fase 04 publicado:
  - a lista com e sem filtro;
  - um cenário trancado com a conta gratuita;
  - a tela de detalhes e a folha das regras;
  - uma simulação com voz própria e uma sem avatar.

## Tarefas

- [x] Contrato e tipos.
- [x] Cartão, filtro e grade da lista.
- [x] Tela de detalhes e folha das regras.
- [x] Avatar no chat e no resumo.
- [x] Voz com o `voiceId`.
- [ ] Teste no aparelho.
