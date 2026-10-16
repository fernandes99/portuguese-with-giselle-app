import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// Contrato em .specs/onboarding/architecture.md (o mesmo do site)

export type NativeLanguage = 'SPANISH' | 'ENGLISH' | 'OTHER';

export type PortugueseLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type LearningGoal = 'PROFESSIONAL' | 'PERSONAL' | 'TRAVEL' | 'ACADEMIC';

// Estilo da Gisa no chat de prática
export type ChatStyle = 'FRIENDLY' | 'TUTOR' | 'BRAZILIAN' | 'CALM';

// Idioma em que a Gisa explica os erros e traduz as falas no chat
export type ExplanationLanguage = 'ENGLISH' | 'SPANISH' | 'PORTUGUESE';

export interface ExplanationLanguageOption {
  id: ExplanationLanguage;
  // O nome no próprio idioma (English, Español, Português)
  title: string;
  emoji: string;
  description: string;
}

export interface ChatStyleOption {
  id: ChatStyle;
  title: string;
  emoji: string;
  description: string;
  // Como a Gisa se apresenta nesse estilo
  example: string;
}

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
  // null: o aluno ainda não escolheu o estilo da Gisa
  chatStyle?: ChatStyle | null;
  // O escolhido no chat, ou o que segue do idioma nativo; ausente no
  // backend antigo
  explanationLanguage?: ExplanationLanguage;
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
    // Ausentes no backend antigo
    chatStyles?: ChatStyleOption[];
    explanationLanguages?: ExplanationLanguageOption[];
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

// Grava só o estilo da Gisa; o resto das preferências não muda
export function saveChatStyle(token: string, chatStyle: ChatStyle) {
  return api<{ chatStyle: ChatStyle }>(API_ROUTES.chatStyle, {
    method: 'PUT',
    token,
    body: { chatStyle },
  });
}

// Grava só o idioma das explicações do chat; a conversa não recomeça
export function saveExplanationLanguage(
  token: string,
  explanationLanguage: ExplanationLanguage
) {
  return api<{ explanationLanguage: ExplanationLanguage }>(
    API_ROUTES.chatLanguage,
    { method: 'PUT', token, body: { explanationLanguage } }
  );
}
