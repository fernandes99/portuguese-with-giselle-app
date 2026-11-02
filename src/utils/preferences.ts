import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { type AppLanguage, t } from '@/lib/i18n';
import type { NativeLanguage, PreferenceOption } from '@/services/preferences';
import { getFirstName } from '@/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type PreferencesMode = 'onboarding' | 'edit';

export type PreferencesStep =
  'language' | 'name' | 'level' | 'goal' | 'interests' | 'welcome';

const QUESTION_STEPS: PreferencesStep[] = [
  'language',
  'name',
  'level',
  'goal',
  'interests',
];

// A tela de boas-vindas fecha só o primeiro acesso; a edição termina nos
// temas
export function getPreferencesSteps(mode: PreferencesMode): PreferencesStep[] {
  return mode === 'onboarding'
    ? [...QUESTION_STEPS, 'welcome']
    : QUESTION_STEPS;
}

// O idioma do app que segue do idioma nativo; "Outro idioma" não escolhe um
export function getNativeAppLanguage(
  language: NativeLanguage
): AppLanguage | null {
  if (language === 'SPANISH') {
    return 'es';
  }
  return language === 'ENGLISH' ? 'en' : null;
}

// Tamanho máximo do nome, o mesmo que o backend aceita
export const NAME_MAX_LENGTH = 80;

const GOAL_ICONS: Record<string, IconName> = {
  PROFESSIONAL: 'briefcase-outline',
  PERSONAL: 'heart-outline',
  TRAVEL: 'airplane-outline',
  ACADEMIC: 'school-outline',
};

// Objetivo novo no backend, sem ícone aqui, ainda aparece
export function getGoalIcon(goal: string): IconName {
  return GOAL_ICONS[goal] ?? 'ellipse-outline';
}

// Níveis em grupos ("Iniciante", "Intermediário", "Avançado"), na ordem em
// que chegam da rota
export function groupLevels(levels: PreferenceOption[]) {
  const groups: { title: string; options: PreferenceOption[] }[] = [];
  for (const option of levels) {
    const title = option.group ?? '';
    const last = groups[groups.length - 1];
    if (last && last.title === title) {
      last.options.push(option);
    } else {
      groups.push({ title, options: [option] });
    }
  }
  return groups;
}

// Pergunta da professora em cada passo. `name` é o nome já digitado.
export function getStepPrompt(
  step: PreferencesStep,
  mode: PreferencesMode,
  name: string
) {
  switch (step) {
    case 'language': {
      const question = t('entry.preferences.prompt.languageQuestion');
      return mode === 'edit'
        ? question
        : t('entry.preferences.prompt.languageGreeting', { question });
    }
    case 'name':
      return t('entry.preferences.prompt.name');
    case 'level': {
      const question = t('entry.preferences.prompt.levelQuestion');
      const firstName = getFirstName(name);
      return mode === 'edit' || !firstName
        ? question
        : t('entry.preferences.prompt.levelGreeting', {
            name: firstName,
            question,
          });
    }
    case 'goal':
      return t('entry.preferences.prompt.goal');
    case 'interests':
      return t('entry.preferences.prompt.interests');
    case 'welcome':
      return '';
  }
}

export function getStepInstruction(
  step: PreferencesStep,
  interestsCount: number
) {
  switch (step) {
    case 'level':
      return t('entry.preferences.instruction.level');
    case 'interests':
      return t('entry.preferences.instruction.interests', {
        count: interestsCount,
      });
    case 'language':
    case 'goal':
      return t('entry.preferences.instruction.choice');
    default:
      return null;
  }
}

export function getMissingAnswerMessage(
  step: PreferencesStep,
  interestsCount: number
) {
  switch (step) {
    case 'name':
      return t('entry.preferences.missing.name');
    case 'interests':
      return t('entry.preferences.missing.interests', {
        count: interestsCount,
      });
    default:
      return t('entry.preferences.missing.choice');
  }
}

export function getInterestsLimitMessage(interestsCount: number) {
  return t('entry.preferences.interestsLimit', { count: interestsCount });
}

export function getWelcomeTitle(name: string) {
  const firstName = getFirstName(name);
  return firstName
    ? t('entry.preferences.welcomeTitle', { name: firstName })
    : t('entry.preferences.welcomeTitleNoName');
}
