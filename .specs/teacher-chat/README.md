# Chat com a professora

Tela em que o aluno assinante troca mensagens de texto com a professora Giselle. Abre pelo Perfil.

## Contexto

O app tem um chat com IA (`src/app/(app)/practice/chat.tsx`, a "Professora Gisa"), mas nenhum canal com a professora de verdade: hoje o contato é por email. A professora lê e responde pelo painel dela no site.

O app só conversa com o backend. As tabelas, as rotas e o painel estão descritos no repositório do site (`portuguese-with-giselle`, em `.specs/teacher-chat/` de lá).

## Quem usa

Qualquer conta que não seja de aluno gratuito: os assinantes (`PREMIUM_STUDENT`) e as contas `TEACHER` e `ADMIN`. O aluno gratuito abre a tela e vê só o aviso de que o chat é para assinantes.

## Objetivos

1. O aluno assinante escreve para a professora e lê as respostas.
2. Cada mensagem mostra o horário, e o aluno sabe quando a dele foi enviada.
3. Sem notificação, o aluno ainda percebe que a professora respondeu: um contador no Perfil.

## Como funciona

1. Perfil > "Falar com a professora" abre a conversa. Se há resposta não lida, a linha mostra a quantidade, e a aba Perfil mostra um marcador.
2. A tela mostra as mensagens, as do aluno à direita e as da professora à esquerda, com o horário.
3. O aluno escreve e envia. A mensagem aparece na hora com "Enviando...", e depois com o horário e "Enviada".
4. Com a tela aberta, o app busca mensagens novas a cada 30 segundos. Puxar a lista para baixo busca na hora.
5. O aluno gratuito vê o cadeado e "Exclusivo para assinantes", sem campo de mensagem.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                                                                | Motivo                                              |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| O chat abre pelo Perfil e por um botão flutuante na aba Aprender, com a foto da professora e "Precisa de ajuda? Fale com a professora" | Pedido direto                                       |
| O botão flutuante só aparece depois da terceira aula concluída                                                                         | Pedido direto                                       |
| Aluno gratuito abre a tela e vê o aviso de que é só para assinantes                                                                    | Pedido direto                                       |
| Cada mensagem mostra o horário e a situação do envio; há contador de não lidas                                                         | Não haverá notificação nesta versão                 |
| Sem notificação                                                                                                                        | Pedido direto: nada complexo neste primeiro momento |
| Mensagens novas a cada 30 segundos com a tela aberta, e ao puxar para atualizar                                                        | Pedido direto                                       |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e na spec da fase):

| Decisão                                                                                                                                          | Motivo                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| O título da tela é "Professora Giselle", com a foto dela no cabeçalho e ao lado das falas                                                        | Para o aluno, quem responde é sempre ela                                                               |
| A conversa vem do backend a cada abertura; o app não guarda mensagens no aparelho                                                                | Uma fonte só; trocar de aparelho não muda nada                                                         |
| A mensagem enviada aparece antes da resposta do backend, com "Enviando..."                                                                       | O aluno vê o que escreveu na hora                                                                      |
| Mensagem que falha fica na tela com "Tentar de novo"                                                                                             | O texto não se perde                                                                                   |
| A mensagem não mostra "lida"                                                                                                                     | Não foi pedido                                                                                         |
| A linha do Perfil aparece para todos; o bloqueio é dentro da tela                                                                                | Foi o pedido: o gratuito abre e vê o aviso                                                             |
| O contador de não lidas e a liberação do botão são buscados ao entrar nas abas, ao voltar ao app e quando a aba Aprender ou o Perfil ganham foco | Sem notificação, é o que avisa da resposta; e o botão aparece na volta da terceira aula                |
| Quem decide se o botão aparece é o backend (`available`)                                                                                         | Mudar a regra não exige nova versão do app. Quem já tem conversa vê o botão mesmo com menos de 3 aulas |
| Só `FREE_STUDENT` vê o bloqueio; `TEACHER` e `ADMIN` usam o chat como um assinante                                                               | Pedido do dono do projeto: o admin precisa conseguir falar com a professora                            |
| Componentes próprios em `src/components/teacherChat/`, sem mexer nos do chat com IA                                                              | Os balões da Gisa carregam correção e tradução, que aqui não existem                                   |
| Nenhuma dependência nova                                                                                                                         | Não exige novo build por causa de biblioteca                                                           |

## Fora do escopo

- Notificações e som.
- Anexos, áudio e imagens.
- Editar ou apagar mensagem.
- "Digitando" e "lida".
- Guardar a conversa no aparelho para ler sem internet.
- Trocar o email de contato das aulas particulares pelo chat.
- Chat no site, do lado do aluno.

## Contrato das rotas

Espelho do contrato em `.specs/teacher-chat/README.md` do site; ao mudar um, mude o outro. Todas com o token da sessão. Erros como `{ "error": string }`; o `401` encerra o login pelo `api`.

`GET /api/mobile/teacher-chat`

```json
{
  "messages": [
    {
      "id": "ckx...",
      "content": "Oi, professora! Tenho uma dúvida.",
      "createdAt": "2026-10-20T17:00:00.000Z",
      "fromTeacher": false
    }
  ],
  "hasMore": false,
  "maxLength": 2000
}
```

- As 50 mensagens mais recentes, em ordem crescente de data. Sem conversa, `messages` vazio.
- `?before=<id>` devolve as 50 anteriores àquela mensagem; `hasMore` diz se há mais antigas.
- Sem `before`, a chamada marca a conversa como lida pelo aluno.
- `403` para a role `FREE_STUDENT`.

`POST /api/mobile/teacher-chat`, com `{ "content": "..." }`. Responde `201` com `{ "message": { ... } }`. `400` para mensagem vazia ou acima de `maxLength`; `403` para `FREE_STUDENT`.

`GET /api/mobile/teacher-chat/unread`. Responde `{ "unread": 2, "available": true }`; para `FREE_STUDENT`, `unread` é sempre `0`. `available` diz se o botão flutuante aparece.

## Pré-requisitos

- Fase `01-chat-api` do site no ar.
- Para a professora responder, a fase `02-teacher-panel` do site.

## Fases

| Fase                                | Entrega                                                     | Status       |
| ----------------------------------- | ----------------------------------------------------------- | ------------ |
| [01-chat-screen](01-chat-screen.md) | Entrada no Perfil, tela da conversa e contador de não lidas | em andamento |

## Glossário

- **Assinante:** aluno com role `PREMIUM_STUDENT`.
- **Não lida:** mensagem da professora mais nova que a última vez em que o aluno abriu a conversa.
