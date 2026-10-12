# Arquitetura

O que as duas fases compartilham. Os contratos são espelho dos que estão em `.specs/achievements-history/README.md` do site; ao mudar um, mude o outro.

## Conquistas na resposta

Qualquer rota do backend pode acrescentar à resposta de sucesso:

```json
{
  "unlockedAchievements": [
    {
      "code": "FIRST_LESSON",
      "title": "First Lesson",
      "description": "Complete your first lesson",
      "unlockedAt": "2026-10-12T20:15:00.000Z"
    }
  ]
}
```

Hoje mandam o campo: a lista de cursos, a aula, a conclusão de aula, o progresso de atividade e a publicação de comentário. A regra de cada conquista está na spec do site.

### Como o app reage

```
resposta de qualquer rota
  -> api() (src/lib/api.ts) vê unlockedAchievements com itens
  -> chama o handler registrado por setAchievementHandler
  -> AchievementToast põe as conquistas na fila
  -> mostra uma por vez, com animação e som
```

- `api()` continua devolvendo a resposta inteira a quem chamou; os serviços não mudam e ignoram o campo.
- O handler é um só, registrado pelo `AchievementToast` ao montar e removido ao desmontar, no mesmo formato de `setUnauthorizedHandler`.
- O `AchievementToast` fica em `src/app/(app)/_layout.tsx`, ao lado da pilha de telas, então cobre abas e telas abertas por cima delas.
- A fila descarta uma conquista com o mesmo `code` de outra que já está esperando.

## Histórico

`GET /api/mobile/history?type=LESSON&page=1`, com o token da sessão. `type` é opcional.

```json
{
  "entries": [
    {
      "id": "clx...",
      "entityType": "LESSON",
      "action": "COMPLETED",
      "title": "Greetings",
      "context": "Portuguese for Beginners",
      "updatedAt": "2026-10-12T20:15:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

- `entityType`: `COURSE`, `MODULE`, `LESSON`, `ACTIVITY` ou `FLASHCARD`.
- `action`: `STARTED`, `IN_PROGRESS` ou `COMPLETED`.
- `context`: curso da aula, do módulo ou da atividade, ou conjunto do card; pode ser `null`.
- Ordem: da mudança mais recente para a mais antiga.
- Erros como `{ "error": string }`: `401`, `400` e `500`.

Rótulos, os mesmos da tela da professora:

| Valor         | Texto        | Cor   |
| ------------- | ------------ | ----- |
| `COURSE`      | Curso        |       |
| `MODULE`      | Módulo       |       |
| `LESSON`      | Aula         |       |
| `ACTIVITY`    | Atividade    |       |
| `FLASHCARD`   | Flashcard    |       |
| `STARTED`     | Iniciou      | cinza |
| `IN_PROGRESS` | Em andamento | azul  |
| `COMPLETED`   | Concluiu     | verde |

## Arquivos

| Arquivo                                 | Papel                                           | Fase |
| --------------------------------------- | ----------------------------------------------- | ---- |
| `src/lib/api.ts`                        | `UnlockedAchievement` e `setAchievementHandler` | 01   |
| `src/components/AchievementToast.tsx`   | Fila, animação e som do aviso                   | 01   |
| `src/app/(app)/_layout.tsx`             | Monta o aviso por cima das telas                | 01   |
| `scripts/generate-achievement-sound.js` | Gera `assets/sounds/achievement.wav`            | 01   |
| `src/services/history.ts`               | Chamada à rota e tipos do contrato              | 02   |
| `src/hooks/useHistory.ts`               | Páginas e filtro do histórico                   | 02   |
| `src/app/(app)/history.tsx`             | Tela "Histórico"                                | 02   |
| `src/app/(app)/(tabs)/profile.tsx`      | Linha "Histórico"                               | 02   |
| `src/utils/date.ts`                     | `formatDateTime`                                | 02   |

## Reaproveitado sem alterar

- `useAudioPlayer` (`expo-audio`), como em `src/components/lesson-flow/Congratulations.tsx`.
- `LessonHeader` (`src/components/lesson/ClassicLesson.tsx`), `Button` e `colors`.
- `useAuth`, `api` e `getErrorMessage`.
