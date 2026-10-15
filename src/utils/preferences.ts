import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { getFirstName } from '@/utils/format';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type PreferencesMode = 'onboarding' | 'edit';

export const PREFERENCES_STEPS = 3;

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

// Pergunta da professora em cada passo (0 a 2)
export function getStepPrompt(
  step: number,
  mode: PreferencesMode,
  name: string | null | undefined
) {
  if (step === 1) {
    return 'Por que você quer aprender português?';
  }
  if (step === 2) {
    return 'Sobre quais temas você mais gosta de conversar?';
  }

  const question = 'Qual é o seu nível de português?';
  if (mode === 'edit') {
    return question;
  }

  const firstName = getFirstName(name);
  const greeting = firstName ? `Olá, ${firstName}!` : 'Olá!';
  return `${greeting} Antes de começar, quero conhecer você. ${question}`;
}

export function getStepInstruction(step: number, interestsCount: number) {
  return step === 2
    ? `Escolha ${interestsCount} temas:`
    : 'Escolha a opção que faz mais sentido pra você:';
}

export function getMissingAnswerMessage(step: number, interestsCount: number) {
  return step === 2
    ? `Escolha ${interestsCount} temas para continuar.`
    : 'Escolha uma opção para continuar.';
}

export function getInterestsLimitMessage(interestsCount: number) {
  return `Você já escolheu ${interestsCount} temas. Desmarque um para trocar.`;
}
