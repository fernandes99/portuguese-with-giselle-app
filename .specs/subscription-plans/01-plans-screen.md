# 01. Botão no Perfil e tela de planos

- **Status:** em andamento
- **Depende de:** fase `01-plans-api` do site no ar

## Contexto

O app não tem tela de venda. Esta fase cria a entrada no Perfil e a tela que apresenta os planos e a comparação, com os dados de `GET /api/mobile/plans`. O contrato está no [README.md](README.md). O botão de assinar só passa a abrir o pagamento na fase 02.

## Escopo

- Botão "Seja Premium" no Perfil.
- Tela `/plans`: chamada de venda, cartões dos planos pagos, tabela de comparação e rodapé com o botão de assinar.
- Estados de carregamento, erro, conta que já é Básico e conta que já tem tudo.

## Fora do escopo

- Abrir o Checkout e conferir a compra (fase 02).
- Trocar os avisos de "exclusivo para assinantes" das outras telas por um link para cá.

## Requisitos

**Entrada**

- **RF-01:** O Perfil mostra, acima de "Falar com a professora", o botão "Seja Premium" com o ícone de coroa, em destaque (fundo verde, texto branco). Ele abre `/plans`.
- **RF-02:** O botão aparece para as roles `FREE_STUDENT` e `BASIC_STUDENT` e não aparece para as outras.

**Tela**

- **RF-03:** `/plans` é uma tela cheia, fora das abas, com um X no canto superior direito que volta para a tela anterior.
- **RF-04:** No alto, um bloco verde com a coroa, o título "Fale português com confiança" e o subtítulo "Aulas completas, prática todos os dias e a professora Giselle ao seu lado."
- **RF-05:** Abaixo, um cartão para cada plano pago recebido, na ordem do backend, com `name`, `tagline` e o preço formatado (`US$ 49,90` e `/mês`; `/ano` quando `interval` é `year`).
- **RF-06:** O plano com `highlighted` verdadeiro leva a etiqueta "Mais completo", borda verde e vem escolhido quando a tela abre. Sem plano destacado, vem escolhido o último.
- **RF-07:** Tocar num cartão escolhe o plano; só um fica escolhido, marcado por um círculo preenchido. Os cartões são anunciados como opções de escolha única para leitores de tela.
- **RF-08:** A seção "Compare os planos" mostra uma tabela com uma linha por item de `benefits`, na ordem recebida, e uma coluna por plano recebido (inclusive o gratuito), com o `name` no cabeçalho.
- **RF-09:** Cada célula mostra um visto verde quando o nível está em `tiers` do benefício e um traço cinza quando não está. Visto e traço têm texto para leitor de tela ("incluído" e "não incluído").
- **RF-10:** A coluna do plano escolhido fica com fundo verde claro, do cabeçalho à última linha.
- **RF-11:** O rodapé fica preso embaixo da tela, fora da rolagem, com o botão "Assinar o " seguido do `name` do plano escolhido e, abaixo, "Pagamento seguro pelo Stripe. Cancele quando quiser."
- **RF-12:** (Não implementado.) O aviso "A assinatura pelo app chega em breve." existiria só entre as duas fases; como elas foram escritas juntas, o botão já abre o pagamento (fase 02).

**Outras contas**

- **RF-13:** Com `currentTier` igual a `basic`, o cartão do Básico leva a etiqueta "Seu plano" e não pode ser escolhido; o Premium vem escolhido. O rodapé troca o botão por "Para mudar para o Premium, fale com a professora." e o botão "Falar com a professora", que abre `/teacher-chat`.
- **RF-14:** Com `currentTier` igual a `premium`, o cartão do Premium leva "Seu plano", nenhum cartão pode ser escolhido e o rodapé mostra só "Você já tem o plano mais completo."
- **RF-15:** Se a resposta não trouxer nenhum plano pago, a tela mostra a comparação e, no lugar dos cartões e do botão, "Os planos não estão disponíveis no momento."

**Carregamento e erro**

- **RF-16:** Enquanto carrega, a tela mostra o bloco do alto e um indicador de carregamento no lugar do resto.
- **RF-17:** Falha na busca mostra a mensagem do backend (ou "Erro ao carregar os planos.") com "Tentar de novo"; o X continua funcionando.

