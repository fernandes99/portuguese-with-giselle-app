# Arquitetura

O que as duas fases compartilham.

## Navegação

```
(tabs)/practice              Praticar             ganha a opção "Flashcards"
practice/flashcards          lista de conjuntos   novo
practice/flashcards/[slug]   sessão de estudo     novo
```

As duas telas novas são da pilha de `src/app/(app)/_layout.tsx`, abertas por cima das abas, com o cabeçalho de voltar (`LessonHeader`).

## Contrato das rotas

Espelho do contrato em `.specs/practice-flashcards/README.md` do site; ao mudar um, mude o outro. Todas com o token da sessão. Erros como `{ "error": string }`; o `401` encerra o login pelo `api`.

`GET /api/mobile/flashcards`

```json
{
  "flashcards": [
    {
      "id": "123",
      "slug": "verbos-do-dia-a-dia",
      "title": "Verbos do dia a dia",
      "description": "Os verbos mais usados.",
      "totalCards": 20,
      "learnedCards": 5,
      "learningCards": 3
    }
  ]
}
```

`GET /api/mobile/flashcards/[slug]`: os mesmos campos, mais:

```json
{
  "isShowFront": true,
  "cards": [
    {
      "id": "456",
      "front": { "text": "falar", "imageUrl": null },
      "back": { "text": "to speak", "imageUrl": null },
      "status": "new"
    }
  ]
}
```

- `status`: `new` (sem resposta), `learning` ("ainda aprendendo") ou `learned` ("aprendi").
- `isShowFront`: o lado que aparece primeiro.
- Lado com `imageUrl` mostra a imagem no lugar do texto. O app acrescenta `?w=800&auto=compress` à URL, como na capa dos cursos.
- `404` quando o conjunto não existe.

`POST /api/mobile/flashcards/[slug]/cards/[cardId]/progress`, com `{ "learned": boolean }`. Responde `{ "status": "learned" | "learning" }`; `404` se o card não é do conjunto.

## Estado da sessão

Fica em memória, no hook `useFlashcardSession` (`src/hooks/useFlashcardSession.ts`), criado com o conjunto já carregado.

- `statuses`: a situação de cada card, começando pela que veio do backend e atualizada a cada resposta.
- `round`: a lista de cards da rodada e o número dela. A primeira rodada traz os cards com situação diferente de `learned`.
- `position`: quantos cards da rodada já foram respondidos. A rodada termina quando chega ao tamanho da lista.
- `answer(index, learned)`: atualiza a situação, avança a posição e dispara o registro no backend, sem esperar a resposta. Uma segunda chamada para a mesma posição é ignorada.
- `studyRemaining()` e `studyAll()`: começam outra rodada, com os cards ainda não aprendidos ou com todos.
- `hasSaveError`: algum registro falhou. A tela mostra um aviso e segue.

O conjunto é carregado uma vez por abertura da tela (`useFlashcard`, em `src/hooks/useFlashcard.ts`). A lista recarrega ao voltar ao foco (`useApiQuery`), e é assim que o progresso da sessão aparece nela.

## A pilha de cards

A tela monta no máximo dois `StudyCard` (`src/components/flashcards/StudyCard.tsx`): o da vez e o seguinte, embaixo dele, um pouco menor.

- Cada card é dono das próprias animações (`react-native-reanimated`): posição horizontal, giro e profundidade. Os gestos (`react-native-gesture-handler`) rodam fora da thread do JavaScript.
- A chave de cada card junta o número da rodada e o id do card. Quando o de cima sai, o de baixo continua montado e só passa a ser o de cima; nada é remontado na troca.
- O card de cima expõe `answer(learned)` por `ref`, para os botões provocarem a mesma saída animada do arrasto.
- Com "reduzir movimento" ligado (`useReducedMotion`), as animações têm duração zero.

## Arquivos

| Arquivo                                        | Papel                                           | Fase |
| ---------------------------------------------- | ----------------------------------------------- | ---- |
| `src/services/flashcards.ts`                   | Chamadas às três rotas e tipos do contrato      | 01   |
| `src/utils/flashcards.ts`                      | Contagens, progresso, textos e tamanho da letra | 01   |
| `src/app/(app)/practice/flashcards/index.tsx`  | Lista de conjuntos                              | 01   |
| `src/components/flashcards/FlashcardItem.tsx`  | Um conjunto na lista                            | 01   |
| `src/app/(app)/practice/flashcards/[slug].tsx` | Tela da sessão: carrega o conjunto              | 02   |
| `src/hooks/useFlashcard.ts`                    | Carga do conjunto                               | 02   |
| `src/hooks/useFlashcardSession.ts`             | Estado da sessão                                | 02   |
| `src/components/flashcards/StudySession.tsx`   | Contadores, pilha de cards e botões             | 02   |
| `src/components/flashcards/StudyCard.tsx`      | O card: virar, arrastar e sair                  | 02   |
| `src/components/flashcards/StudySummary.tsx`   | Resumo do fim da rodada                         | 02   |

## Reaproveitado sem alterar

- `api`, `ApiError` e `getErrorMessage` (`src/lib/api.ts`); `useApiQuery` (`src/hooks/useApiQuery.ts`); `useAuth`.
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), `EmptyState` (`src/components/lesson/EmptyState.tsx`), `ProgressBar`, `Button` e `colors`.

## Padrões visuais

- Textos em português, com os termos do site: "Flashcards", "card", "Aprendendo", "Aprendi".
- Fonte Poppins, cores do tema; laranja (`orange-500`) para "ainda aprendendo" e verde para "aprendi", como no site.
- Cartões separados por borda ou cor de fundo, sem sombra pequena.
