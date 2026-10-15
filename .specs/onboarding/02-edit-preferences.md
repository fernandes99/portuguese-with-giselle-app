# 02. Edição pelo Perfil

- **Status:** rascunho
- **Depende de:** [01](01-onboarding-flow.md)

## Contexto

Depois do fluxo de boas-vindas, o aluno não tem como mudar as respostas, e o nível muda com o tempo. Esta fase abre as mesmas telas pelo Perfil, já preenchidas.

## Escopo

- Linha "Minhas preferências" no Perfil.
- Rota `/preferences` com o `PreferencesFlow` em modo de edição.

## Fora do escopo

- Uma tela de resumo com as respostas.
- Mudar uma resposta só sem passar pelos três passos.

## Requisitos

- **RF-01:** o Perfil tem a linha "Minhas preferências" (ícone `options-outline`), no estilo das outras, logo abaixo de "Pagamentos", que abre `/preferences`.
- **RF-02:** `/preferences` mostra o `PreferencesFlow` com `mode: 'edit'`: as opções vêm marcadas com as respostas do `GET`, o balão do passo 1 não tem a saudação e o botão final é "Salvar".
- **RF-03:** no passo 1, o "X" do topo fecha a tela sem gravar e sem perguntar; nos passos 2 e 3, a seta volta um passo.
- **RF-04:** "Salvar" envia `PUT /api/mobile/preferences`; com `200`, volta ao Perfil; com erro, a mensagem aparece acima do botão e as escolhas ficam.
- **RF-05:** se um tema gravado saiu da lista, ele não vem marcado, e o aluno precisa completar os 3 antes de salvar.

## Critérios de aceite

- [ ] Do Perfil, "Minhas preferências" abre o passo 1 com o nível marcado.
- [ ] Trocar o objetivo e um tema e salvar volta ao Perfil; abrir de novo mostra as respostas novas.
- [ ] O "X" no passo 1 volta ao Perfil sem gravar.
- [ ] Sem rede, "Salvar" mostra o erro e mantém as escolhas.
- [ ] `yarn lint` sem avisos novos e `yarn tsc --noEmit` passam.

## Desenho técnico

Criar:

- `src/app/(app)/preferences.tsx`.

Alterar:

- `src/app/(app)/(tabs)/profile.tsx`: a linha "Minhas preferências".
- `src/components/preferences/PreferencesFlow.tsx`, se o modo de edição não tiver ficado pronto na fase 01.

## Verificação

1. `yarn lint`, `yarn tsc --noEmit`.
2. No emulador, com o backend local e uma conta de teste que já respondeu: os critérios acima.

## Tarefas

- [ ] Rota `/preferences`.
- [ ] Linha no Perfil.
