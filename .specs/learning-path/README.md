# Trilha de aprendizado

A trilha de lições curtas, sem vídeo, de A0 a A2, na aba Início, para o pré-lançamento sem as aulas gravadas pela professora. A trilha é feita no backend (`.specs/learning-path/` do repositório do site): lá estão o roteiro, os campos no Dato, as regras e o conteúdo. O app só mostra.

## Contexto

- Cada nível da trilha é um curso comum do Dato (`trilha-a0`, `trilha-a1`, `trilha-a2`), e a aba Início já mostra cada curso como um caminho em degraus, com o seletor de curso (`src/app/(app)/(tabs)/index.tsx`, `src/utils/learn.ts`). As lições sem vídeo já funcionam no fluxo guiado da aula.
- O backend já filtra as lições pelo objetivo do aluno: o app recebe só as que ele vê.
- `GET /api/mobile/courses` passa a trazer, em cada curso, `pathLevel` (o nível mínimo para fazer o curso, de `A0` a `C2`, ou `null`) e `recommended` (o curso do nível do aluno; no máximo um), e, em cada aula do esboço, `isFree`.
- O plano gratuito passa a abrir as aulas com `isFree`; nas outras, a rota da aula continua respondendo 403, e o app mostra o cadeado do Premium (`PremiumLock`).

## Decisões

Tomadas com o dono do projeto:

| Decisão                                          | Motivo        |
| ------------------------------------------------ | ------------- |
| A trilha entra no app como cursos, na aba Início | Pedido direto |
| O plano gratuito abre o 1º módulo de cada nível  | Pedido direto |

Tomadas no planejamento (corrigíveis):

| Decisão                                                                                           | Motivo                                                                      |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| A aba Início abre o curso em andamento e, sem ele, o recomendado; sem nenhum dos dois, o primeiro | O aluno começa no nível que escolheu nas boas-vindas                        |
| No plano gratuito, as lições que não são grátis levam um selo "Premium" no caminho                | O aluno sabe antes de tocar o que é do plano                                |
| O texto do cadeado da aula passa a dizer que o 1º módulo de cada nível é grátis                   | O texto de hoje diz que todas as aulas são do Premium, o que deixa de valer |

## Fora do escopo

- Aviso de "sua trilha chega em breve" para quem é B1 ou acima.
- Mudar o desenho do caminho, do seletor de curso ou da aula.

## Fases

| Fase                                | Entrega                                              | Status    |
| ----------------------------------- | ---------------------------------------------------- | --------- |
| [01-path-screen](01-path-screen.md) | Curso recomendado, selo do Premium e cadeado da aula | concluída |
