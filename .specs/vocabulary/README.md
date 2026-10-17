# Vocabulário

Uma tela de vocabulário na aba Praticar: gírias, regionalismos e expressões do dia a dia, cada uma com o significado, um exemplo traduzido, o áudio da palavra e o do exemplo, e um botão para salvar.

## Contexto

Os itens são cadastrados no DatoCMS (modelo `vocabulary`), com os áudios gerados pela ElevenLabs por um script do site. O site entrega o modelo, os áudios, a tabela dos salvos e as rotas do app, descritos em `.specs/vocabulary/` do repositório `portuguese-with-giselle`. Lá também está a página do site, que mostra a mesma lista.

Este repositório entrega a tela do app.

## Objetivos

1. O aluno abre o vocabulário pela aba Praticar, busca, filtra por categoria e pelos salvos e abre o detalhe de cada item.
2. No detalhe, ouve a palavra e o exemplo e salva o item.
3. O aluno gratuito vê o que existe e chega à tela de planos pelos itens exclusivos.

## Decisões

| Decisão                                                                                                                                                            | Motivo                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| A tela abre por um cartão "Vocabulário" na aba Praticar, sem aba nova                                                                                              | Escolha do dono do projeto                                                                                  |
| Os salvos ficam num botão ao lado da busca (ícone de marcador), que liga e desliga e vale junto com a categoria; a linha de filtros tem só "Todas" e as categorias | Escolha do dono do projeto                                                                                  |
| O aluno gratuito vê a palavra e o significado dos itens exclusivos, esmaecidos e com o `PremiumBadge`; o toque leva a `/plans`                                     | O backend não manda o exemplo nem os áudios desses itens; o app segue o padrão de `src/components/premium/` |
| O detalhe é um modal de tela cheia aberto pela própria lista, e não uma rota                                                                                       | Não há rota de um item só; o modal usa o item que a lista já tem e mantém o salvo em sincronia              |
| A lista vem inteira numa chamada; a busca e os filtros rodam no app                                                                                                | São algumas centenas de itens no máximo                                                                     |
| Os áudios tocam pelo player das atividades (`ActivityAudioProvider`, `src/components/activity/ActivityAudio.tsx`)                                                  | Já toca no modo silencioso do iPhone e para um áudio quando outro começa                                    |
| Os títulos das categorias, o significado e a tradução do exemplo aparecem como estão no Dato, em inglês                                                            | São conteúdo, cadastrado para alunos estrangeiros; os outros textos da tela ficam em português              |
| Sem dependência nativa nova                                                                                                                                        | Não exige development build                                                                                 |

## Fora do escopo

- Palavra do dia, aba própria e tela no Perfil.
- Levar os itens salvos para os flashcards.
- Contar o uso no Progresso ou nas conquistas.
- Uso offline.

## Fases

| Fase                          | Assunto                                                    | Status       |
| ----------------------------- | ---------------------------------------------------------- | ------------ |
| [01](01-vocabulary-screen.md) | Cartão na aba Praticar, lista com busca e filtros, detalhe | em andamento |

## Contrato da rota

Cópia do README da iniciativa no site. Mudou um, mude o outro.

`GET /api/mobile/vocabulary` (token Bearer do app)

```json
{
  "categories": [{ "id": "...", "title": "Slang", "color": "#7C3AED" }],
  "items": [
    {
      "id": "id do registro no Dato",
      "term": "Mermão",
      "meaning": "Bro / Big bro. Short for \"Meu irmão\", distinct in Rio.",
      "pronunciation": null,
      "example": "Mermão, isso não se faz.",
      "exampleTranslation": "Bro, you don't do that.",
      "termAudioUrl": "https://www.datocms-assets.com/...",
      "exampleAudioUrl": "https://www.datocms-assets.com/...",
      "categoryIds": ["..."],
      "isLocked": false,
      "isSaved": true
    }
  ]
}
```

- `categories`: só as que têm pelo menos um item, em ordem alfabética. `color` em hexadecimal, ou `null` sem cor.
- `items`: em ordem alfabética pela palavra. Num item trancado (`isLocked: true`), `example`, `exampleTranslation`, `termAudioUrl` e `exampleAudioUrl` vêm `null` e `isSaved` vem `false`.
- `pronunciation`, `termAudioUrl` e `exampleAudioUrl` vêm `null` quando o campo está vazio no Dato.
- Erros: 401 sem token; 500 com `{ error }` em português.

`PUT /api/mobile/vocabulary/[id]/save` salva o item e `DELETE` na mesma rota tira dos salvos. Respondem `{ saved: true }` ou `{ saved: false }`. Repetir a mesma chamada não é erro. 401 sem token, 403 com `VOCABULARY_SUBSCRIBERS_ONLY_ERROR` ("Esta expressão é exclusiva para assinantes.") para item trancado e 404 para item que não existe ou não está publicado.
