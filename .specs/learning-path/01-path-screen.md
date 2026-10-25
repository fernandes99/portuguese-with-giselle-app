# 01. Trilha na aba Início

- **Status:** concluída
- **Depende de:** fase 02 da trilha no site (`.specs/learning-path/02-path-service.md` de lá), com `pathLevel`, `recommended` e `isFree` na rota de cursos

## Contexto

A aba Início já mostra o caminho de um curso e escolhe qual abrir por `getDefaultCourse` (`src/utils/learn.ts`): o curso começado e não concluído ou, sem ele, o primeiro da lista. Com a trilha, o curso aberto primeiro deve ser o do nível do aluno, e o plano gratuito passa a abrir as lições grátis. O contexto está no `README.md` desta iniciativa.

## Escopo

- Os campos novos nos tipos do app.
- A escolha do curso aberto primeiro.
- O selo "Premium" no caminho e o texto do cadeado da aula, para o plano gratuito.

## Fora do escopo

- O que está no `README.md` desta iniciativa, em "Fora do escopo".

## Requisitos

- **RF-01:** `Course` (`src/services/courses.ts`) tem `pathLevel` e `recommended`; a aula do esboço (`OutlineLesson`, `src/services/lesson.ts`) tem `isFree`.
- **RF-02:** `getDefaultCourse` devolve o curso começado e não concluído; sem ele, o curso com `recommended`; sem ele, o primeiro da lista.
- **RF-03:** para o aluno do plano gratuito (`role` `FREE_STUDENT`), cada lição com `isFree` falso mostra o selo "Premium" no nó do caminho, junto da situação (atual, concluída ou trancada), e a leitura de tela diz "do plano Premium".
- **RF-04:** para o Premium, a professora e o admin, nenhum selo aparece.
- **RF-05:** o cadeado da aula (`PremiumLock`, na tela `src/app/(app)/lesson/[courseSlug]/[lessonSlug].tsx`) diz: "Esta lição faz parte do plano Premium. O 1º módulo de cada nível é grátis."
- **RF-06:** a sequência do caminho não muda: o plano gratuito, ao concluir o 1º módulo, vê a lição seguinte como atual, com o selo, e ao tocá-la chega ao cadeado.

## Critérios de aceite

- [ ] Um aluno A1 sem cursos começados abre a aba Início na trilha A1; um B2, na trilha A2; depois de começar a trilha A0, abre na A0.
- [ ] Um aluno do plano gratuito vê o selo nas lições do 2º módulo em diante, abre e conclui as do 1º e chega ao cadeado com o texto novo ao tocar a primeira do 2º.
- [ ] Um aluno Premium não vê selo nenhum.
- [x] `npx tsc --noEmit` e o lint do app passam.

Conferência: o typecheck e o lint passam. O teste no aparelho fica para o piloto da trilha (fase 05 do site), com as lições do 1º módulo publicadas. Não exige build novo.

## Desenho técnico

Decisões da implementação: o selo é o `PremiumBadge` que o app já tem (`src/components/premium/PremiumBadge.tsx`, com a coroa do Perfil), acima do título da aula no nó do caminho; o `LearnModule` recebe `isFreePlan` da tela, que lê a `role` pelo `useAuth`. O campo `pathLevel` é o nível mínimo para fazer o curso (no Dato, "Nível mínimo"); o app só o recebe, e quem escolhe o curso recomendado é o backend.

- `src/services/courses.ts` e `src/services/lesson.ts`: os campos novos.
- `src/utils/learn.ts`: `getDefaultCourse`.
- `src/components/learn/LessonNode.tsx`: o selo, que recebe se o aluno é do plano gratuito (a `role` vem do `AuthContext`, `src/contexts/AuthContext.tsx`).
- `src/app/(app)/lesson/[courseSlug]/[lessonSlug].tsx`: o texto do cadeado.

## Verificação

- No aparelho, com alunos de teste do site (um Premium e um do plano gratuito, com níveis diferentes), conferir cada critério.
- `npx tsc --noEmit` e o lint do app.

## Tarefas

- [x] Campos novos nos tipos.
- [x] Curso aberto primeiro pelo `recommended`.
- [x] Selo "Premium" no caminho para o plano gratuito.
- [x] Texto do cadeado da aula.
- [ ] Conferir no aparelho (no piloto da trilha).
- [x] Marcar a fase como concluída aqui e no `README.md`.
