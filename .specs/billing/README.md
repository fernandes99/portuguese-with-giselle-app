# Pagamentos

Tela "Pagamentos", aberta pelo Perfil: a assinatura atual, o cartão salvo, o saldo de aulas particulares e o histórico de tudo o que o aluno pagou, assinatura e aulas particulares juntas.

## Contexto

O aluno paga pelo app em dois lugares: a assinatura Premium (`.specs/subscription-plans/`) e as aulas particulares avulsas (`.specs/private-lessons/`). Não há onde ver o que já foi pago, quando a assinatura renova ou como cancelar.

O backend monta a visão única e abre o portal de cobrança do Stripe (repositório `portuguese-with-giselle`, `.specs/billing/` de lá). Este repositório entrega a tela.

## Objetivos

1. O aluno vê todos os pagamentos que fez, do mais novo para o mais antigo, e abre o recibo de cada um.
2. O aluno vê a situação da assinatura (plano, valor, próxima cobrança ou fim), o cartão salvo e quantas aulas particulares tem.
3. O aluno gerencia a assinatura (cancelar, trocar o cartão) pelo portal do Stripe, sem sair do fluxo do app.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                              | Motivo                                                               |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Tela de pagamentos no app, com assinatura e aulas particulares no mesmo histórico                    | Pedido direto                                                        |
| A assinatura é gerenciada pelo portal do Stripe ("Gerenciar assinatura"), aberto no navegador do app | Escolha do dono do projeto: nenhuma regra de cobrança nova no código |
| Cada pagamento abre o recibo do Stripe                                                               | Escolha do dono do projeto                                           |
| A tela mostra a assinatura atual, o cartão salvo, o saldo de aulas particulares e o histórico        | Escolha do dono do projeto                                           |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                                     | Motivo                                                          |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| A tela abre por uma linha "Pagamentos" no Perfil, junto de "Meus cursos" e "Histórico"                      | É onde ficam as outras telas da conta                           |
| A tela é uma rota fora das abas, `/billing`, com o cabeçalho de voltar                                      | Mesmo modelo de `/history` e `/notifications`                   |
| Os textos (descrição, situação, datas, valores) são escritos no app, a partir dos dados do backend          | O backend devolve dados, não frases                             |
| A volta do portal chega por `pwg://billing`, e a tela recarrega ao voltar, tenha o aluno mudado algo ou não | O app não sabe o que foi feito no portal; o backend sabe        |
| Sem paginação no histórico                                                                                  | O backend devolve tudo de uma vez; o volume por aluno é pequeno |
| Sem dependência nativa nova                                                                                 | `expo-web-browser` já está instalado; não exige build novo      |

## Fora do escopo

- Cancelar ou reativar a assinatura com botões do app.
- Trocar ou remover cartão fora do portal.
- Pedido de reembolso.
- Baixar ou compartilhar o recibo como arquivo (o recibo do Stripe já permite baixar).

## Fases

| Fase                                           | Depende de | Status    |
| ---------------------------------------------- | ---------- | --------- |
| [01. Tela de pagamentos](01-billing-screen.md) | site 01    | concluída |

O contrato das rotas está em [architecture.md](architecture.md).
