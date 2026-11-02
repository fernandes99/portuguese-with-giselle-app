import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { loadLanguage, saveLanguage } from '@/lib/storage';
import { en } from '@/locales/en';
import { es } from '@/locales/es';
import { pt } from '@/locales/pt';

export type AppLanguage = 'pt' | 'en' | 'es';

// Na ordem da tela de idioma. O nome vai no próprio idioma, para quem ainda
// não lê o idioma atual do app.
export const APP_LANGUAGES: {
  id: AppLanguage;
  title: string;
  emoji: string;
}[] = [
  { id: 'pt', title: 'Português', emoji: '🇧🇷' },
  { id: 'en', title: 'English', emoji: '🇺🇸' },
  { id: 'es', title: 'Español', emoji: '🇪🇸' },
];

const LOCALES: Record<AppLanguage, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

function parseLanguage(value: string | null): AppLanguage | null {
  return APP_LANGUAGES.find(({ id }) => id === value)?.id ?? null;
}

// O primeiro idioma do celular que o app tem, ou inglês
function getDeviceLanguage(): AppLanguage {
  for (const { languageCode } of getLocales()) {
    const language = parseLanguage(languageCode);
    if (language) {
      return language;
    }
  }
  return 'en';
}

i18next.use(initReactI18next).init({
  lng: getDeviceLanguage(),
  fallbackLng: 'pt',
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: { escapeValue: false },
  initAsync: false,
});

// Para o que roda fora de um componente; nas telas, use useTranslation
export const t = i18next.t;

export function getAppLanguage() {
  return i18next.language as AppLanguage;
}

// Para datas e números
export function getLocale() {
  return LOCALES[getAppLanguage()];
}

// Volta à escolha guardada. Sem escolha, fica o idioma do celular.
export async function restoreLanguage() {
  const stored = parseLanguage(await loadLanguage());
  if (stored) {
    await i18next.changeLanguage(stored);
  }
}

export async function changeAppLanguage(language: AppLanguage) {
  await i18next.changeLanguage(language);
  await saveLanguage(language);
}

export default i18next;
