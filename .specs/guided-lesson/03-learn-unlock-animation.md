# 03. Desbloqueio animado no Aprender

- **Status:** em andamento
- **Depende de:** [02-congratulations](02-congratulations.md)

## Contexto

Ao fim da fase 02, o parabéns leva o aluno à aba Aprender com os parâmetros `course` e `completed`, mas a aba ainda os ignora: ela recarrega os cursos e mostra o caminho já no estado novo, sem transição. Esta fase faz a aba mostrar o avanço acontecendo.

Na aba Aprender, cada aula tem um de três estados, calculados em `src/utils/learn.ts`: `completed`, `current` (a primeira não concluída do curso) e `locked` (todas as que vêm depois dela).

## Escopo

- A aba Aprender lê `course` e `completed`, seleciona o curso e rola até a aula.
- Animação de conclusão na aula feita e de desbloqueio na seguinte.
- Limpeza dos parâmetros depois de usados.

## Fora do escopo

- Mudar a regra de bloqueio em sequência.
- Animar a barra de progresso do curso, os contadores do módulo ou a troca de módulo.
- Som nesta tela.

## Requisitos

- **RF-01:** Com o parâmetro `course`, a aba seleciona esse curso, mesmo que outro estivesse selecionado.
- **RF-02:** Com o parâmetro `completed`, depois de os cursos recarregarem, a aba rola até a aula com esse id, deixando-a visível com a aula seguinte.
- **RF-03:** A animação só acontece quando, nos dados recarregados, a aula de `completed` está no estado `completed` **e** a aula seguinte do curso está no estado `current`. Isso é o caso normal: o aluno concluiu a aula atual do caminho.
- **RF-04:** A animação, em ordem: o círculo da aula concluída passa de "atual" (borda verde, número) para "concluída" (verde cheio, check), com um leve aumento e retorno de escala; a linha até a próxima aula se preenche de verde de cima para baixo; o círculo da próxima aula passa de "trancada" (cinza, cadeado) para "atual" (borda verde, número), também com um leve aumento e retorno. A sequência toda dura entre 1 e 2 segundos.
- **RF-05:** Quando a aula concluída é a última do módulo, não há linha para preencher; a animação pula essa parte e destranca a primeira aula do módulo seguinte.
- **RF-06:** Quando a aula concluída é a última do curso, só a primeira parte da animação acontece.
- **RF-07:** Quando a condição do RF-03 não vale (aula feita fora de ordem pela aba Cursos, que continua trancada no caminho; id que não existe no curso), a aba só seleciona o curso e rola até a aula, se ela existir, sem animar.
- **RF-08:** Com "reduzir movimento" ligado no sistema, a aba mostra o estado final direto, sem animação.
- **RF-09:** Depois de usados, os parâmetros são limpos. Sair da aba e voltar, ou puxar para atualizar, não repete a animação.
- **RF-10:** Durante a animação os toques continuam funcionando; tocar na próxima aula enquanto ela destranca abre a aula.
- **RF-11:** Abrir a aba sem parâmetros se comporta exatamente como antes desta fase.

## Critérios de aceite

- [ ] Concluir a aula atual pelo fluxo guiado e tocar em "Continuar" no parabéns mostra, no Aprender, a aula virando concluída e a próxima destrancando.
- [ ] Concluir a última aula de um módulo destranca a primeira do módulo seguinte, com a tela rolada de forma que as duas apareçam ou, não cabendo, a que acabou de ser concluída.
- [ ] Concluir a última aula do curso anima só a conclusão.
- [ ] Trocar de aba e voltar ao Aprender não repete a animação.
- [ ] Concluir pelo fluxo guiado uma aula aberta pela aba Cursos, que no caminho está trancada, leva ao Aprender no curso certo, sem animação e sem erro.
- [ ] Com outro curso selecionado no Aprender antes de abrir a aula, a volta mostra o curso da aula concluída.
- [ ] Com "reduzir movimento" ligado, o caminho aparece no estado final, sem animação.
- [ ] Abrir o Aprender pelo menu de abas continua rolando até a aula atual, como antes.

## Desenho técnico

**Alterar**

- `src/app/(app)/(tabs)/learn.tsx`: lê `course` e `completed` com `useLocalSearchParams`. `course` entra em `selectedSlug`. A rolagem inicial, que hoje vai até a aula `current`, passa a ir até a aula de `completed` quando o parâmetro existe. Depois de disparar a animação (ou de decidir que ela não se aplica), chama `router.setParams` para limpar os dois.
- `src/utils/learn.ts`: função pura nova que recebe o caminho (`PathModule[]`) e o id concluído e devolve `{ completedId, unlockedId } | null`, aplicando o RF-03. Fica aqui para a regra não se espalhar pelos componentes.
- `src/components/learn/LearnModule.tsx`: repassa a `LessonNode` se a aula é a que acabou de ser concluída ou a que acabou de ser destrancada, e passa a medir a posição da aula pedida, não só a da `current`.
- `src/components/learn/LessonNode.tsx`: aceita uma prop de transição (`'completing' | 'unlocking' | undefined`). Com ela, o nó é montado no visual anterior e anima até o atual com `react-native-reanimated`; sem ela, o componente se comporta como hoje.

**Notas**

- Os dados já chegam no estado novo: `useApiQuery` recarrega os cursos quando a aba ganha foco. A animação é só visual, partindo do estado anterior, que é conhecido (a aula concluída era `current`, a seguinte era `locked`).
- A animação deve começar depois de os dados recarregados chegarem e de a rolagem terminar. Enquanto os dados antigos estiverem na tela, o caminho mostra o estado antigo, o que já é o ponto de partida correto.
- Os estilos de cada estado estão no objeto `STYLES` de `LessonNode.tsx`. A transição interpola entre as cores desses estados; não crie uma segunda tabela de cores.
- O atraso entre as três partes da animação (círculo, linha, próximo círculo) fica em constantes nomeadas no topo de `LessonNode.tsx` ou num arquivo ao lado.

**Divergências na implementação**

- A transição não interpola cores. A aula é mostrada no visual anterior, troca para o atual no meio da animação e o círculo dá um salto de escala; só a linha é preenchida de forma contínua. O efeito é o do RF-04 com menos código, e os estilos continuam vindo só de `STYLES`.
- `LearnModule` passou a informar a posição de todas as aulas (`onLessonLayout`), não só a da atual: a aula concluída já está medida quando o aluno volta, e uma medida nova não chegaria.
- Os parâmetros são limpos por tempo: cerca de 2 segundos depois de a animação começar ou, quando não há o que animar, depois de 6 segundos.

## Verificação

```bash
yarn lint
yarn tsc --noEmit
npx expo-doctor
```

No aparelho: percorrer os critérios de aceite. Os casos de fim de módulo e fim de curso pedem um aluno de teste com o progresso nesses pontos; se não houver, registre na entrega quais casos ficaram sem conferência.

## Tarefas

- [x] Função de transição em `src/utils/learn.ts`.
- [x] Leitura dos parâmetros e seleção do curso em `learn.tsx`.
- [x] Rolagem até a aula concluída.
- [x] Transições em `LessonNode` e repasse em `LearnModule`.
- [x] Limpeza dos parâmetros e teste de volta à aba.
- [x] "Reduzir movimento".
- [x] Atualizar o `CLAUDE.md` do app com os parâmetros da aba Aprender.
- [ ] Marcar esta spec e a tabela da iniciativa como `concluída`.
