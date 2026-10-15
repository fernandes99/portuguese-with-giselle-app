import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { PreferenceOption } from '@/services/preferences';
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

// Tamanho máximo do nome, o mesmo que o backend aceita
export const NAME_MAX_LENGTH = 80;

export const WELCOME_MESSAGE =
  'Ninguém fica fluente de um dia para o outro. Um passo de cada vez, todos os dias, é o que vai fazer você falar português com confiança.';

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
      const question = 'Qual é a sua língua nativa?';
      return mode === 'edit'
        ? question
        : `Olá! Antes de começar, quero conhecer você. ${question}`;
    }
    case 'name':
      return 'Como você quer que eu te chame?';
    case 'level': {
      const question = 'Como você descreveria seu português hoje?';
      const firstName = getFirstName(name);
      return mode === 'edit' || !firstName
        ? question
        : `Prazer, ${firstName}! ${question}`;
    }
    case 'goal':
      return 'Por que você quer aprender português?';
    case 'interests':
      return 'Sobre quais temas você mais gosta de conversar?';
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
      return 'Não existe resposta errada: as aulas se adaptam ao seu ritmo.';
    case 'interests':
      return `Escolha ${interestsCount} temas:`;
    case 'language':
    case 'goal':
      return 'Escolha a opção que faz mais sentido pra você:';
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
      return 'Digite seu nome para continuar.';
    case 'interests':
      return `Escolha ${interestsCount} temas para continuar.`;
    default:
      return 'Escolha uma opção para continuar.';
  }
}

export function getInterestsLimitMessage(interestsCount: number) {
  return `Você já escolheu ${interestsCount} temas. Desmarque um para trocar.`;
}

export function getWelcomeTitle(name: string) {
  const firstName = getFirstName(name);
  return firstName ? `Boas-vindas, ${firstName}!` : 'Boas-vindas!';
}
