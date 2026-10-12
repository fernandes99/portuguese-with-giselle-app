# Portuguese With Giselle (app)

App React Native + Expo do curso. O backend é o site Next.js do repositório `portuguese-with-giselle` (normalmente em `../portuguese-with-giselle`); este repositório não tem servidor nem banco.

Configuração, variáveis de ambiente e o passo a passo do Google estão em `README.md`.

## Stack

- Expo SDK 57, Expo Router (rotas em `src/app/`), React Native 0.86, TypeScript `strict`.
- NativeWind 4 com Tailwind 3. O NativeWind 5 ainda é release candidate; não suba.
- Yarn 1. Para pacotes do Expo ou com código nativo use `npx expo install <pacote>`, que escolhe a versão compatível com o SDK.
- Lint com Biome, formatação com Prettier (`prettier-plugin-tailwindcss`), como no site.

O Expo muda APIs a cada SDK. Antes de usar uma API do Expo, confira os tipos em `node_modules` ou a documentação da versão em `https://docs.expo.dev/versions/v57.0.0/`.

## Comandos

```bash
yarn start         # servidor de desenvolvimento (precisa de development build)
yarn android       # gera e instala o build Android
yarn lint          # Biome
yarn tsc --noEmit  # typecheck
yarn format        # Prettier
npx expo-doctor    # confere dependências e configuração
```

Antes de commitar: `yarn lint`, `yarn tsc --noEmit` e `npx expo-doctor`. Não há testes automatizados.

O terminal é PowerShell no Windows; use `;` para encadear comandos, não `&&`.

## Estrutura

