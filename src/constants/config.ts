export const SITE_URL = 'https://portuguesewithgiselle.com';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || SITE_URL).replace(
  /\/$/,
  ''
);

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

export const LINKS = {
  terms: `${SITE_URL}/terms`,
  privacy: `${SITE_URL}/privacy`,
};

// Rotas do backend (src/config/routes/api.routes.ts no repositório do site)
export const API_ROUTES = {
  login: '/api/mobile/auth/login',
  google: '/api/mobile/auth/google',
  me: '/api/mobile/auth/me',
  dashboard: '/api/mobile/dashboard',
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
  sendCode: '/api/email/send',
  verifyCode: '/api/auth/verify-code',
  register: '/api/auth/register',
};
