# Tradução do app

Todos os textos de interface do app passam a existir em português, inglês e espanhol. O app abre no idioma do celular, segue o idioma nativo escolhido nas boas-vindas, e o aluno pode trocar no Perfil.

## Contexto

Os textos estão escritos em português nas telas: são pelo menos 430 linhas, em boa parte dos 264 arquivos de `src/`, sem biblioteca de tradução. O app também mostra textos que vêm do backend (opções das boas-vindas, planos, erros, notificações). A parte do backend está em `.specs/app-translation/` do repositório `portuguese-with-giselle`, com as decisões completas.

Este repositório entrega a base de tradução, a escolha do idioma e a troca de todos os textos das telas.

## Objetivos

1. No primeiro acesso, o app usa o idioma do celular. Se ele não for português, inglês ou espanhol, usa inglês.
2. Ao escolher espanhol ou inglês como idioma nativo nas boas-vindas, o app muda na hora. "Outro idioma" não muda nada.
3. O Perfil tem a troca entre os três idiomas, que muda o app e o idioma da explicação da Gisa.
4. Nenhum texto de interface fica fixo em um idioma só.

## Decisões

| Decisão                                                                               | Motivo                                                                                                           |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `i18next`, `react-i18next` e `expo-localization`                                      | Plural e interpolação prontos, com o hook que redesenha a tela ao trocar o idioma. Exige uma build nova          |
| Os textos ficam em `src/locales/<idioma>/`, um arquivo por área, em TypeScript        | `en` e `es` têm o tipo de `pt`: uma chave faltando quebra o `yarn tsc --noEmit`                                  |
| O português das telas não muda: só sai da tela para `src/locales/pt/`                 | A tradução não é uma revisão de texto                                                                            |
| A escolha fica no aparelho (`pwg.language`) e na conta; depois do login, a conta vale | A escolha acompanha o aluno em outro aparelho, e o aparelho sabe o idioma antes de haver sessão                  |
| Sem escolha gravada, o app segue o idioma do celular a cada abertura                  | Até a primeira escolha, não há o que guardar                                                                     |
| Trocar no Perfil só muda o app depois que o backend grava                             | O app e a conta não ficam diferentes; se falhar, o aluno vê o erro e continua no idioma atual                    |
| Em "Minhas preferências", mudar o idioma nativo não muda o idioma do app              | O idioma do app tem a opção própria no Perfil; só as boas-vindas ligam os dois                                   |
| As conquistas são traduzidas aqui, pelo `code`                                        | Qualquer rota pode devolver `unlockedAchievements`, e `src/constants/achievements.ts` já é uma tabela por `code` |
| O reconhecimento de fala continua em `pt-BR`                                          | O aluno fala português                                                                                           |
| A abertura fixa da Gisa (`src/utils/practice.ts`) continua em português               | É a Gisa falando, não interface                                                                                  |
| Inglês americano e espanhol neutro com "tú"                                           | Decisão do desenvolvimento, a mesma do site                                                                      |

## Fora do escopo

- Conteúdo: aulas, atividades, vocabulário, títulos de cursos e categorias.
- O que a Gisa e as personagens falam.
- Texto escrito pela professora.
- As páginas do Stripe, que abrem no navegador e seguem o idioma do celular.
- Nome e descrição do app nas lojas.
- Outros idiomas.

## Fases

| Fase                               | Assunto                                                               | Status       |
| ---------------------------------- | --------------------------------------------------------------------- | ------------ |
| [01](01-language-base.md)          | Base de tradução, escolha do idioma e troca no Perfil                 | em andamento |
| [02](02-entry-screens.md)          | Introdução, login, cadastro, boas-vindas, abas e Perfil               | em andamento |
| [03](03-lessons-and-activities.md) | Cursos, aulas e atividades                                            | em andamento |
| [04](04-practice.md)               | Chat, simulações, flashcards, vocabulário e aulas particulares        | em andamento |
| [05](05-account-and-finish.md)     | Planos, pagamentos, notificações, progresso, conquistas e conferência | em andamento |

A fase 01 depende da fase 01 do site. As fases 02 a 05 podem ir em qualquer ordem.

## Regras para trocar os textos

- Componentes usam `const { t } = useTranslation()`. Funções fora de componentes importam `t` de `@/lib/i18n`.
- Constantes de texto no topo do arquivo (`const LOAD_ERROR = '...'`) viram chaves lidas na hora: uma string guardada no carregamento não muda quando o idioma troca.
- Plural usa `count` e os sufixos `_one` e `_other` do i18next, no lugar dos ternários `count === 1 ?`. São 28 hoje. Só para contagens pequenas (dias, mensagens, tentativas): de 1 milhão em diante, o português e o espanhol pedem o sufixo `_many`, e sem ele a tela mostraria a chave crua. O score não usa plural.
- Datas e números usam o idioma do app, por `getLocale()` de `@/lib/i18n`, no lugar de `'pt-BR'` fixo.
- `getErrorMessage(err, fallback)` continua igual: o texto do `ApiError` já vem no idioma do app.
- Texto novo de tela entra em `src/locales/`, nos três idiomas. `node scripts/check-translations.mjs` aponta o que ficou no código.

## Contrato

Cópia de `.specs/app-translation/architecture.md` do site. Mudou um, mude o outro.

**Cabeçalho:** `X-App-Language: pt | en | es`, em toda chamada, com ou sem token.

**Usuário da sessão** (`login`, `google` e `me`) ganha:

```json
{ "appLanguage": "es" }
```

`null` quando a conta ainda não tem idioma gravado: o app mantém o que já está usando. Quando vem preenchido, o app adota.

**`PUT /api/mobile/preferences`** aceita `appLanguage` (`pt`, `en` ou `es`), opcional, e grava junto com as outras respostas. Outro valor dá 400.

**`PUT /api/mobile/preferences/app-language`** (token Bearer) troca o idioma pelo Perfil:

```json
{ "language": "es" }
```

Grava `appLanguage` e `explanationLanguage` e responde:

```json
{ "appLanguage": "es", "explanationLanguage": "SPANISH" }
```

Erros: 400 com idioma inválido, 401 sem token e 409 se o aluno ainda não respondeu as boas-vindas.

Os formatos das rotas existentes não mudam: só o idioma dos textos de interface.
