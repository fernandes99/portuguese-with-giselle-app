import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export interface DashboardCourse {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  completedModules: number;
  totalModules: number;
  // Última aula vista, ou a primeira do curso se o aluno ainda não começou
  lesson: {
    id: string;
    slug: string;
    title: string;
    moduleTitle: string;
    // Posição da aula dentro do módulo (ex.: 2 de 7)
    number: number;
    total: number;
  };
}

export interface DashboardStats {
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  studyMinutes: number;
  currentStreak: number;
}

export interface Dashboard {
  hasStarted: boolean;
  course: DashboardCourse | null;
  stats: DashboardStats;
}

export function getDashboard(token: string) {
  return api<Dashboard>(API_ROUTES.dashboard, { token });
}
