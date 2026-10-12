# 02. Tela de histórico

- **Status:** concluída
- **Depende de:** rota `GET /api/mobile/history` no ar (fase `02-history` do site)

## Contexto

O Perfil tem hoje a linha "Meus cursos" e o botão de sair. Esta fase acrescenta a linha "Histórico" e a tela que ela abre, com a mesma lista que a professora vê na ficha do aluno no site. O contrato e os rótulos estão em `architecture.md`.

## Escopo

- Linha "Histórico" no Perfil.
- Tela com filtro por tipo, lista e "Carregar mais".

## Fora do escopo

- Abrir o item ao tocar.
- Busca por texto e filtro por data ou situação.
- Os totais que a ficha da professora mostra acima da lista.

## Requisitos

- **RF-01:** O Perfil mostra a linha "Histórico", com ícone de relógio e seta, abaixo de "Meus cursos". Tocar abre `/history`.
- **RF-02:** A tela tem o cabeçalho de voltar com o título "Histórico", o subtítulo "Histórico de aprendizado" e o texto "Situação atual de cada item e a data da última mudança.", os mesmos da tela da professora.
- **RF-03:** Abaixo do texto há os filtros "Tudo", "Curso", "Módulo", "Aula", "Atividade" e "Flashcard", numa linha que rola para os lados. O selecionado fica verde com texto branco; os outros, cinza. "Tudo" começa selecionado.
- **RF-04:** Trocar o filtro recarrega a lista do começo, só com itens daquele tipo.
- **RF-05:** Cada item mostra: um ícone do tipo num quadrado com a cor da situação; o tipo em letras pequenas e maiúsculas; o título em uma linha; o contexto (curso ou conjunto), quando existe; e, à direita, a situação e a data com hora (`12/10/2026 16:33`).
- **RF-06:** As situações são "Iniciou" (cinza), "Em andamento" (azul) e "Concluiu" (verde).
- **RF-07:** A lista vem da mudança mais recente para a mais antiga, 20 itens por vez.
- **RF-08:** No fim da lista aparece "X de N registros" e, enquanto houver mais, o botão "Carregar mais", que acrescenta a página seguinte sem repetir item.
- **RF-09:** Sem itens: "Nenhum registro de estudo."
- **RF-10:** Enquanto a primeira página carrega, a tela mostra o indicador verde. Em erro, a mensagem e "Tentar de novo".
- **RF-11:** A resposta de um filtro que o aluno já trocou é descartada.
- **RF-12:** Para o leitor de tela, cada item lê o tipo, o título, a situação e a data.

## Critérios de aceite

- [ ] Perfil > "Histórico" abre a tela; o voltar retorna ao Perfil.
- [ ] A lista mostra os mesmos itens, na mesma ordem, da ficha do mesmo aluno na área da professora.
- [ ] Depois de concluir uma aula, ela aparece no topo como "Concluiu", e o módulo e o curso dela aparecem com a situação certa.
- [ ] O filtro "Flashcard" mostra os cards com o texto do card e o nome do conjunto.
- [ ] Trocar de filtro rápido, várias vezes, termina mostrando a lista do último filtro.
- [ ] Com mais de 20 registros, "Carregar mais" traz os seguintes e some no fim.
- [ ] Um filtro sem itens mostra "Nenhum registro de estudo."
- [ ] Em modo avião, a tela mostra o erro e "Tentar de novo" funciona ao voltar a conexão.

## Desenho técnico

**Criar**

- `src/services/history.ts`: tipos do contrato e `getHistory(token, type, page)`.
- `src/hooks/useHistory.ts`: estado das páginas, com descarte da resposta atrasada (RF-11).
- `src/app/(app)/history.tsx`: a tela, com `FlatList`.

**Alterar**

- `src/constants/config.ts`: `history: '/api/mobile/history'` em `API_ROUTES`.
- `src/utils/date.ts`: `formatDateTime(iso)`.
- `src/app/(app)/(tabs)/profile.tsx`: a linha "Histórico".
- `CLAUDE.md` e `.specs/README.md`: a iniciativa e a tela.

**Notas**

- A tela não usa `useApiQuery`, porque ele não pagina nem recarrega com parâmetro; o hook próprio segue o formato de `src/hooks/useLesson.ts`.
- A data é um instante em ISO e é mostrada no fuso do aparelho.
- Um registro novo, criado entre uma página e outra, empurra a lista: o hook descarta o item que já estava carregado.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar: percorrer os critérios de aceite, comparando com a ficha da mesma conta na área da professora.

## Tarefas

- [x] `API_ROUTES.history` e `src/services/history.ts`.
- [x] `formatDateTime`.
- [x] `useHistory`.
- [x] Tela de histórico, com filtros e "Carregar mais".
- [x] Linha "Histórico" no Perfil.
- [x] Atualizar o `CLAUDE.md` e o `.specs/README.md`.
- [x] Conferir no aparelho.
- [x] Marcar esta spec e a tabela da iniciativa como `concluída`.
