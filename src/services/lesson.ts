import { API_ROUTES } from '@/constants/config';
import { api } from '@/lib/api';

export interface LessonLink {
  slug: string;
  title: string;
}

export interface OutlineLesson {
  id: string;
  slug: string;
  title: string;
  duration: number;
  isCompleted: boolean;
}

export interface OutlineModule {
  id: string;
  title: string;
  // Soma da duração das aulas, em minutos
  duration: number;
  lessons: OutlineLesson[];
}

export interface CourseOutline {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  totalLessons: number;
  completedLessons: number;
  modules: OutlineModule[];
}

export interface LessonMaterial {
  id: string;
  title: string;
  url: string;
  // 'file' para arquivos do DatoCMS; os demais são os tipos de link externo
  type: 'file' | 'pdf' | 'img' | 'video' | 'gif' | 'audio' | 'hyperlink';
  mimeType: string | null;
  size: number | null;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: number;
  imageUrl: string | null;
  videoId: string | null;
  // Apresentação do Canva usada quando a aula não tem vídeo
  canvaUrl: string | null;
  // HTML, com tooltips no formato \\termo==tradução\\
  content: string | null;
  materials: LessonMaterial[];
  activitiesCount: number;
  isCompleted: boolean;
}

export interface LessonDetail {
  course: CourseOutline;
  lesson: Lesson;
  prevLesson: LessonLink | null;
  nextLesson: LessonLink | null;
}

export function getLesson(
  token: string,
  courseSlug: string,
  lessonSlug: string
) {
  return api<LessonDetail>(API_ROUTES.lesson(courseSlug, lessonSlug), {
    token,
  });
}

export function setLessonCompleted(
  token: string,
  lessonId: string,
  completed: boolean
) {
  return api<{ isCompleted: boolean }>(API_ROUTES.lessonComplete(lessonId), {
    method: completed ? 'POST' : 'DELETE',
    token,
  });
}
