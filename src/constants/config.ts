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

// Para onde o site devolve o aluno depois de assinar um plano
export const PLANS_RETURN_URL = 'pwg://plans/result';

// Para onde o site devolve o aluno depois do portal de pagamentos do Stripe
export const BILLING_RETURN_URL = 'pwg://billing';

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
  lessonTranscription: (lessonId: string) =>
    `/api/mobile/lessons/${encodeURIComponent(lessonId)}/transcription`,
  practiceChat: '/api/mobile/practice/chat',
  practiceOpening: '/api/mobile/practice/opening',
  practiceSpeech: '/api/mobile/practice/speech',
  practiceUsage: '/api/mobile/practice/usage',
  practiceTranscription: '/api/mobile/practice/transcription',
  simulations: '/api/mobile/simulations',
  simulationRuns: (id: string) =>
    `/api/mobile/simulations/${encodeURIComponent(id)}/runs`,
  simulationTurns: (runId: string) =>
    `/api/mobile/simulations/runs/${encodeURIComponent(runId)}/turns`,
  chatStyle: '/api/mobile/preferences/chat-style',
  chatLanguage: '/api/mobile/preferences/chat-language',
  flashcards: '/api/mobile/flashcards',
  flashcard: (slug: string) =>
    `/api/mobile/flashcards/${encodeURIComponent(slug)}`,
  flashcardCardProgress: (slug: string, cardId: string) =>
    `/api/mobile/flashcards/${encodeURIComponent(slug)}/cards/${encodeURIComponent(cardId)}/progress`,
  vocabulary: '/api/mobile/vocabulary',
  vocabularySave: (id: string) =>
    `/api/mobile/vocabulary/${encodeURIComponent(id)}/save`,
  vocabularyPronunciation: (id: string) =>
    `/api/mobile/vocabulary/${encodeURIComponent(id)}/pronunciation`,
  privateLessons: '/api/mobile/private-lessons',
  privateLessonsCheckout: '/api/mobile/private-lessons/checkout',
  privateLessonPurchase: (sessionId: string) =>
    `/api/mobile/private-lessons/purchases/${encodeURIComponent(sessionId)}`,
  privateLessonsSchedulingLink: '/api/mobile/private-lessons/scheduling-link',
  privateLessonsBookings: '/api/mobile/private-lessons/bookings',
  teacherChat: '/api/mobile/teacher-chat',
  teacherChatUnread: '/api/mobile/teacher-chat/unread',
  plans: '/api/mobile/plans',
  plansCheckout: '/api/mobile/plans/checkout',
  planCheckoutStatus: (sessionId: string) =>
    `/api/mobile/plans/checkout/${encodeURIComponent(sessionId)}`,
  notifications: '/api/mobile/notifications',
  notificationsUnread: '/api/mobile/notifications/unread',
  notification: (id: string) =>
    `/api/mobile/notifications/${encodeURIComponent(id)}`,
  notificationRead: (id: string) =>
    `/api/mobile/notifications/${encodeURIComponent(id)}/read`,
  notificationsReadAll: '/api/mobile/notifications/read-all',
  pushTokens: '/api/mobile/push-tokens',
  billing: '/api/mobile/billing',
  billingPortal: '/api/mobile/billing/portal',
  preferences: '/api/mobile/preferences',
  sendCode: '/api/email/send',
  verifyCode: '/api/auth/verify-code',
  register: '/api/auth/register',
};

// Tamanho máximo de uma mensagem do aluno no chat com IA; o backend recusa
// acima disso
export const PRACTICE_MESSAGE_MAX_LENGTH = 500;
