# Boas-vindas do aluno

Perguntas logo depois do cadastro ou do login, enquanto o aluno ainda não respondeu: o idioma nativo, o nome, o nível de português, o objetivo com o idioma e os três temas de que ele mais gosta de conversar. As respostas ficam no banco, e o aluno pode mudá-las depois pelo Perfil.

## Contexto

Hoje o aluno entra direto nas abas depois do login (`Stack.Protected` em `src/app/_layout.tsx`), e a plataforma não sabe nada dele além da conta e do plano. As respostas vão servir, numa próxima iniciativa, para o chat com IA e para o painel da professora.

O backend (tabela, opções, rotas e o campo `onboardingCompleted` na sessão) está no repositório do site, em `.specs/onboarding/` de lá. Este repositório entrega as telas.

## Quem usa

- **Aluno**: responde no primeiro acesso e edita pelo Perfil.

## Objetivos

1. Ninguém chega às abas sem ter respondido as três perguntas.
2. O fluxo é rápido e parece parte da aula: barra de progresso no topo, a professora fazendo a pergunta, uma resposta por tela e o botão "Continuar" embaixo.
3. O aluno muda as respostas quando quiser, pelo Perfil, com as mesmas telas.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                                                                                             | Motivo                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Três perguntas: nível, objetivo (profissional, pessoal, viagem, acadêmico) e exatamente 3 interesses                                                                | Pedido direto                                    |
| O fluxo aparece depois do cadastro ou do login, só para quem ainda não respondeu (inclui contas antigas)                                                            | Pedido direto                                    |
| Só no app; o site não pergunta                                                                                                                                      | Escolha do dono do projeto                       |
| Nível por autoavaliação, em 4 opções com uma frase cada                                                                                                             | Escolha do dono do projeto                       |
| A lista de temas vem do backend                                                                                                                                     | Escolha do dono do projeto                       |
| Edição pelo Perfil                                                                                                                                                  | Escolha do dono do projeto                       |
| Layout como o da aula guiada: barra de progresso no topo, a professora com a pergunta num balão, opções em cartões e "Continuar" no rodapé, com a identidade do app | Pedido direto, com uma referência visual         |
| Esta iniciativa só coleta; o uso no chat e no painel vem numa próxima                                                                                               | Escolha do dono do projeto                       |
| Fase 03: ordem idioma nativo, nome, nível, objetivo, temas e uma tela final de boas-vindas com uma frase de incentivo                                               | Pedido direto, com referências visuais           |
| Fase 03: idioma nativo entre espanhol, inglês e "outro"                                                                                                             | Escolha do dono do projeto                       |
| Fase 03: o nome digitado troca o nome da conta                                                                                                                      | Escolha do dono do projeto                       |
| Fase 03: nível de A0 a C2, agrupado em iniciante, intermediário e avançado                                                                                          | Escolha do dono do projeto                       |
| Fase 03: as telas de pergunta mantêm a professora no balão e o verde do app (a referência usa título solto e roxo)                                                  | Identidade do app e o layout aprovado na fase 01 |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                                                     | Motivo                                                                              |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| O desvio usa `user.onboardingCompleted`, que já vem no login e no `me`; o fluxo é um grupo de rotas próprio, `(onboarding)` | Sem chamada nova ao abrir o app; as abas, o sino e o push só montam depois do fluxo |
| Campo ausente (backend antigo) conta como respondido                                                                        | O app novo não pode prender o aluno se chegar antes do deploy do site               |
| As respostas são gravadas uma vez, no fim; voltar entre as telas mantém as escolhas                                         | Um envio só e nenhum estado pela metade no banco                                    |
| Uma tela por pergunta, numa tela só do Expo Router (passos em estado), não três rotas                                       | O voltar do topo e o do Android mudam de passo sem empilhar telas                   |
| Sem áudio na pergunta (a referência tem)                                                                                    | Não há áudio gravado para essas falas                                               |
| No primeiro passo do fluxo, o "X" do topo pergunta se o aluno quer sair da conta                                            | Quem entrou na conta errada precisa de uma saída                                    |
| Toque de push com o fluxo aberto é tratado depois do fluxo                                                                  | O tratamento do push mora em `(app)`, que só monta depois                           |

## Fora do escopo

- Usar as respostas no chat com IA ou no painel da professora.
- Fluxo no site.
- Teste de nivelamento e áudio nas perguntas.
- Tela de boas-vindas antes da primeira pergunta.

## Pré-requisitos

- Fase 01 do site (`portuguese-with-giselle/.specs/onboarding/01-preferences-api.md`) no ar, com a migration aplicada.
- Para a fase 03: a fase 02 do site (`02-language-name-level.md`) no ar, com a migration aplicada.

## Fases

| Fase                                                                         | Depende de               | Status       |
| ---------------------------------------------------------------------------- | ------------------------ | ------------ |
| [01. Fluxo de boas-vindas](01-onboarding-flow.md)                            | fase 01 do site          | em andamento |
| [02. Edição pelo Perfil](02-edit-preferences.md)                             | 01                       | em andamento |
| [03. Idioma nativo, nome, nível de A0 a C2 e boas-vindas](03-new-screens.md) | 01, 02 e fase 02 do site | rascunho     |

O contrato das rotas, o layout e os componentes estão em [architecture.md](architecture.md).
