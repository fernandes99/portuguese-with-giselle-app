# Ranking

Tela do ranking global dos alunos pelo score, com o seletor entre o mês corrente e o total, igual à página `/student/ranking` do site. O ranking é calculado pelo backend (`.specs/ranking/` do repositório do site); o app só mostra.

## Contexto

- A rota `GET /api/mobile/ranking?period=month|total` já existe no site e devolve o topo (até o 50º), a linha do próprio aluno com a posição real (`me`, `null` sem score no período) e as datas do mês. Cada linha traz a posição, o nome curto ("Maria S."), a foto, o score, os dias seguidos e `isMe`.
- A professora e os admins ficam fora do ranking, e quem tem score 0 no período não tem posição. O app não refaz nenhuma dessas regras.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                        | Motivo        |
| ------------------------------------------------------------------------------ | ------------- |
| Mesmo desenho do site: seletor, pódio com os 3 primeiros, lista e a linha fixa | Pedido direto |
| A linha do aluno fica fixa no pé da tela, também quando ele está no topo       | Pedido direto |
| Cada linha: posição, foto, nome, dias seguidos e score                         | Pedido direto |

Tomadas no planejamento (corrigíveis):

| Decisão                                                                                                                                   | Motivo                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A tela fica na pilha da aba Progresso (`/progress/ranking`), com o menu de baixo, e abre por um cartão "Ranking" logo depois da sequência | O Progresso já reúne sequência e conquistas; o menu fica, como na lista de simulações (pedido do dono) |
| Textos em português ("Este mês", "Total", "Aluno")                                                                                        | Regra do app; o site usa inglês na área do aluno                                                       |
| Ao trocar o período, a lista do outro período só aparece quando chega; até lá, o indicador de carregamento                                | Não mostrar a lista de um período com o seletor no outro                                               |

## Fora do escopo

- Ranking por semana, por nível ou entre amigos; prêmios e avisos de mudança de posição.
- Qualquer regra de cálculo, que fica no backend.

## Fases

| Fase                                      | Entrega                                     | Status    |
| ----------------------------------------- | ------------------------------------------- | --------- |
| [01-ranking-screen](01-ranking-screen.md) | Tela `/ranking` e o cartão na aba Progresso | concluída |
