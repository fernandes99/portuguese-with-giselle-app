# Specs

Entregas grandes começam por uma spec escrita aqui, antes do código. A spec é o que a pessoa (ou a IA) que vai implementar lê para saber o que fazer, onde e como conferir que ficou pronto.

A convenção é a mesma do site (`portuguese-with-giselle`, em `.specs/README.md` de lá). As duas pastas são independentes: cada spec fica no repositório do código que ela descreve.

## Organização

- Uma pasta por iniciativa, com nome em inglês e kebab-case: `.specs/<iniciativa>/`.
- `README.md` da iniciativa: contexto, objetivos, decisões, fora do escopo, pré-requisitos e a tabela de fases com o status de cada uma.
- `architecture.md` (opcional): o desenho técnico que mais de uma fase compartilha.
- Uma spec por fase, numerada na ordem de implementação: `01-<assunto>.md`, `02-<assunto>.md`. Cada fase tem o tamanho de uma entrega que dá para commitar e validar sozinha.

Iniciativas atuais:

| Iniciativa                                    | Assunto                                                                     |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| [guided-lesson](guided-lesson/)               | Aula em etapas, com parabéns e desbloqueio                                  |
| [practice-chat](practice-chat/)               | Aba Praticar e chat de texto com IA                                         |
| [practice-flashcards](practice-flashcards/)   | Flashcards do site na aba Praticar                                          |
| [study-progress](study-progress/)             | Dias de estudo, gráfico de 7 dias, sequência e conquistas na aba Progresso  |
| [achievements-history](achievements-history/) | Aviso de conquista com som e tela de histórico no Perfil                    |
| [private-lessons](private-lessons/)           | Aulas particulares na aba Praticar: saldo, compra, agendamento e lista      |
| [teacher-chat](teacher-chat/)                 | Chat do aluno assinante com a professora, aberto pelo Perfil                |
| [subscription-plans](subscription-plans/)     | Tela do plano Premium com a comparação e assinatura pelo Checkout do Stripe |

## Modelo de spec

```markdown
# NN. Título

- **Status:** rascunho | aprovada | em andamento | concluída
- **Depende de:** specs ou pré-requisitos

## Contexto

Por que esta fase existe e o que já está pronto antes dela.

## Escopo

O que entra.

## Fora do escopo

O que não entra, mesmo parecendo relacionado.

## Requisitos

- **RF-01:** uma frase, um comportamento.

## Critérios de aceite

- [ ] Verificável por alguém que não escreveu o código.

## Desenho técnico

Arquivos a criar e a alterar, com caminho, e o que reutilizar do que já existe.

## Verificação

Comandos e passos manuais para conferir a entrega.

## Tarefas

- [ ] Passos de implementação, na ordem.

## Dúvidas em aberto

Só quando houver. Sem dúvidas, a seção não existe.
```

## Regras

- **A spec é a fonte da verdade.** Leia o `README.md` da iniciativa, o `architecture.md` e a spec da fase antes de implementar. Se a implementação precisar divergir, atualize a spec no mesmo commit e diga o motivo.
- **Cada spec se explica sozinha.** Quem lê não tem o histórico da conversa em que ela nasceu. Cite arquivos pelo caminho e escreva as decisões com o motivo.
- **Nada implícito.** O que não foi decidido vai em "Dúvidas em aberto" e é resolvido com quem pediu antes de virar código. Não invente requisito para fechar lacuna.
- **Requisitos numerados e critérios verificáveis.** "A tela abre rápido" não serve; "a barra avança uma unidade a cada Continuar" serve.
- **Uma fase por vez.** Implemente, valide com `yarn lint`, `yarn tsc --noEmit` e `npx expo-doctor`, marque as tarefas e mude o status da spec e da tabela da iniciativa para `concluída` no mesmo commit.
- **O app não tem testes automatizados.** A verificação de cada fase inclui passos manuais no aparelho; quem implementa diz quais foram feitos e quais ficaram para o dono do projeto.
- **Sem segredos.** Nada de valores de `.env`, chaves ou dados reais de alunos nas specs.
- Specs são escritas em português. Commits que só mexem em specs usam o prefixo `chore`.