- `src/app/`: rotas. `_layout.tsx` carrega fontes, segura a splash e separa `(auth)` de `(app)` com `Stack.Protected`.
- `src/app/(auth)/`: login e cadastro. `src/app/(app)/`: área logada. As abas de baixo (Aprender, Praticar, Progresso, Perfil) ficam em `src/app/(app)/(tabs)/`; telas que abrem por cima das abas entram direto em `(app)/`. A lista de cursos (`(app)/courses.tsx`) abre por "Meus cursos", no Perfil, e o histórico (`(app)/history.tsx`), por "Histórico".
- Aba Praticar (`(tabs)/practice.tsx`) e chat com a Professora Gisa (`(app)/practice/chat.tsx`, `src/components/practice/`, `src/hooks/usePracticeChat.ts`): chat de texto com IA, só para assinantes (`canUsePractice`, em `src/utils/practice.ts`). A abertura é fixa e escrita no app; cada mensagem do aluno vai com a conversa inteira para `POST /api/mobile/practice/chat`, que devolve a correção e a resposta. A conversa fica só em memória. Cada turno gasta créditos da API de IA do backend.
- Flashcards (`(app)/practice/flashcards/`, `src/components/flashcards/`, `src/hooks/useFlashcardSession.ts`): segunda opção da aba Praticar, aberta a qualquer aluno. São os mesmos conjuntos e o mesmo progresso do site, pelas rotas `/api/mobile/flashcards`. A sessão carrega o conjunto inteiro uma vez, mantém o card da vez e o seguinte montados (`StudyCard`) e grava cada resposta sem esperar o backend.
- Aulas particulares (`(app)/practice/private-lessons/`, `src/components/privateLessons/`): terceira opção da aba Praticar, aberta a qualquer aluno. A tela mostra o saldo de aulas compradas, que vem do backend (`/api/mobile/private-lessons`). A compra (`buy.tsx`) pede um link de pagamento do Stripe e o abre com `openAuthSessionAsync`; o site devolve o aluno para `pwg://practice/private-lessons/purchase`, e a tela de resultado (`purchase.tsx`, `usePurchaseStatus`) consulta o backend até a compra constar como paga. "Agendar aula" só funciona com saldo: pede ao backend um link de uso único do Calendly e o abre no navegador interno; ao fechar, a tela recarrega na hora e mais duas vezes (`useRefreshAfterBrowser`), porque o aviso do Calendly ao backend pode atrasar. A lista fica em `bookings.tsx`, com a situação de cada aula já calculada pelo backend. Remarcar e cancelar (`LessonActions`) abrem as páginas do Calendly e só aparecem até 12 horas antes; depois, o aluno fala com a professora por email. O app não guarda saldo nem trata cartão. Com o backend em produção, cada compra é cobrança real e cada agendamento entra na agenda da professora.
- Aba Aprender (`(tabs)/index.tsx`, a tela inicial do app; `src/components/learn/`, `src/utils/learn.ts`): caminho de módulos e aulas do curso selecionado, com os dados de `getCourses`. As aulas depois da primeira não concluída aparecem trancadas. Esse bloqueio é só visual e só dessa aba: o backend, o site e a lista de cursos abrem qualquer aula.
- Tela de aula (`(app)/lesson/[courseSlug]/[lessonSlug].tsx`): a rota carrega a aula e escolhe, uma vez por abertura, entre duas telas. Aula não concluída abre o fluxo em etapas (`src/components/lesson-flow/GuidedLesson.tsx`, etapas calculadas em `src/utils/lessonFlow.ts`), que termina na tela de parabéns; aula concluída abre a tela com abas (`src/components/lesson/ClassicLesson.tsx`). Vale para qualquer lugar que abra uma aula.
- Aba Progresso (`(tabs)/progress.tsx`): os números do aluno, os dias de estudo da semana, o gráfico dos últimos 7 dias, a sequência e as conquistas, tudo de `GET /api/mobile/progress` (`src/hooks/useProgress.ts`, `src/components/progress/`), e o andamento de cada curso, de `getCourses`. O app envia o fuso do aparelho e mostra os dias como o backend devolve, sem converter. O app não tem mais a tela de Dashboard.
- Conquistas: qualquer rota do backend pode devolver `unlockedAchievements`. `api()` (`src/lib/api.ts`) repassa a lista ao `AchievementToast` (`src/components/AchievementToast.tsx`), montado em `(app)/_layout.tsx` por cima de todas as telas, que mostra uma por vez com animação e som. Nenhuma tela trata conquistas.
- Histórico (`(app)/history.tsx`, `src/hooks/useHistory.ts`): aberto pelo Perfil, lista a situação atual de cada item que o aluno abriu, de `GET /api/mobile/history`, com filtro por tipo e "Carregar mais". É a mesma lista que a professora vê no site.
- O parabéns volta para a aba Aprender com os parâmetros `course` (slug do curso) e `completed` (id da aula). A aba seleciona o curso, rola até a aula, anima a conclusão e o desbloqueio da próxima e limpa os parâmetros.
- `scripts/generate-lesson-complete-sound.js` gera `assets/sounds/lesson-complete.wav`, o som do parabéns, e `scripts/generate-achievement-sound.js` gera `assets/sounds/achievement.wav`, o som de conquista.
- `src/components/WelcomeScreen.tsx`: introdução da primeira abertura (slides com fotos de `assets/onboarding/`). Não é uma rota: o `_layout.tsx` raiz a mostra no lugar da navegação enquanto a marca `pwg.welcomeSeen` do SecureStore não existe e não há sessão. O "Início" da tela de login a mostra de novo (`useWelcome`, de `src/contexts/WelcomeContext.tsx`), sem apagar a marca.
- `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`.
- `src/contexts/AuthContext.tsx`: sessão (`status`, `user`, `token`, `signIn`, `signOut`).
- `src/lib/`: `api` (fetch com Bearer e `ApiError`), `storage` (SecureStore), `google`.
- `src/services/`: chamadas ao backend, uma função por rota.
- `.specs/`: specs das iniciativas, uma pasta por entrega.
- `app.config.ts`: configuração nativa. As pastas `android/` e `ios/` são geradas e não são versionadas; nunca edite à mão.

