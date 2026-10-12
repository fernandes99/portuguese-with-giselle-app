// Com www: o domínio sem www redireciona para cá, e no redirecionamento o
// Android descarta o header Authorization, o que derruba a sessão.
export const SITE_URL = 'https://www.portuguesewithgiselle.com';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || SITE_URL).replace(
  /\/$/,
  ''
);

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

// Para onde o site devolve o aluno depois de pagar as aulas particulares
export const PURCHASE_RETURN_URL = 'pwg://practice/private-lessons/purchase';

export const LINKS = {
  terms: `${SITE_URL}/terms`,
  privacy: `${SITE_URL}/privacy`,
};

// Rotas do backend (src/config/routes/api.routes.ts no repositório do site)
export const API_ROUTES = {
  login: '/api/mobile/auth/login',
  google: '/api/mobile/auth/google',
  me: '/api/mobile/auth/me',
  progress: '/api/mobile/progress',
  history: '/api/mobile/history',
  courses: '/api/mobile/courses',
  course: (courseSlug: string) =>
    `/api/mobile/courses/${encodeURIComponent(courseSlug)}`,
  lesson: (courseSlug: string, lessonSlug: string) =>
    `/api/mobile/courses/${encodeURIComponent(courseSlug)}/lessons/${encodeURIComponent(lessonSlug)}`,
  activityProgress: (activityId: string) =>
    `/api/mobile/activities/${encodeURIComponent(activityId)}/progress`,
  lessonDiscussions: (lessonId: string) =>
    `/api/mobile/lessons/${encodeURIComponent(lessonId)}/discussions`,
  lessonComplete: (lessonId: string) =>
    `/api/mobile/lessons/${encodeURIComponent(lessonId)}/complete`,
  practiceChat: '/api/mobile/practice/chat',
  flashcards: '/api/mobile/flashcards',
  flashcard: (slug: string) =>
    `/api/mobile/flashcards/${encodeURIComponent(slug)}`,
  flashcardCardProgress: (slug: string, cardId: string) =>
    `/api/mobile/flashcards/${encodeURIComponent(slug)}/cards/${encodeURIComponent(cardId)}/progress`,
  privateLessons: '/api/mobile/private-lessons',
  privateLessonsCheckout: '/api/mobile/private-lessons/checkout',
  privateLessonPurchase: (sessionId: string) =>
    `/api/mobile/private-lessons/purchases/${encodeURIComponent(sessionId)}`,
  privateLessonsSchedulingLink: '/api/mobile/private-lessons/scheduling-link',
  privateLessonsBookings: '/api/mobile/private-lessons/bookings',
  teacherChat: '/api/mobile/teacher-chat',
  teacherChatUnread: '/api/mobile/teacher-chat/unread',
  sendCode: '/api/email/send',
  verifyCode: '/api/auth/verify-code',
  register: '/api/auth/register',
};
