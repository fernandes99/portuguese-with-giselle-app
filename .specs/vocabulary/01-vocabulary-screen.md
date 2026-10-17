# 01. Tela de vocabulário

- **Status:** em andamento
- **Depende de:** fase 03 do site (`.specs/vocabulary/03-vocabulary-api.md` em `portuguese-with-giselle`), publicada

## Contexto

O backend já entrega a lista do aluno e as rotas de salvar. Esta fase cria a entrada na aba Praticar, a lista com busca e filtros e o detalhe de cada item, com os áudios e o botão de salvar.

## Escopo

- Cartão "Vocabulário" na aba Praticar.
- Tela `/practice/vocabulary` com a lista e o modal de detalhe.
- Serviço, rotas em `API_ROUTES` e hook.

## Fora do escopo

- Tudo o que está no "Fora do escopo" do README.

## Requisitos

- **RF-01:** a aba Praticar tem o cartão "Vocabulário", com o texto "Gírias e expressões do dia a dia, com áudio.", depois de "Flashcards". O toque abre `/practice/vocabulary` para todos os alunos.
- **RF-02:** a tela tem o título "Vocabulário", um campo de busca ("Buscar palavra, significado ou exemplo") com o botão dos salvos (ícone de marcador) ao lado, e embaixo uma linha de filtros que rola para o lado: "Todas" e uma categoria por botão, na ordem da rota. Uma categoria fica ativa por vez. O botão dos salvos liga e desliga a lista só com os salvos (fica verde e com o marcador cheio quando ligado). A busca, a categoria e os salvos valem juntos.
- **RF-03:** a busca filtra enquanto o aluno digita, pela palavra, pelo significado e pelo exemplo, sem diferenciar maiúsculas e acentos.
- **RF-04:** cada item da lista mostra a primeira categoria em letra pequena e maiúscula, na cor dela; a palavra; o significado em até duas linhas; e, à direita, o ícone de salvo (marcador cheio ou vazio), que salva e tira dos salvos com um toque.
- **RF-05:** o item exclusivo aparece esmaecido, com o `PremiumBadge` no lugar do ícone de salvo. O toque nele abre `/plans`.
- **RF-06:** o toque num item liberado abre o detalhe em tela cheia, com o botão de fechar no topo, a palavra, a pronúncia (quando houver), o botão de ouvir a palavra, o significado, o exemplo com o botão de ouvir e a tradução embaixo, e um botão largo "Salvar" (ou "Salvo") no pé.
- **RF-07:** só um áudio toca por vez, e fechar o detalhe para o áudio. O botão de um áudio que não existe não aparece.
- **RF-08:** salvar e tirar mudam o ícone na hora, na lista e no detalhe. Se a rota falhar, o ícone volta e aparece a mensagem de erro. Com os salvos ligados, tirar um item o remove da lista.
- **RF-09:** a tela mostra o carregamento na primeira vez, o erro com "Tentar de novo" se a rota falhar, e recarrega ao puxar a lista para baixo.
- **RF-10:** sem resultado, a lista mostra "Nenhuma expressão encontrada."; com os salvos ligados e nenhum item salvo, "Você ainda não salvou nada. Toque no marcador de uma expressão para revê-la aqui.".
- **RF-11:** o teclado não cobre a lista nem o campo de busca, e tocar fora do campo ou rolar a lista fecha o teclado.

## Critérios de aceite

- [ ] O cartão aparece na aba Praticar e abre a tela, com conta gratuita e com assinante.
- [ ] Buscar "irmao" encontra "Mermão".
- [ ] O filtro de uma categoria, o botão dos salvos e a busca funcionam juntos.
- [ ] Salvar um item na lista aparece salvo no detalhe, e o contrário também; ao sair e voltar à tela, continua salvo.
- [ ] No detalhe, ouvir a palavra e depois o exemplo para o primeiro áudio; fechar o detalhe para o áudio.
- [ ] Com conta gratuita, um item exclusivo aparece esmaecido com o `PremiumBadge` e abre a tela de planos.
- [ ] Sem conexão, a tela mostra o erro e "Tentar de novo" recarrega.

