import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Contrato em .specs/onboarding/architecture.md (o mesmo do site)

export type NativeLanguage = 'SPANISH' | 'ENGLISH' | 'OTHER';

export type PortugueseLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LearningGoal = 'PROFESSIONAL' | 'PERSONAL' | 'TRAVEL' | 'ACADEMIC';

export interface PreferenceOption {
  id: string;
  title: string;
  // null nos interesses e nos idiomas
  description: string | null;
  // Nos interesses e nos idiomas; null no nível e no objetivo
  emoji: string | null;
  // Só nos níveis: "Iniciante", "Intermediário" ou "Avançado"
  group: string | null;
}

export interface Preferences {
  // null: respondeu antes de o fluxo perguntar o idioma
  nativeLanguage: NativeLanguage | null;
  level: PortugueseLevel;
  goal: LearningGoal;
  // Códigos dos temas
  interests: string[];
}

export interface PreferencesResponse {
  // null: o aluno ainda não respondeu
  preferences: Preferences | null;
  options: {
    nativeLanguages: PreferenceOption[];
    levels: PreferenceOption[];
    goals: PreferenceOption[];
    interests: PreferenceOption[];
    interestsCount: number;
  };
}

// O nome troca o nome da conta
export interface PreferencesInput {
  nativeLanguage: NativeLanguage;
  name: string;
  level: PortugueseLevel;
  goal: LearningGoal;
  interests: string[];
}

export interface SavedPreferences {
  preferences: Preferences;
  // O nome da conta depois de gravar
  name: string | null;
}

export function getPreferences(token: string) {
  return api<PreferencesResponse>(API_ROUTES.preferences, { token });
}

export function savePreferences(token: string, input: PreferencesInput) {
  return api<SavedPreferences>(API_ROUTES.preferences, {
    method: 'PUT',
    token,
    body: input,
  });
}
