import 'i18next';

import type { Translations } from '@/locales/pt';

// Uma chave que não existe quebra o typecheck
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: Translations };
  }
}
