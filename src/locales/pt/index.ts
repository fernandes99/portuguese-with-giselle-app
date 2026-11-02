import { account } from './account';
import { common } from './common';
import { entry } from './entry';
import { language } from './language';
import { lesson } from './lesson';
import { practice } from './practice';

// O português é a referência: `en` e `es` têm este tipo, então uma chave
// faltando em um deles quebra o typecheck
export const pt = {
  account,
  common,
  entry,
  language,
  lesson,
  practice,
};

export type Translations = typeof pt;
