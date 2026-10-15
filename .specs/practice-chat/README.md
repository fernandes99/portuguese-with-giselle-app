# Chat de prática com IA

Aba nova, "Praticar", com a opção "Chat com IA": um chat de texto com a Professora Gisa (persona de IA), que corrige cada frase do aluno e continua a conversa com uma nova pergunta.

## Contexto

O app ensina por aulas e atividades (abas Aprender e Cursos), mas o aluno não tem onde praticar conversa. Esta iniciativa cria o primeiro recurso de prática livre.

A IA não é chamada pelo app. O chat usa uma rota do backend, descrita no repositório do site (`portuguese-with-giselle`, em `.specs/practice-chat/` de lá).

## Quem usa

O aluno assinante. O aluno gratuito vê a aba, com a opção trancada.

## Objetivos

1. O aluno abre o chat e já encontra uma pergunta da Gisa para responder.
2. Cada frase enviada volta corrigida, com o erro visível e explicado.
3. A conversa não morre: toda resposta da Gisa traz uma nova pergunta.
4. A aba Praticar fica pronta para receber outras formas de prática depois.

## Como funciona

1. A aba Praticar lista as formas de prática. Por enquanto, só "Chat com IA".
2. O chat abre com uma mensagem fixa da Gisa, escrita no app: "Olá, {nome}! Sou a Professora Gisa, e vamos usar esse chat para conversar e treinar seu Português. Me fala, {nome}, no que você trabalha ou estuda?"
3. O aluno responde. O app envia a conversa ao backend, que devolve a correção da frase e a resposta da Gisa.
4. Sob o balão do aluno aparece o cartão de correção; em seguida, o balão da Gisa com a próxima pergunta. E assim por diante.

## Decisões

Tomadas com o dono do projeto:

| Decisão                                                                                   | Motivo                                                                |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Só texto; sem voz nem áudio                                                               | Primeira versão; a voz vem depois                                     |
| Só assinantes (role diferente de `FREE_STUDENT`)                                          | A versão gratuita e limitada será desenhada depois                    |
| A aba Praticar entra no lugar da aba Cursos; a lista de cursos abre por um link no Perfil | A aba Aprender já é o caminho principal até as aulas                  |
| O link de cursos no Perfil é simples                                                      | A tela de Perfil será revista depois                                  |
| Abertura única e fixa, escrita no app                                                     | Aberturas variadas e por interesse do aluno dependem de cadastro novo |
| A conversa não é salva: vive na tela e some ao sair                                       | Sem tabela nova nesta versão                                          |
| A correção aparece num cartão sob a mensagem do aluno, com os trechos errados grifados    | Separa o que é correção do que é conversa                             |
| A conversa é em português e a explicação do erro é em inglês                              | O aluno é estrangeiro e precisa entender por que errou                |
| Nomes na interface: "Praticar", "Chat com IA" e "Professora Gisa"                         | O app é todo em português                                             |
| Sem limite de uso nem de tamanho de mensagem                                              | Os limites serão definidos depois                                     |

Da fase 03 em diante, também com o dono do projeto (o detalhe está em `.specs/practice-chat/` do site):

| Decisão                                                                                                                                     | Motivo                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| A abertura passa a ser gerada pelo backend, sobre um dos temas ou o objetivo do aluno e no nível dele; substitui a decisão da abertura fixa | Varia a cada conversa e parte do que o aluno gosta                   |
| A Gisa fala e corrige no nível do aluno, de A0 a C2                                                                                         | Pedido direto; é feito no backend, sem mudança no app                |
| A Gisa deixa de ser "Professora Gisa" e passa a "Gisa, sua parceira de conversação com IA"                                                  | Deixar claro para o aluno que ele conversa com uma IA                |
| O aluno escolhe o estilo da Gisa (Amigável, Tutora, Brasileira ou Tranquila) na primeira vez no chat e troca pelo chat ou pelo Perfil       | Pedido direto; o tom muda no backend                                 |
| A explicação do erro e a tradução saem no idioma nativo do aluno (espanhol ou inglês); substitui a decisão da explicação em inglês          | O aluno entende melhor a regra no próprio idioma; é feito no backend |

Tomadas no planejamento (corrigíveis; ao mudar uma, atualize aqui e nas specs afetadas):

| Decisão                                                                               | Motivo                                                                      |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| O aluno gratuito vê a aba, com a opção trancada e o texto "Exclusivo para assinantes" | Esconder a aba mudaria a navegação conforme a conta; o backend também barra |
| O app reenvia a conversa inteira a cada turno                                         | O backend não guarda estado                                                 |
| Sem streaming: enquanto espera, a tela mostra que a Gisa está digitando               | O cliente HTTP do app (`src/lib/api.ts`) trabalha com JSON                  |
| Se o envio falhar, a mensagem do aluno fica na tela com "Tentar de novo"              | O aluno não perde o que escreveu                                            |
| Sair do chat não pede confirmação                                                     | Não há progresso a perder além da conversa, e recomeçar é imediato          |
| Nenhuma biblioteca nova                                                               | Não exige novo development build                                            |
| Se a rota da abertura falhar, entra a abertura fixa, sem aviso de erro                | O aluno não fica preso numa tela vazia por causa da primeira mensagem       |

## Fora do escopo

- Voz, áudio e avaliação de pronúncia.
- Versão gratuita limitada e limites de uso.
- Salvar ou retomar conversas.
- Outras formas de prática na aba.
- Redesenho da tela de Perfil.
- Compra de assinatura pelo app.

## Pré-requisitos

- A rota `POST /api/mobile/practice/chat` no ar (fase `01-chat-api` do site) para a fase 02. A fase 01 daqui não depende dela.

## Fases

| Fase                                                  | Entrega                                                       | Status       |
| ----------------------------------------------------- | ------------------------------------------------------------- | ------------ |
| [01-practice-tab](01-practice-tab.md)                 | Aba Praticar, Cursos fora das abas e link no Perfil           | em andamento |
| [02-chat-screen](02-chat-screen.md)                   | Tela do chat com a Gisa, cartão de correção e estados de erro | em andamento |
| [03-personalized-opening](03-personalized-opening.md) | Abertura gerada pelo backend, com a fixa de reserva           | em andamento |
| [04-chat-style](04-chat-style.md)                     | Gisa como IA e escolha do estilo da conversa                  | em andamento |

O desenho compartilhado está em [architecture.md](architecture.md).

## Glossário

- **Gisa:** a parceira de conversação com IA do chat. Até a fase 03, chamada de "Professora Gisa".
- **Abertura:** a primeira mensagem da Gisa. Vem do backend (fase 03); a fixa, escrita no app, é a reserva.
- **Turno:** uma mensagem do aluno e a resposta da Gisa a ela.
- **Assinante:** usuário com role diferente de `FREE_STUDENT`.
