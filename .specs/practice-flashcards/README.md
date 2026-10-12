# Flashcards

Segunda opção da aba Praticar: os flashcards que já existem no site, com o mesmo conteúdo e o mesmo progresso, numa sessão de estudo feita para o toque (virar com um toque, responder arrastando).

## Contexto

A aba Praticar (`src/app/(app)/(tabs)/practice.tsx`) nasceu com uma opção só, o "Chat com IA". O site já oferece flashcards na área do aluno: conjuntos de cards cadastrados no DatoCMS, em que o aluno vira o card e marca "aprendi" ou "ainda aprendendo". Esta iniciativa leva esse recurso para o app.

O app não fala com o DatoCMS nem com o banco. Ele usa rotas do backend descritas no repositório do site (`portuguese-with-giselle`, em `.specs/practice-flashcards/` de lá).

## Quem usa

Qualquer aluno logado, assinante ou gratuito, como no site.

## Objetivos

1. O aluno encontra no app os mesmos conjuntos e cards do site.
2. O progresso é um só: o que ele marca no app vale no site, e o contrário.
3. Estudar é fluido: o card responde ao dedo, a troca de card não espera a rede e não há tela de carregamento entre um card e outro.

## Como funciona

1. Praticar > "Flashcards" abre a lista de conjuntos, com o progresso de cada um.
2. Tocar num conjunto abre a sessão de estudo, com os cards que o aluno ainda não aprendeu (como no site).
3. O aluno toca no card para virar. Arrasta para a direita, ou toca no botão verde, para "aprendi"; para a esquerda, ou no botão laranja, para "ainda aprendendo".
4. A resposta é gravada em segundo plano e o card seguinte, que já estava embaixo, assume o lugar.
5. No fim da rodada aparece um resumo, com as opções de continuar com os cards que faltam, revisar todos ou voltar à lista.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                             | Motivo                                             |
| --------------------------------------------------- | -------------------------------------------------- |
| "Flashcards" é mais um item da aba Praticar         | A aba reúne as formas de prática                   |
| Mesmos dados do site, respeitando a estrutura de lá | Um conteúdo só para manter e um progresso só       |
| A experiência precisa ser muito fluida              | Flashcard é repetição rápida; qualquer espera pesa |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                              | Motivo                                                                                                                           |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Aberto ao aluno gratuito                                                             | O site não restringe os flashcards por role                                                                                      |
| Responder arrastando o card, além dos dois botões do site                            | É o gesto natural no celular; os botões continuam para quem prefere e para o leitor de tela                                      |
| A resposta é gravada sem o aluno esperar; falha vira um aviso discreto               | A troca de card não pode depender da rede. O site também não espera                                                              |
| O conjunto inteiro é carregado ao abrir a sessão                                     | Depois disso, nenhum card espera uma chamada                                                                                     |
| O card seguinte já fica montado embaixo do atual                                     | A troca é só uma animação, sem montar nada na hora                                                                               |
| No fim da rodada há um resumo, em vez de voltar direto para a lista como o site      | Dá para seguir estudando os cards que faltam sem sair da tela                                                                    |
| Com todos os cards aprendidos, a sessão abre no resumo, com "Revisar todos os cards" | No site essa situação mostra uma tela vazia                                                                                      |
| Frente azul e verso verde, em cor sólida                                             | As cores do site; o degradê exigiria uma biblioteca nova                                                                         |
| Sem áudio e sem favoritar                                                            | O áudio do site usa a voz do navegador; no app exigiria `expo-speech` e um novo build. O botão de favoritar do site não faz nada |
| Nenhuma biblioteca nova                                                              | Não exige novo development build                                                                                                 |

## Fora do escopo

- Ouvir o card (áudio) e favoritar.
- Repetição espaçada, lembretes e metas diárias.
- Zerar o progresso de um conjunto.
- Desfazer a última resposta.
- Estudo sem conexão.
- Mudanças nos flashcards do site.

## Pré-requisitos

- As rotas `/api/mobile/flashcards` no ar (fase `01-flashcards-api` do site).

## Fases

| Fase                                        | Entrega                                                 | Status    |
| ------------------------------------------- | ------------------------------------------------------- | --------- |
| [01-flashcards-list](01-flashcards-list.md) | Opção na aba Praticar e lista de conjuntos              | concluída |
| [02-study-session](02-study-session.md)     | Sessão de estudo com virar, arrastar, registro e resumo | concluída |

O desenho compartilhado está em [architecture.md](architecture.md).

## Glossário

- **Flashcard / conjunto:** um grupo de cards com título, como "Verbos do dia a dia". O site chama o conjunto de "flashcard" e cada item de "card"; o app usa os mesmos nomes.
- **Card:** um item do conjunto, com frente e verso.
- **Rodada:** uma passagem por uma lista de cards, um de cada vez.
- **Aprendi / Ainda aprendendo:** as duas respostas possíveis a um card.
