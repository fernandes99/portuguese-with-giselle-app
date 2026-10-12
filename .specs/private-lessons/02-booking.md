# 02. Agendar e ver agendamentos

- **Status:** em andamento
- **Depende de:** `01-lesson-credits`; fase `02-calendly-booking` do site no ar

## Contexto

A fase 01 deixou o aluno comprando aulas e vendo o saldo, com o botão de agendar apagado. Esta fase liga o botão, mostra a próxima aula e entrega a tela de agendamentos, com a regra de 12 horas. Os contratos estão em `architecture.md`.

## Escopo

- "Agendar aula", liberado só com saldo.
- Cartão da próxima aula na tela principal.
- "Ver agendamentos" e a lista.
- Entrar na aula, remarcar, cancelar e enviar email.

## Fora do escopo

- Calendário e telas próprias de escolha de horário.
- Cancelar sem passar pela página do Calendly.
- Filtros e busca na lista.

## Requisitos

**Agendar**

- **RF-01:** Com saldo, "Agendar aula" é o botão principal da tela, na seção "Suas aulas" (com uma aula já agendada, o texto é "Agendar outra aula"). Tocar pede o link de agendamento ao backend, mostra o botão carregando e abre o endereço no navegador interno.
- **RF-02:** Sem saldo, o botão fica cinza, como o "Continuar" desabilitado da aula, e o toque não faz nada. O que falta está escrito no cartão de saldo, logo acima, onde "Comprar aulas" passa a ser o botão principal.
- **RF-03:** Se o backend responder `409`, a tela mostra "Você não tem aulas disponíveis." e recarrega o saldo. Outros erros mostram a mensagem recebida.
- **RF-04:** Quando o navegador interno fecha, a tela recarrega o resumo na hora e de novo depois de 3 e de 8 segundos, mantendo o conteúdo visível.
- **RF-05:** No fim da tela, numa caixa cinza com ícone de informação, o texto "Cada agendamento usa uma aula do saldo. Remarque ou cancele até 12 horas antes para não perder a aula.", com o número vindo de `changeNoticeHours`.

**Próxima aula**

- **RF-06:** Com `nextLesson`, a tela principal mostra o cartão "Próxima aula": o dia por extenso ("terça, 20 de outubro"), o horário ("14:00 – 14:50") e o título. Quando a aula é hoje ou amanhã, "Hoje" ou "Amanhã" no lugar do dia da semana; em andamento, o selo "Agora".
- **RF-07:** O cartão tem as ações da aula (RF-13 a RF-17).
- **RF-08:** Sem `nextLesson`, no lugar do cartão aparece uma caixa tracejada com "Você não tem nenhuma aula agendada.".
- **RF-08a:** A tela tem três blocos, nesta ordem: o cartão de saldo, com a compra; a seção "Suas aulas", com a próxima aula, o botão de agendar e "Ver agendamentos"; e a caixa com a regra.

**Ver agendamentos**

- **RF-09:** A linha "Ver agendamentos", com seta, abre `/practice/private-lessons/bookings`.
- **RF-10:** A tela tem o cabeçalho de voltar com o título "Agendamentos" e a lista na ordem recebida, separada em duas seções: "Agendadas" (`scheduled`) e "Anteriores" (`completed` e `canceled`). Seção vazia não aparece.
- **RF-11:** Cada item mostra dia, horário, título e a situação: "Agendada" (verde), "Realizada" (cinza) ou "Cancelada" (vermelho suave). Em cancelada, uma segunda linha: "Aula devolvida ao seu saldo." quando `creditReturned`, ou "Cancelada fora do prazo." quando não.
- **RF-12:** Sem agendamentos: "Você ainda não agendou nenhuma aula.". Carregando, o indicador verde; em erro, a mensagem e "Tentar de novo"; puxar recarrega.

**Ações da aula** (no cartão da próxima aula e nos itens "Agendadas")

- **RF-13:** "Entrar na aula" aparece quando há `joinUrl` e abre o endereço fora do app. Sem `joinUrl`: "O link da aula chega por email.".
- **RF-14:** "Remarcar" e "Cancelar" aparecem quando a aula pode ser alterada: `canChange` verdadeiro, os links vieram e, pelo relógio do aparelho, ainda faltam `changeNoticeHours` horas ou mais. Cada um abre a página do Calendly no navegador interno; ao fechar, a tela recarrega como no RF-04.
- **RF-15:** Antes de abrir a página de cancelamento, o app pede confirmação: "Cancelar esta aula?" e "A aula volta para o seu saldo.", com "Manter aula" e "Cancelar aula".
- **RF-16:** Aula futura que não pode mais ser alterada mostra "Faltam menos de 12 horas. Para remarcar ou cancelar, fale com a professora Giselle." e o botão "Enviar email". Aula em andamento não mostra o texto nem os botões de alterar.
- **RF-17:** "Enviar email" abre o aplicativo de email com o destinatário `contactEmail` e o assunto "Aula particular de {dia e horário}". Sem aplicativo de email, um alerta mostra o endereço.
- **RF-18:** O prazo é conferido de novo no toque: se venceu com a tela aberta, o toque não abre o Calendly, a tela recarrega e passa a mostrar o texto do RF-16.