## Specs

Entregas grandes são planejadas em `.specs/<iniciativa>/` antes do código. A convenção e o modelo estão em `.specs/README.md`.

- Antes de implementar uma fase, leia o `README.md` da iniciativa, o `architecture.md` e a spec da fase.
- Implemente uma fase por vez. Ao terminar, marque as tarefas e atualize o status na spec e na tabela da iniciativa, no mesmo commit.
- Se a implementação precisar divergir da spec, atualize a spec junto e registre o motivo. O que a spec não decide vai para "Dúvidas em aberto" e é perguntado, não presumido.

Iniciativas em andamento:

- `.specs/guided-lesson/`: aula em etapas, com tela de parabéns e desbloqueio animado na aba Aprender.
- `.specs/practice-chat/`: aba Praticar e chat de texto com IA.
- `.specs/practice-flashcards/`: flashcards do site na aba Praticar, com sessão de estudo por toque e arrasto.
- `.specs/study-progress/`: dias de estudo, gráfico de 7 dias, sequência e conquistas na aba Progresso.
- `.specs/achievements-history/`: aviso de conquista com som e tela de histórico.
- `.specs/private-lessons/`: aulas particulares na aba Praticar, com saldo de aulas, compra pelo Stripe fora do app, agendamento pelo Calendly e lista de agendamentos. As duas fases estão escritas e aguardam o teste no aparelho.
- `.specs/teacher-chat/`: chat de texto do aluno assinante com a professora Giselle, aberto pelo Perfil, com contador de mensagens não lidas no Perfil e na aba (`TeacherChatUnreadContext`). A tela é `src/app/(app)/teacher-chat.tsx`, e a conversa vem sempre do backend (`useTeacherChat`), que é consultado a cada 30 segundos. A fase está escrita e aguarda o teste no aparelho.

## Cuidados

- Rotas novas do backend entram em `API_ROUTES` (`src/constants/config.ts`) e precisam existir no site. Rotas autenticadas do site usam cookie; para o app, o site precisa aceitar Bearer com `getMobileUser` (`src/lib/mobile-auth.ts` de lá).
- Erros do backend vêm como `{ error: string }` em português; `api()` os transforma em `ApiError`.
- Textos da interface em português, iguais aos do site.
- Cada peso da Poppins é uma família: use `font-poppins`, `font-poppins-medium`, `font-poppins-semibold` e `font-poppins-bold`, não `font-bold`.
- Cores da marca ficam em `tailwind.config.js` e, para props sem `className`, em `src/constants/theme.ts`. Mantenha os dois iguais.
- `.env` não é versionado. Variáveis `EXPO_PUBLIC_*` vão para o bundle: nada de segredos.
- Bibliotecas com código nativo exigem novo development build.

## Commits

Mesmo padrão do site: `feat:`, `fix:` ou `chore:`, frase curta em inglês, minúsculas, imperativo, sem escopo e sem ponto final. Um commit por assunto. Documentação em português.

A branch principal é a `main`, como no site, e o trabalho vai direto nela.

## Versão

- A versão do app é o campo `version` do `package.json`, no formato `major.minor.patch`. O `app.config.ts` lê esse valor, e ele aparece no rodapé da aba Perfil.
- **Todo push sobe o patch** (o último número): `0.0.1`, `0.0.2`, `0.0.3`. É um aumento por push, não por commit.
- O aumento vai em um commit próprio, o último antes do push: `chore: bump version to 0.0.2`.
- Minor (`0.1.0`) e major (`1.0.0`) só mudam com pedido explícito do dono do projeto. Nunca suba esses números por conta própria, por maior que seja a mudança.
- O número de build do Android e do iOS (`versionCode` e `buildNumber`) é controlado pelo EAS e não entra nessa regra.
- O site (`portuguese-with-giselle`) segue a mesma regra, com versão independente.
