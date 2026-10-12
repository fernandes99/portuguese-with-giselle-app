# Conquistas e histórico

Um aviso animado, com som, quando o aluno desbloqueia uma conquista, e a tela "Histórico", aberta pelo Perfil, com tudo o que ele já estudou.

## Contexto

As conquistas já aparecem na aba Progresso, mas até aqui quase nenhuma era desbloqueada, e o aluno não era avisado quando acontecia. O histórico de estudo só existia para a professora, na ficha do aluno no site.

O backend passou a decidir as oito conquistas cadastradas e a devolver as recém-desbloqueadas nas respostas das rotas, e ganhou uma rota de histórico. Está tudo descrito no repositório do site (`portuguese-with-giselle`, em `.specs/achievements-history/` de lá), inclusive a regra de cada conquista.

## Quem usa

Qualquer aluno logado.

## Objetivos

1. O aluno fica sabendo na hora, em qualquer tela, que desbloqueou uma conquista.
2. Ele consulta o próprio histórico: o que iniciou, o que está em andamento e o que concluiu.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                               | Motivo        |
| ------------------------------------------------------------------------------------- | ------------- |
| Aviso que aparece rapidamente no topo, com animação, quando uma conquista é alcançada | Pedido direto |
| Um som que remete a conquista realizada                                               | Pedido direto |
| Tela "Histórico" no Perfil, com a mesma lista que a professora vê no site             | Pedido direto |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                                    | Motivo                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| O aviso é disparado dentro do cliente HTTP (`src/lib/api.ts`), para qualquer resposta que traga conquistas | Nenhuma tela precisa saber de conquistas, e rotas novas passam a avisar sem código no app |
| O aviso fica montado no layout da área logada, por cima de todas as telas                                  | Uma conquista pode sair no meio de uma aula, do chat ou de uma lista                      |
| Uma conquista por vez; as que chegam juntas entram numa fila                                               | Duas podem sair na mesma ação (última aula fecha o curso)                                 |
| O aviso não é tocável e some sozinho em cerca de 3 segundos                                                | "Aparecendo rapidamente"; as conquistas ficam na aba Progresso                            |
| O som é gerado por um script do repositório, como o do parabéns da aula                                    | Sem arquivo de terceiros nem licença para conferir                                        |
| O histórico usa os rótulos e as cores da tela da professora, com o filtro em verde                         | "Mesma tabela"; o verde é a cor de seleção do app                                         |
| Paginação com "Carregar mais", 20 por vez                                                                  | A tela da professora pagina de 20 em 20; no celular, rolar é mais natural que numerar     |
| Título e descrição da conquista aparecem como estão no cadastro (em inglês)                                | Traduzir é outra entrega, no site                                                         |
| Nenhuma biblioteca nova                                                                                    | `expo-audio` e `react-native-reanimated` já estão no app                                  |

## Fora do escopo

- Tela de detalhe de conquista e lista de conquistas fora da aba Progresso.
- Notificação com o app fechado.
- Tocar no aviso para abrir alguma tela.
- Tocar num item do histórico para abrir a aula.
- Ajuste de volume ou opção de silenciar o som.

## Pré-requisitos

- As rotas do backend com `unlockedAchievements` e `GET /api/mobile/history` no ar (fases `01-achievement-engine` e `02-history` do site).

## Fases

| Fase                                            | Entrega                                 | Status    |
| ----------------------------------------------- | --------------------------------------- | --------- |
| [01-achievement-toast](01-achievement-toast.md) | Aviso de conquista, com animação e som  | concluída |
| [02-history-screen](02-history-screen.md)       | Tela "Histórico" e o acesso pelo Perfil | concluída |

O desenho compartilhado está em [architecture.md](architecture.md).

## Glossário

- **Conquista desbloqueada:** conquista que o backend acabou de dar ao aluno, devolvida em `unlockedAchievements`.
- **Histórico:** uma linha por item (curso, módulo, aula, atividade ou card), com a situação atual e a data da última mudança. Não é um registro de cada visita.
