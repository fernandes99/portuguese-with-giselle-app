# Notificações

Sino com contador nas quatro abas, tela com a lista de notificações, tela de detalhe e push no aparelho. Cada notificação tem título, descrição e, quando faz sentido, um botão que leva à tela do destino.

## Contexto

Hoje o app não avisa o aluno de nada fora da tela aberta. O único aviso é o contador de mensagens da professora no Perfil (`TeacherChatUnreadContext`, `.specs/teacher-chat/`), que foi feito sem notificação.

O app só conversa com o backend. As tabelas, a lista de destinos, o envio do push, a tela de envio da professora e as notificações automáticas estão no repositório do site (`portuguese-with-giselle`, em `.specs/notifications/` de lá). O site também mostra as mesmas notificações num sino com popup, sem push.

## Quem usa

Qualquer conta logada. O aluno recebe as notificações enviadas pela professora (para todos, por plano ou só para ele) e as automáticas dos eventos dele.

## Objetivos

1. O aluno vê no sino quantas notificações ainda não leu, em qualquer aba.
2. A tela de notificações mostra as lidas e as não lidas; a de detalhe mostra o texto inteiro e o botão do destino.
3. O push chega com o app fechado; tocar nele leva à tela certa.

## Como funciona

1. As abas Aprender, Praticar, Progresso e Perfil têm um sino no canto superior direito, com o número de não lidas.
2. O sino abre a tela "Notificações": a lista, da mais nova para a mais antiga, com as não lidas destacadas, e "Marcar todas como lidas".
3. Tocar num item abre o detalhe, que marca a notificação como lida e mostra o botão do destino (ex.: "Ver meu progresso"), quando houver.
4. Na primeira entrada nas abas depois do login, o app pede permissão para notificações. Com permissão, o push chega mesmo com o app fechado.
5. Tocar no push marca como lida e abre a tela do destino; sem destino, abre o detalhe.

## Como funcionam os links

A notificação não guarda uma URL. Ela guarda um **destino** de uma lista fechada no site (`src/lib/notifications.ts` de lá), e a rota do app já devolve o caminho da tela no app:

- `{ "type": "screen", "path": "/progress", "label": "Ver meu progresso" }`: o app navega com `router.push(path)`. Os caminhos são os do Expo Router (`src/app/(app)/...`, sem os grupos entre parênteses), os mesmos que `pwg://progress` abriria de fora do app.
- `{ "type": "url", "url": "https://...", "label": "Abrir o link" }`: abre no navegador do app.
- `null`: o destino não tem tela no app (ex.: lição de casa, que só existe no site). O detalhe mostra só o texto.

Um destino novo para uma tela que o app já tem só muda o site. Uma tela nova do app precisa de versão nova do app antes de virar destino.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                | Motivo                     |
| -------------------------------------------------------------------------------------- | -------------------------- |
| Push no app; sino no canto superior direito das telas com o menu de abas               | Pedido direto              |
| Tela de lista (lidas e não lidas) e tela de detalhe                                    | Pedido direto              |
| Origens: envio manual da professora, resposta no chat, lição de casa e aula particular | Escolha do dono do projeto |
| O link é um destino de uma lista fechada, traduzido pelo backend para o caminho do app | Escolha do dono do projeto |
| Tudo em português                                                                      | Escolha do dono do projeto |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e na spec da fase):

| Decisão                                                                                                                   | Motivo                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| As notificações vêm sempre do backend; o app não guarda nada no aparelho                                                  | Uma fonte só, a mesma do site; ler no site marca como lida no app                                      |
| O contador é buscado ao entrar na área logada, ao voltar ao app, quando uma aba ganha foco e quando chega um push         | Mesmo modelo do contador do chat com a professora                                                      |
| O sino fica na linha do título de cada aba e rola com o conteúdo                                                          | As abas não têm cabeçalho fixo; um sino solto por cima cobriria o conteúdo                             |
| Abrir o detalhe marca como lida; a lista não marca nada sozinha                                                           | O aluno pode ver a lista sem perder o destaque das que ainda não abriu                                 |
| Tocar no push vai direto ao destino; sem destino, ao detalhe                                                              | O push já mostrou o texto; o que o aluno quer é a tela                                                 |
| Permissão pedida uma vez, na primeira entrada nas abas depois do login; negada, a tela de notificações mostra como ativar | O pedido aparece quando o aluno já está dentro do app, e não volta a incomodar                         |
| Com o app aberto, o push aparece como banner e o contador atualiza                                                        | O aluno pode estar em outra tela                                                                       |
| Ao sair da conta, o app apaga o token do aparelho no backend                                                              | O aparelho para de receber os avisos da conta que saiu                                                 |
| Push pelo serviço da Expo (`expo-notifications`)                                                                          | O app já é Expo e tem projeto no EAS; o backend envia para um token só, sem lidar com Firebase e Apple |

## Fora do escopo

- Preferências por tipo de notificação dentro do app.
- Número no ícone do app.
- Apagar notificação.
- Guardar notificações no aparelho para ler sem internet.
- Imagem no push.
- Notificações locais (lembretes agendados pelo próprio app).

## Pré-requisitos

- Fase 01: a fase 01 do site (rotas de leitura) publicada no backend que o app usa.
- Fase 02: a fase 02 do site (tokens e envio), as credenciais de push no EAS e um novo development build. Os passos das credenciais estão em [02-push.md](02-push.md#pré-requisitos).

## Fases

A ordem alterna com o site (tabela completa no README da iniciativa no site).

| Fase                                                     | Depende de      | Status   |
| -------------------------------------------------------- | --------------- | -------- |
| [01. Sino, lista e detalhe](01-notifications-screens.md) | site 01         | rascunho |
| [02. Push no aparelho](02-push.md)                       | site 02, app 01 | rascunho |

O contrato das rotas está em [architecture.md](architecture.md).