**Geral**

- **RF-18:** Os textos são em português. Nenhum cartão ou painel usa sombra pequena: a separação é por borda.
- **RF-19:** A tela rola inteira em aparelhos pequenos, e o conteúdo não fica escondido atrás do rodapé fixo.

## Critérios de aceite

- [ ] Conta gratuita vê "Seja Premium" no Perfil; conta Premium, professora ou admin não vê.
- [ ] A tela mostra dois cartões pagos com os preços do Stripe, o Premium escolhido e com "Mais completo".
- [ ] Trocar de cartão muda a coluna destacada na tabela e o texto do botão do rodapé.
- [ ] A tabela tem as sete linhas da lista do backend, com vistos e traços iguais aos da tabela do README do site.
- [ ] Conta Básico vê "Seu plano" no Básico e o botão "Falar com a professora", que abre o chat.
- [ ] Sem internet, a tela mostra o erro e "Tentar de novo" recarrega quando a internet volta.
- [ ] Num aparelho pequeno, a última linha da tabela aparece acima do rodapé ao rolar até o fim.
- [ ] O X fecha a tela e volta para o Perfil.

## Desenho técnico

**Criar**

- `src/services/plans.ts`: os tipos do contrato (`PlanTier`, `Plan`, `PlanBenefit`, `PlansResponse`) e `getPlans(token)`.
- `src/utils/plans.ts`: `formatPlanPrice(price)`, `formatPlanInterval(interval)`, `getPaidPlans(plans)`, `getDefaultPlan(plans, currentTier)` e `canSeePlans(user)`.
- `src/components/plans/`:
  - `PlansHero.tsx`: o bloco verde do alto.
  - `PlanCard.tsx`: um plano pago, com os estados escolhido, destacado e "Seu plano".
  - `PlanComparison.tsx`: a tabela de benefícios.
  - `PlansFooter.tsx`: o rodapé fixo, nos três casos (assinar, falar com a professora, já tem tudo).
- `src/app/(app)/plans/index.tsx`: a tela.

**Alterar**

- `src/app/(app)/(tabs)/profile.tsx`: o botão "Seja Premium".
- `src/constants/config.ts`: `plans` em `API_ROUTES`.
- `CLAUDE.md` e `.specs/README.md`: a iniciativa.

**Notas**

- A busca usa `useApiQuery` (`src/hooks/useApiQuery.ts`), como as outras telas.
- A coroa é o ícone `crown` de `MaterialCommunityIcons`, de `@expo/vector-icons`; o `Ionicons` usado no resto do app não tem coroa.
- O preço usa a mesma formatação de `formatPrice`, em `src/utils/privateLessons.ts`; se a função servir como está, é reutilizada.
- A tabela é feita com `View` em linhas, com a primeira coluna flexível e as colunas dos planos de largura fixa, para os vistos ficarem alinhados em qualquer largura de tela.
- A tela fica em `src/app/(app)/plans/` porque a fase 02 acrescenta `result.tsx` na mesma pasta, que é para onde o endereço `pwg://plans/result` leva.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho, com uma conta gratuita, uma Básico e uma da equipe: percorrer os critérios de aceite. Quem implementa diz quais passos fez e quais ficaram para o dono do projeto.

## O que foi conferido

`yarn lint` e `yarn tsc --noEmit` passam. Nenhum critério de aceite foi conferido no aparelho: a tela ainda não foi vista rodando. Fica tudo para o teste do dono do projeto.

Os tipos de rota do Expo (`.expo/types/router.d.ts`) só passam a conhecer `/plans` depois de o `expo start` ser reiniciado.

## Tarefas

- [x] Serviço, tipos e funções de formatação.
- [x] `PlansHero`, `PlanCard`, `PlanComparison` e `PlansFooter`.
- [x] Tela `/plans` com os estados.
- [x] Botão no Perfil.
- [x] `config.ts`, `CLAUDE.md` e `.specs/README.md`.
- [ ] Percorrer os critérios de aceite no aparelho.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
