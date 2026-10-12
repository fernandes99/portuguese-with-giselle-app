# 01. Lista de flashcards

- **Status:** concluída
- **Depende de:** rota `GET /api/mobile/flashcards` no ar (fase `01-flashcards-api` do site)

## Contexto

A aba Praticar tem só o cartão "Chat com IA". Esta fase acrescenta o cartão "Flashcards" e a tela que lista os conjuntos. A sessão de estudo vem na fase 02.

## Escopo

- Cartão "Flashcards" na aba Praticar.
- Tela com a lista de conjuntos e o progresso do aluno em cada um.

## Fora do escopo

- A sessão de estudo (fase 02).
- Busca, filtro ou ordenação dos conjuntos.

## Requisitos

- **RF-01:** A aba Praticar mostra dois cartões, nesta ordem: "Chat com IA" e "Flashcards". O de flashcards tem o ícone `albums` e a descrição "Memorize palavras e frases virando os cards."
- **RF-02:** O cartão "Flashcards" nunca aparece trancado: abre `/practice/flashcards` para qualquer conta.
- **RF-03:** O subtítulo da aba passa de "Treine seu português conversando." para "Escolha como treinar seu português.", porque a aba deixou de ser só conversa.
- **RF-04:** A tela de lista tem o cabeçalho de voltar com o título "Flashcards" e o texto "Escolha um tema e memorize o vocabulário."
- **RF-05:** Cada conjunto aparece num cartão com o título, a descrição (até duas linhas, quando existe) e a quantidade de cards ("1 card", "12 cards"), na ordem em que o backend devolve.
- **RF-06:** Conjunto em que o aluno já respondeu algum card mostra, no lugar da quantidade, a barra de progresso e "X de N cards aprendidos". A barra é a parte aprendida do total.
- **RF-07:** Conjunto com todos os cards aprendidos mostra um check verde no lugar da seta.
- **RF-08:** Tocar num conjunto abre `/practice/flashcards/[slug]`.
- **RF-09:** A lista recarrega sempre que a tela volta ao foco e ao puxar para baixo.
- **RF-10:** Sem conjuntos: "Nenhum flashcard disponível" e "Os flashcards serão adicionados em breve", os textos do site. Em erro: a mensagem e "Tentar de novo". Carregando: o indicador verde.

## Critérios de aceite

- [ ] A aba Praticar mostra "Chat com IA" e "Flashcards".
- [ ] Com conta gratuita, "Flashcards" abre normalmente (e "Chat com IA" segue trancado).
- [ ] A lista traz os mesmos conjuntos da página de flashcards do site, na mesma ordem.
- [ ] Um conjunto nunca estudado mostra só a quantidade de cards.
- [ ] Depois de responder cards na sessão e voltar, o conjunto mostra a barra e a contagem atualizadas.
- [ ] Em modo avião, a tela mostra o erro e "Tentar de novo" funciona ao voltar a conexão.

## Desenho técnico

**Criar**

- `src/services/flashcards.ts`: tipos do contrato (`architecture.md`), `getFlashcards`, `getFlashcard` e `saveCardProgress`, no formato de `src/services/courses.ts`.
- `src/utils/flashcards.ts`: `formatCards` e `getFlashcardProgress`.
- `src/components/flashcards/FlashcardItem.tsx`: o cartão do conjunto.
- `src/app/(app)/practice/flashcards/index.tsx`: a tela, no formato de `src/app/(app)/courses.tsx`, com `useApiQuery`.

**Alterar**

- `src/app/(app)/(tabs)/practice.tsx`: o cartão vira um componente local (`PracticeOption`), usado pelas duas opções.
- `src/constants/config.ts`: `flashcards`, `flashcard` e `flashcardCardProgress` em `API_ROUTES`.
- `CLAUDE.md` e `.specs/README.md`: a iniciativa nova.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

O app usa rotas tipadas: depois de criar as telas, o `tsc` só reconhece `/practice/flashcards` com os tipos regenerados, o que acontece ao (re)iniciar o `yarn start`.

No aparelho: percorrer os critérios de aceite com uma conta assinante e uma gratuita.

## Tarefas

- [x] Rotas em `API_ROUTES` e `src/services/flashcards.ts`.
- [x] `formatCards` e `getFlashcardProgress`.
- [x] `FlashcardItem` e a tela de lista.
- [x] Cartão "Flashcards" na aba Praticar.
- [x] Atualizar o `CLAUDE.md` e o `.specs/README.md`.
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
