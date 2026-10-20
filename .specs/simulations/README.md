# Simulações

Opção nova na aba Praticar, "Simulações": cenários do dia a dia (pedir um café, fazer check-in num hotel) em que a IA faz uma personagem da cena e o aluno cumpre uma lista curta de tarefas conversando com ela. A tela mostra as tarefas e marca cada uma quando o aluno a cumpre. A simulação acaba quando todas estão cumpridas.

## Contexto

O chat com IA (`.specs/practice-chat/`) é uma conversa livre com a Gisa. As simulações treinam situações reais, com começo, meio e fim, e mostram ao aluno que ele conseguiu resolver a situação.

Exemplo do dono do projeto:

- **Título:** Pedir café
- **Descrição:** Você está pedindo um café e um lanche em uma cafeteria local.
- **Tarefas:**
  - Peça um cappuccino.
  - Pergunte se eles têm doces sem glúten.
  - Diga que quer pagar com cartão.

Os cenários, a personagem, a conferência das tarefas e os limites ficam no backend, descrito no repositório do site (`portuguese-with-giselle`, em `.specs/simulations/` de lá).

## Quem usa

O aluno. O Premium faz todas as simulações; o gratuito faz só as liberadas para o plano gratuito, uma por dia e só por texto.

## Objetivos

1. O aluno escolhe um cenário, lê a cena e as tarefas e começa.
2. Durante a conversa, vê o que falta e o que já fez, e cada frase volta corrigida, como no chat.
3. No fim, vê um resumo: as tarefas, o comentário da personagem e as frases corrigidas.
4. O aluno sabe quantas simulações ainda pode fazer hoje.

## Como funciona

1. Na aba Praticar, "Simulações" abre a lista de cenários, com o que resta hoje ("Restam 2 de 3 hoje").
2. O toque num cenário abre a apresentação: o emoji, o título, a descrição e as tarefas, com o botão "Começar".
3. "Começar" abre a conversa. A personagem fala primeiro. As tarefas ficam no topo, com o progresso (1/3).
4. O aluno responde por texto ou segurando o microfone, como no chat. Cada frase recebe o cartão de correção; cada tarefa cumprida fica marcada.
5. Quando todas as tarefas estão cumpridas, ou quando acabam as 12 mensagens, a conversa dá lugar ao resumo.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                                  | Motivo                                            |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Os cenários são cadastrados no DatoCMS pela equipe                                                       | Cenário novo sem deploy e sem versão nova do app  |
| O Premium faz todas; o gratuito faz só as liberadas, 1 por dia                                           | A amostra grátis mostra o que a assinatura libera |
| Cartão de correção a cada frase, como no chat, e um resumo no fim                                        | Escolha do dono do projeto                        |
| Até 3 simulações começadas por dia e até 12 mensagens do aluno em cada, à parte das 30 mensagens do chat | Custo previsível, sem tirar mensagens do chat     |
| A voz da personagem e a resposta falada dividem os limites e o teto mensal de voz com o chat             | A voz é a maior parte do custo                    |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                                                                                                | Motivo                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| "Simulações" é um cartão novo na aba Praticar, logo depois do "Chat com IA"                                                                                            | As formas de prática ficam juntas                            |
| O aluno gratuito vê todos os cenários. Os trancados levam a etiqueta Premium, e o toque leva à tela de planos                                                          | Mostra o que a assinatura libera, como no vocabulário        |
| O gratuito faz a amostra só por texto: sem a voz da personagem e sem o microfone, que mostram a etiqueta Premium                                                       | As rotas de voz são só para assinantes; a voz é o que custa  |
| A apresentação mostra as tarefas antes de começar, e a simulação só conta quando o aluno toca em "Começar"                                                             | O aluno decide sabendo o que vai fazer                       |
| A personagem tem o emoji do cenário no lugar da foto da Gisa                                                                                                           | Deixa claro que não é a Gisa, é uma personagem da cena       |
| As tarefas ficam numa faixa no topo da conversa, recolhida no progresso ("Tarefas 1/3") e aberta com um toque. Ao cumprir uma, a faixa mostra qual por alguns segundos | O aluno vê o que falta sem perder espaço da conversa         |
| "Restam N mensagens" aparece quando faltam 3 ou menos                                                                                                                  | O aluno sabe que a simulação vai acabar, sem ruído no começo |
| Sair no meio pede confirmação: "Sair da simulação? Ela conta como uma das de hoje."                                                                                    | A simulação já contou ao começar, e a conversa não é salva   |
| A conversa não é salva: sair encerra a simulação                                                                                                                       | O backend não guarda a conversa                              |
| O resumo do fim é montado no app com o que ele já tem (as tarefas, as frases corrigidas e o `feedback` do último turno), sem chamada extra                             | Não custa nada a mais                                        |
| "Tentar de novo" no resumo começa outra simulação do mesmo cenário e gasta uma das do dia                                                                              | Mesma regra do backend                                       |
| A voz automática segue a mesma opção do chat (`pwg.chatAutoplay`)                                                                                                      | Uma preferência só para as conversas com IA                  |
| Reaproveita os componentes e os hooks do chat; nenhuma biblioteca nova                                                                                                 | Não exige novo development build                             |

## Fora do escopo

- Simulações no site.
- Uma voz própria por cenário.
- Retomar uma simulação depois de sair.
- Nota, pontuação, Progresso e conquistas das simulações.
- Filtrar ou buscar cenários (a lista é curta).
- Trocar o estilo ou o idioma da explicação pela simulação: valem os do chat.

## Pré-requisitos

- As fases 01 e 02 de `.specs/simulations/` do site no ar.
- Pelo menos um cenário publicado no Dato (a migration do site cria "Pedir café").

## Fases

| Fase                          | Assunto                                                               | Status       |
| ----------------------------- | --------------------------------------------------------------------- | ------------ |
| [01](01-simulations-list.md)  | Cartão "Simulações" na aba Praticar e a lista de cenários             | em andamento |
| [02](02-simulation-screen.md) | Apresentação, conversa com as tarefas, aviso de saída e resumo do fim | em andamento |

O contrato das rotas e o desenho que as duas fases dividem estão em [architecture.md](architecture.md).
