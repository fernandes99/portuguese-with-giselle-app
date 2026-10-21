# Arquitetura

O que as duas fases compartilham.

## Contrato da rota

`GET /api/mobile/progress?timeZone=<fuso IANA>`, com o token da sessão. É o espelho do contrato em `.specs/study-progress/README.md` do site; ao mudar um, mude o outro.

```json
{
  "stats": {
    "completedModules": 1,
    "totalModules": 10,
    "completedLessons": 4,
    "totalLessons": 30,
    "studyMinutes": 95,
    "currentStreak": 2
  },
  "week": {
    "activeDays": 1,
    "days": [
      { "date": "2026-10-12", "studied": true },
      { "date": "2026-10-13", "studied": false }
    ]
  },
  "activity": [
    { "date": "2026-10-06", "lessons": 0, "activities": 0, "practices": 0 },
    { "date": "2026-10-12", "lessons": 1, "activities": 3, "practices": 14 }
  ],
  "streak": { "current": 2, "best": 5 },
  "achievements": {
    "unlocked": 1,
    "total": 8,
    "items": [
      {
        "code": "FIRST_LESSON",
        "title": "Primeira aula",
        "description": "Conclua sua primeira aula.",
        "unlockedAt": "2026-10-01T14:20:00.000Z",
        "current": 1,
        "target": 1
      }
    ]
  }
}
```

- `stats`: os mesmos campos que a tela já lê de `GET /api/mobile/dashboard`.
- `week.days`: 7 itens, de segunda a domingo da semana corrente.
- `activity`: 7 itens, do mais antigo para hoje.
- `date`: o dia no fuso enviado, como `AAAA-MM-DD`. O app não converte fuso: usa a data como veio.
- `achievements.items`: todas as conquistas, as desbloqueadas primeiro; `unlockedAt` é `null` nas outras. `current` e `target` são o andamento (o número do aluno, limitado à meta, e a meta); na desbloqueada, `current` é igual a `target`.
- Erros como `{ "error": string }`: `401` (o `api` encerra o login) e `500`.

## Fuso

O app envia `Intl.DateTimeFormat().resolvedOptions().timeZone`. Se o valor não existir, envia `UTC`. O fuso não é dado pessoal sensível e vai na query, como o backend espera.

## Dados da tela

`useProgress` (`src/hooks/useProgress.ts`) já junta duas cargas com `useApiQuery`, que recarrega quando a aba volta ao foco. Ele troca `getDashboard` por `getProgress` e passa a devolver também `week`, `activity`, `streak` e `achievements`. Os cursos continuam em `getCourses`.

Cada seção recebe só o seu pedaço por props e não busca nada. Enquanto a rota não responde, a tela mostra o indicador de carregamento de hoje; em erro, a faixa vermelha com "Tentar de novo".

## Datas na tela

O rótulo de cada dia sai da `date` recebida, sem passar por `new Date('AAAA-MM-DD')` com fuso: a função quebra o texto em ano, mês e dia e monta a data local. As abreviações são as do site em português: "seg.", "ter.", "qua.", "qui.", "sex.", "sáb.", "dom.".

O "hoje" é o último item de `activity`.

## Arquivos

| Arquivo                                     | Papel                                                   | Fase   |
| ------------------------------------------- | ------------------------------------------------------- | ------ |
| `src/services/progress.ts`                  | Chamada à rota e tipos do contrato                      | 01     |
| `src/hooks/useProgress.ts`                  | Dados da aba (alterado)                                 | 01     |
| `src/utils/progress.ts`                     | Rótulos de dia, fuso e textos de contagem               | 01     |
| `src/components/progress/StreakCard.tsx`    | Caixa pêssego: chama, sequência e semana marcada        | 01     |
| `src/constants/achievements.ts`             | Medalha de cada conquista, pelo código                  | 01     |
| `src/components/achievements/`              | Medalha, faixa, grade e folha de detalhe                | 01     |
| `src/components/progress/ActivityChart.tsx` | Gráfico de 7 dias                                       | 02     |
| `src/app/(app)/(tabs)/progress.tsx`         | A aba, com as seções na ordem definida (alterado)       | 01, 02 |
| `src/app/(app)/achievements.tsx`            | Página com todas as conquistas, aberta pelo "Ver todas" | 01     |

`src/services/dashboard.ts` deixa de ser usado pelo app quando a fase 01 termina; o arquivo e `API_ROUTES.dashboard` saem junto.

## Reaproveitado sem alterar

- `StatCard`, `ProgressBar`, `Button` e `colors`.
- `useApiQuery`, `api` e `getErrorMessage`.
- `formatStreak` e `formatStudyTime` (`src/utils/format.ts`).

## Padrões visuais

- Cada seção: título em `font-poppins-bold text-xl`, como "Meus cursos" hoje, e o conteúdo num cartão branco com borda, sem sombra pequena.
- Cores do gráfico, as mesmas dos ícones da grade: aulas em azul (`colors.blue`), exercícios em roxo (`colors.purple`) e práticas em verde (`colors.green`).
- Textos em português.
