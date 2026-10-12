# Aulas particulares

Terceira opção da aba Praticar: o aluno compra aulas particulares avulsas, vê quantas tem disponíveis, agenda com a professora Giselle quando tem saldo e acompanha os agendamentos.

## Contexto

A aba Praticar (`src/app/(app)/(tabs)/practice.tsx`) tem hoje "Chat com IA" e "Flashcards". As aulas particulares são agendadas no Calendly da professora, sem venda nem controle pelo sistema.

O app não fala com o Stripe nem com o Calendly. Ele usa rotas do backend, descritas no repositório do site (`portuguese-with-giselle`, em `.specs/private-lessons/` de lá), que cuidam do pagamento, do saldo e da ligação entre o agendamento e a conta do aluno.

## Quem usa

Qualquer aluno logado, assinante ou gratuito. A aula particular é um produto à parte da assinatura.

## Objetivos

1. O aluno sabe, ao abrir a tela, quantas aulas tem disponíveis e quando é a próxima.
2. Ele compra aulas em poucos toques e volta ao app com a compra confirmada.
3. Ele só chega à agenda quando tem aula disponível.
4. Ele vê todos os agendamentos: agendados, realizados e cancelados.

## Como funciona

1. Praticar > "Aulas particulares" abre a tela, com o saldo em destaque.
2. "Comprar aulas" abre a escolha de quantidade, com o total. "Continuar para o pagamento" abre o Checkout do Stripe no navegador do sistema.
3. Depois de pagar, o aluno volta sozinho para o app, na tela de compra confirmada, com o saldo novo.
4. "Agendar aula" só funciona com saldo. Abre a agenda da professora no navegador interno; o aluno escolhe o horário e a aula sai do saldo.
5. "Ver agendamentos" abre a lista, com as aulas agendadas, realizadas e canceladas.
6. Até 12 horas antes do início, o aluno remarca ou cancela pelo app. Cancelar nesse prazo devolve a aula ao saldo. Depois disso, ele fala com a professora por email.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                        | Motivo                                                                   |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| "Aulas particulares" é mais um item da aba Praticar                                            | Pedido direto                                                            |
| A tela mostra "X aulas disponíveis"                                                            | Pedido direto                                                            |
| Aulas avulsas a 25 USD, pagas pelo Stripe                                                      | Pedido direto                                                            |
| O pagamento acontece fora do app, por um link gerado na hora, e volta para uma tela de sucesso | Pedido direto                                                            |
| Só agenda quem tem aula disponível                                                             | Pedido direto                                                            |
| Botão "Ver agendamentos", com aulas agendadas, canceladas e realizadas                         | Pedido direto                                                            |
| Remarcar e cancelar só até 12 horas antes; cancelar nesse prazo devolve a aula                 | Regra da professora                                                      |
| "Realizada" é a aula agendada cuja data já passou; o app não grava nada ao abrir a tela        | O backend calcula                                                        |
| Fora do prazo, o contato é por email (`gisellemayra6@gmail.com`)                               | É o canal de hoje; um chat com a professora no app virá em outra entrega |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                                    | Motivo                                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| O pagamento abre com `WebBrowser.openAuthSessionAsync`, com retorno pelo endereço `pwg://` | O navegador fecha sozinho quando o Stripe devolve o aluno, e o app recebe o resultado             |
| A tela de compra confirmada consulta o backend até a compra constar como paga              | O aviso do Stripe ao backend pode atrasar alguns segundos                                         |
| Se o aluno fechar o navegador à mão, o app confere a compra do mesmo jeito                 | Ele pode ter pago e fechado antes do retorno                                                      |
| Preço, quantidade máxima, prazo e email de contato vêm do backend                          | Mudar qualquer um não exige nova versão do app                                                    |
| A agenda abre no navegador interno (`openBrowserAsync`); ao fechar, a tela recarrega       | Já é como o app abre páginas externas                                                             |
| Depois de fechar a agenda, a tela recarrega mais duas vezes, com 3 e 8 segundos            | O aviso do Calendly ao backend pode atrasar                                                       |
| O saldo aparece zerado e o botão de agendar apagado, com a razão escrita, em vez de sumir  | O aluno entende o que falta para agendar                                                          |
| Lista de agendamentos em vez do calendário do desenho anterior                             | Foi o que o dono do projeto pediu no replanejamento                                               |
| Aberta a qualquer aluno logado                                                             | Produto à parte da assinatura                                                                     |
| Nenhuma dependência nova                                                                   | `expo-web-browser` e `expo-linking` já estão no app; não exige novo build por causa de biblioteca |

## Fora do escopo

- Tela de pagamento dentro do app, cartão salvo ou Apple Pay e Google Pay nativos.
- Calendário do mês e telas próprias de escolha de horário.
- Histórico de compras e recibos.
- Reembolso pedido pelo app.
- Lembretes, notificações e inclusão da aula na agenda do aparelho.
- Chat com a professora.
- Aulas particulares na aba Progresso, no histórico ou nas conquistas.

## Pré-requisitos

- Fase `01-lesson-credits` do site no ar, para a fase 01 daqui.
- Fase `02-calendly-booking` do site no ar, para a fase 02 daqui.

## Riscos conhecidos

- **Lojas de aplicativos.** O pagamento acontece fora do app. A Apple permite isso para serviço individual ao vivo entre duas pessoas; a regra do Google Play para esse caso não foi conferida. Vale conferir antes de publicar a versão.

## Fases

| Fase                                      | Entrega                                                             | Status       |
| ----------------------------------------- | ------------------------------------------------------------------- | ------------ |
| [01-lesson-credits](01-lesson-credits.md) | Opção na aba Praticar, saldo, compra de aulas e tela de confirmação | em andamento |
| [02-booking](02-booking.md)               | Agendar, próxima aula, lista de agendamentos e regra de 12 horas    | em andamento |

O desenho compartilhado está em [architecture.md](architecture.md).

## Glossário

- **Aula disponível / saldo:** aula comprada que ainda não foi usada num agendamento.
- **Agendamento:** um horário marcado com a professora.
- **Próxima aula:** o agendamento ativo que termina primeiro depois de agora.
- **Realizada:** agendamento ativo cujo horário já passou.
