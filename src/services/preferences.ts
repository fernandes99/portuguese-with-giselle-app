import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Contrato em .specs/onboarding/architecture.md (o mesmo do site)

export type PortugueseLevel =
  'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';

export type LearningGoal = 'PROFESSIONAL' | 'PERSONAL' | 'TRAVEL' | 'ACADEMIC';

export interface PreferenceOption {
  id: string;
  title: string;
  // null nos interesses
  description: string | null;
  // Só nos interesses; null no nível e no objetivo
  emoji: string | null;
}

export interface Preferences {
  level: PortugueseLevel;
  goal: LearningGoal;
  // Códigos dos temas
  interests: string[];
}

export interface PreferencesResponse {
  // null: o aluno ainda não respondeu
  preferences: Preferences | null;
  options: {
    levels: PreferenceOption[];
    goals: PreferenceOption[];
    interests: PreferenceOption[];
    interestsCount: number;
  };
}

export function getPreferences(token: string) {
  return api<PreferencesResponse>(API_ROUTES.preferences, { token });
}

export function savePreferences(token: string, preferences: Preferences) {
  return api<{ preferences: Preferences }>(API_ROUTES.preferences, {
    method: 'PUT',
    token,
    body: preferences,
  });
}