## Desenho técnico

**Rotas e serviço**

- `src/constants/config.ts`: `vocabulary: '/api/mobile/vocabulary'` e `vocabularySave: (id) => '/api/mobile/vocabulary/<id>/save'` em `API_ROUTES`, com `encodeURIComponent`, como as rotas de flashcards.
- `src/services/vocabulary.ts`: tipos do contrato (`VocabularyCategory`, `VocabularyItem`, `VocabularyList`), `getVocabulary(token)` e `setVocabularySaved(token, id, saved)` (PUT ou DELETE), com `api` de `src/lib/api.ts`.
- `src/hooks/useVocabulary.ts`: `useApiQuery` com o `getVocabulary`, mais o estado local dos salvos e `toggleSaved(id)`, que atualiza na hora e desfaz se a rota falhar.

**Tela**

- `src/app/(app)/practice/vocabulary.tsx`: cabeçalho com voltar (`LessonHeader`), como as outras telas de `practice/`; a busca e os filtros ficam fixos no topo, e a lista rola embaixo, num `FlatList` com `keyboardDismissMode="on-drag"` e `keyboardShouldPersistTaps="handled"`.
- `src/components/vocabulary/`:
  - `VocabularyFilters.tsx`: a linha de categorias (`ScrollView` horizontal). O botão dos salvos fica na própria tela, ao lado da busca.
  - `VocabularyRow.tsx`: um item da lista, liberado ou exclusivo.
  - `VocabularyDetail.tsx`: o `Modal` de tela cheia do detalhe, com o próprio `ActivityAudioProvider` e o `AudioButton` (`src/components/activity/ActivityAudio.tsx`). O provider fica dentro do Modal: o áudio só existe no detalhe, e fechar para o player. O detalhe guarda o último item aberto para o conteúdo não mudar enquanto o Modal desce.
  - `CategoryLabel.tsx`: a categoria em letra pequena e maiúscula, usada na lista e no detalhe.
- `src/utils/vocabulary.ts`: `filterVocabulary(items, query, filter, onlySaved, savedIds)`, função pura com a normalização dos acentos (`normalize('NFD')`).
- `src/app/(app)/(tabs)/practice.tsx`: o `PracticeOption` novo, com o ícone `language` do Ionicons.

**Visual**

- Identidade do app: `bg-background`, Poppins, cantos `rounded-2xl`, separação por borda, sem sombras pequenas. A cor da categoria vem da rota; sem cor, usa a cor principal do app.
- Os textos da tela em português; o conteúdo do Dato como vem (ver README).

**Documentação**

- `CLAUDE.md`: a descrição da iniciativa, com a tela, os componentes e o hook.

## Verificação

- `yarn lint` e `yarn tsc --noEmit`.
- No aparelho, com conta gratuita e com assinante, os critérios de aceite.

## Resultado

- `yarn lint` e `yarn tsc --noEmit` passaram.
- `filterVocabulary` conferido com dados de teste: "irmao" e " IRMÃO " encontram "Mermão" pelo significado; filtro de categoria, "Salvos" vazio e com item, e busca com filtro juntos.
- As rotas usadas já estão no ar no backend local (fase 03 do site), com dois itens de teste no Dato e os áudios de uma voz de teste.
- Falta o teste no aparelho (critérios de aceite). Não exige build novo.

## Tarefas

- [x] `API_ROUTES`, serviço e hook.
- [x] Filtro puro em `src/utils/vocabulary.ts`.
- [x] Lista, filtros e item.
- [x] Detalhe com os áudios e o salvar.
- [x] Cartão na aba Praticar.
- [x] `CLAUDE.md`, status nesta spec e no README.
- [ ] Teste no aparelho.