**Acessibilidade**

- **RF-19:** Cada item lê o dia, o horário, o título e a situação; os botões leem a ação e o dia da aula ("Remarcar aula de terça, 20 de outubro").

## Critérios de aceite

- [ ] Sem saldo, "Agendar aula" está apagado e não abre nada.
- [ ] Com saldo, "Agendar aula" abre a agenda da professora com nome e email preenchidos.
- [ ] Depois de agendar e fechar o navegador, em até 10 segundos o saldo cai em 1 e a aula aparece como próxima aula, sem sair da tela.
- [ ] O dia e a hora mostrados batem com o email de confirmação do Calendly, no fuso do aparelho.
- [ ] "Entrar na aula" abre a sala do Google Meet.
- [ ] Cancelar uma aula a mais de 12 horas: depois de confirmar e fechar a página, o saldo sobe em 1 e a aula aparece em "Anteriores" como "Cancelada", com "Aula devolvida ao seu saldo.".
- [ ] Remarcar mantém o saldo, e a lista mostra só o novo horário.
- [ ] Numa aula a menos de 12 horas não há "Remarcar" nem "Cancelar", e "Enviar email" abre o email com o endereço da professora.
- [ ] Uma aula cujo horário já passou aparece em "Anteriores" como "Realizada".
- [ ] Com o saldo gasto por outro aparelho, tocar em "Agendar aula" mostra "Você não tem aulas disponíveis." e o saldo zerado.
- [ ] Em modo avião, as duas telas mostram o erro, e "Tentar de novo" funciona ao voltar a conexão.

## Desenho técnico

**Criar**

- `src/app/(app)/practice/private-lessons/bookings.tsx`: a lista, com `SectionList`.
- `src/components/privateLessons/NextLessonCard.tsx`, `BookingRow.tsx` e `LessonActions.tsx`.

**Alterar**

- `src/services/privateLessons.ts`: tipo `PrivateLessonBooking`; `createSchedulingLink(token)` e `getBookings(token)`.
- `src/utils/privateLessons.ts`: `formatLessonDate`, `formatLessonTime`, `isLessonNow` e `canChangeLesson`.
- `src/constants/config.ts`: `privateLessonsSchedulingLink` e `privateLessonsBookings` em `API_ROUTES`.
- `src/app/(app)/practice/private-lessons/index.tsx`: o botão de agendar ligado, o cartão da próxima aula e a linha "Ver agendamentos"; sai o "Em breve" da fase 01.
- `CLAUDE.md`: a tela de agendamentos e a regra de 12 horas.

**Notas**

- `LessonActions` recebe a aula, `changeNoticeHours`, `contactEmail` e uma função `onChanged`, que a tela usa para recarregar. É o mesmo componente no cartão e na lista.
- As recargas do RF-04 ficam no hook `src/hooks/useRefreshAfterBrowser.ts`: recarrega na hora e de novo com 3 e 8 segundos, cancela os temporizadores ao sair da tela e repete tudo quando o aplicativo volta à frente. Elas usam `reload`, que `useApiQuery` passou a expor, para recarregar sem o indicador de puxar.
- `Button` (`src/components/Button.tsx`) ganhou a variante `outline`, para a ação secundária ao lado de um botão principal, e a propriedade `accessibilityLabel`.
- A tela de agendamentos carrega o resumo junto da lista, para ter o prazo e o email de contato.
- Uma aula dentro do prazo cujos links não vieram do backend mostra a orientação de falar com a professora, sem a frase do prazo.
- No Android, `openBrowserAsync` pode resolver assim que o navegador abre; a recarga ao voltar ao foco do aplicativo (`AppState` passando a `active`) cobre esse caso.
- O link da sala e o email abrem com `Linking.openURL`; o assunto vai com `encodeURIComponent`. O endereço vem de `contactEmail`; nada de email escrito no código do app.
- A página de cancelamento do Calendly pede a confirmação dela também; a pergunta do RF-15 existe para avisar do saldo antes de sair do app.
- As datas são montadas à mão, com os métodos locais de `Date` (`getDate`, `getHours`), que já usam o fuso do aparelho, e listas de dias e meses em português. Sem `Intl`, para o texto ser igual em qualquer aparelho.
- O app não decide o saldo nem a situação: mostra o que o backend devolve. A única regra repetida no app é a do prazo, no toque.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com o backend no ar e o webhook do Calendly cadastrado: percorrer os critérios de aceite com uma conta de teste que tenha aulas compradas. Os agendamentos são reais, na agenda da professora: combine os horários de teste com ela e cancele tudo ao terminar.

## Tarefas

- [x] Rotas novas em `API_ROUTES` e funções em `src/services/privateLessons.ts`.
- [x] Funções de data e de prazo em `src/utils/privateLessons.ts`.
- [x] `LessonActions`, com entrar, remarcar, cancelar e enviar email.
- [x] "Agendar aula" ligado, com as recargas.
- [x] `NextLessonCard` na tela principal.
- [x] `BookingRow` e a tela de agendamentos.
- [x] Atualizar o `CLAUDE.md`.
- [ ] Conferir no aparelho.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
