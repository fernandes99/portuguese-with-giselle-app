import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

// scheduled: agendada; completed: o horário já passou; canceled: cancelada
export type PrivateLessonStatus = 'scheduled' | 'completed' | 'canceled';

export interface PrivateLesson {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: PrivateLessonStatus;
  joinUrl: string | null;
  canChange: boolean;
  rescheduleUrl: string | null;
  cancelUrl: string | null;
  creditReturned: boolean;
}

export interface LessonPrice {
  // Preço de uma aula, em centavos
  unitAmount: number;
  currency: string;
}

export interface PrivateLessonsSummary {
  // Aulas compradas que ainda não foram usadas num agendamento
  available: number;
  price: LessonPrice;
  maxQuantity: number;
  changeNoticeHours: number;
  contactEmail: string;
  nextLesson: PrivateLesson | null;
}

export interface LessonCheckout {
  url: string;
  sessionId: string;
}

// paid: paga e creditada; pending: ainda sem pagamento; expired: abandonada
export interface PurchaseStatus {
  status: 'paid' | 'pending' | 'expired';
  quantity: number;
  available: number;
}

export function getPrivateLessons(token: string) {
  return api<PrivateLessonsSummary>(API_ROUTES.privateLessons, { token });
}

// Link de pagamento do Stripe para a quantidade escolhida
export function createLessonCheckout(token: string, quantity: number) {
  return api<LessonCheckout>(API_ROUTES.privateLessonsCheckout, {
    method: 'POST',
    body: { quantity },
    token,
  });
}

export function getPurchaseStatus(token: string, sessionId: string) {
  return api<PurchaseStatus>(API_ROUTES.privateLessonPurchase(sessionId), {
    token,
  });
}

// Link de uso único da agenda da professora. O backend só o entrega a quem
// tem aula disponível (409 caso contrário).
export async function createSchedulingLink(token: string) {
  const { url } = await api<{ url: string }>(
    API_ROUTES.privateLessonsSchedulingLink,
    { method: 'POST', token }
  );
  return url;
}

// Agendamentos do aluno, já na ordem de exibição
export async function getBookings(token: string) {
  const { bookings } = await api<{ bookings: PrivateLesson[] }>(
    API_ROUTES.privateLessonsBookings,
    { token }
  );
  return bookings;
}
