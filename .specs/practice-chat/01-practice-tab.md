# 01. Aba Praticar

- **Status:** concluída
- **Fechamento:** O dono do projeto considerou esta fase feita em 15/10/2026, sem o teste no aparelho; os critérios de aceite ficam marcados.
- **Depende de:** nada

## Contexto

As abas do app são Dashboard, Aprender, Cursos, Progresso e Perfil (`src/app/(app)/(tabs)/_layout.tsx`). A aba Aprender já leva às aulas, então a aba Cursos cede o lugar à aba Praticar e a lista de cursos passa a abrir pelo Perfil. Ao fim desta fase a navegação está pronta; o chat em si vem na fase 02.

## Escopo

- Aba Praticar no lugar da aba Cursos.
- Lista de cursos como tela fora das abas, aberta pelo Perfil.
- Tela da aba Praticar com a opção "Chat com IA", trancada para o aluno gratuito.

## Fora do escopo

- A tela do chat (fase 02).
- Redesenho do Perfil além do link novo.
- Qualquer mudança na lista de cursos além do cabeçalho de voltar.

## Requisitos

- **RF-01:** As abas passam a ser, nesta ordem: Dashboard, Aprender, Praticar, Progresso e Perfil. A aba Praticar usa os ícones `chatbubbles` (ativa) e `chatbubbles-outline`.
- **RF-02:** Não existe mais aba Cursos.
- **RF-03:** O Perfil ganha uma linha "Meus cursos", com ícone de livro e seta à direita, acima do botão "Sair". Tocar nela abre a lista de cursos.
- **RF-04:** A lista de cursos é a mesma tela de hoje (título, subtítulo, cartões, estados de erro, vazio e carregamento), agora com um cabeçalho com botão de voltar. Tocar num curso continua abrindo `/course/[courseSlug]`.
- **RF-05:** A aba Praticar mostra o título "Praticar", o subtítulo "Treine seu português conversando." e um cartão "Chat com IA" com a descrição "Converse com a Professora Gisa e receba correções a cada frase."
- **RF-06:** Para o assinante, tocar no cartão abre `/practice/chat`.
- **RF-07:** Para o aluno gratuito, o cartão aparece com cadeado e o texto "Exclusivo para assinantes", e não responde ao toque.
- **RF-08:** Nesta fase, `/practice/chat` é uma tela provisória, com o cabeçalho de voltar e `ComingSoon` (`src/components/ComingSoon.tsx`). A fase 02 a substitui.

## Critérios de aceite

- [x] A barra inferior mostra Dashboard, Aprender, Praticar, Progresso e Perfil.
- [x] Perfil > "Meus cursos" abre a lista de cursos; o voltar retorna ao Perfil.
- [x] Na lista, tocar num curso abre a tela do curso, e o voltar retorna à lista.
- [x] Com conta assinante, o cartão "Chat com IA" abre a tela provisória.
- [x] Com conta gratuita, o cartão aparece trancado e não abre nada.
- [x] As abas Dashboard, Aprender e Progresso seguem iguais.

## Desenho técnico

**Criar**

- `src/app/(app)/(tabs)/practice.tsx`: a aba, no formato das outras (`SafeAreaView` com `edges={['top']}`, título e subtítulo como em `courses.tsx`).
- `src/utils/practice.ts`: `canUsePractice(user)`, como em `architecture.md`.
- `src/app/(app)/practice/chat.tsx`: a tela provisória.

**Mover**

- `src/app/(app)/(tabs)/courses.tsx` para `src/app/(app)/courses.tsx`, acrescentando `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`) com o título "Cursos" e tirando o título grande duplicado. Fora das abas, a `SafeAreaView` passa a cuidar também da borda inferior.

**Alterar**

- `src/app/(app)/(tabs)/_layout.tsx`: troca `Tabs.Screen name="courses"` por `name="practice"`.
- `src/app/(app)/(tabs)/profile.tsx`: a linha "Meus cursos".
- `CLAUDE.md`: a lista de abas e a nova posição da lista de cursos.

**Notas**

- Nenhuma tela navega para a aba Cursos hoje (conferido com busca por `/courses` em `src/`), então mover o arquivo não quebra links. Confira de novo ao implementar.
- A rota `/courses` continua existindo, agora na pilha.

**Divergências na implementação**

- A tela provisória do RF-08 não chegou a existir: esta fase e a 02 foram implementadas juntas, e `/practice/chat` já nasceu como o chat.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho: percorrer os critérios de aceite com uma conta assinante e uma gratuita.

## Tarefas

- [x] `src/utils/practice.ts` com `canUsePractice`.
- [x] Mover a lista de cursos e acrescentar o cabeçalho.
- [x] Trocar a aba no layout.
- [x] Linha "Meus cursos" no Perfil.
- [x] Aba Praticar com o cartão e o estado trancado.
- [x] Tela do chat em `/practice/chat` (direto a da fase 02, sem a provisória).
- [x] Atualizar o `CLAUDE.md`.
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
