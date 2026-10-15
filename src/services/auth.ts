import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export type Role = 'FREE_STUDENT' | 'PREMIUM_STUDENT' | 'ADMIN' | 'TEACHER';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  // false: o app abre as boas-vindas antes das abas. Ausente (backend
  // antigo) conta como respondido
  onboardingCompleted?: boolean;
}

export interface Session {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return api<Session>(API_ROUTES.login, {
    method: 'POST',
    body: { email, password },
  });
}

export function loginWithGoogle(idToken: string) {
  return api<Session>(API_ROUTES.google, {
    method: 'POST',
    body: { idToken },
  });
}

// Valida o token guardado e devolve a sessão renovada
export function me(token: string) {
  return api<Session>(API_ROUTES.me, { token });
}

// Cadastro, passo 1: envia o código de 6 dígitos por email
export function sendCode(email: string, password: string, name?: string) {
  return api<{ success: boolean }>(API_ROUTES.sendCode, {
    method: 'POST',
    body: { email, password, name: name || undefined },
  });
}

// Cadastro, passo 2: confere o código e cria a conta
export async function verifyCodeAndRegister(email: string, code: string) {
  await api(API_ROUTES.verifyCode, { method: 'POST', body: { email, code } });
  await api(API_ROUTES.register, { method: 'POST', body: { email } });
}
