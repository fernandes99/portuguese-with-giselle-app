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

// Imagem ou áudio anexado a uma pergunta ou alternativa
export interface ActivityFile {
  url: string;
  mimeType: string;
}

interface ActivityBase {
  id: string;
  title: string;
  // HTML com o enunciado
  content: string | null;
  isCompleted: boolean;
}

export interface ChoiceActivity extends ActivityBase {
  type: 'multiple_choice' | 'true_or_false';
  exercises: {
    id: string;
    question: string;
    file: ActivityFile | null;
    alternatives: {
      id: string;
      title: string;
      isCorrect: boolean;
      file: ActivityFile | null;
    }[];
  }[];
}

export interface SentenceActivity extends ActivityBase {
  type: 'fill_blank' | 'drag_drop';
  // Frases com as respostas marcadas como {{resposta}}
  exercises: { id: string; sentence: string }[];
}

// Atividade de vocabulário: as perguntas chegam prontas do site (contrato em
// .specs/vocabulary-activities/architecture.md do site)
export type VocabularyExerciseType =
  | 'meaning_choice'
  | 'term_choice'
  | 'listen_choice'
  | 'listen_write'
  | 'translate_write'
  | 'match_pairs'
  | 'listen_example'
  | 'speak';

// O que a tela mostra depois da resposta, certa ou errada
export interface VocabularyAnswer {
  vocabularyId: string;
  term: string;
  meaning: string;
  // Em destaque, quando existe; o completo vem abaixo
  meaningShort: string | null;
  termAudioUrl: string | null;
  example: string;
  exampleTranslation: string;
}

export interface VocabularyPrompt {
  // A palavra, o significado ou nada (só áudio)
  text: string | null;
  // Tocado ao abrir a pergunta (nos tipos de ouvir) e pelo botão de ouvir
  audioUrl: string | null;
}

// Cada pergunta diz o próprio tipo: a atividade pode misturar vários, e a
// tela usa o tipo para o texto do topo e para tocar o áudio ao abrir
export type VocabularyQuestion =
  | {
      kind: 'choice';
      exerciseType:
        'meaning_choice' | 'term_choice' | 'listen_choice' | 'listen_example';
      id: string;
      prompt: VocabularyPrompt;
      options: { id: string; text: string }[];
      correctOptionId: string;
      answer: VocabularyAnswer;
    }
  | {
      kind: 'write';
      exerciseType: 'listen_write' | 'translate_write';
      id: string;
      prompt: VocabularyPrompt;
      // Já normalizadas
      acceptedAnswers: string[];
      answer: VocabularyAnswer;
    }
  | {
      kind: 'pairs';
      exerciseType: 'match_pairs';
      id: string;
      pairs: { vocabularyId: string; term: string; meaning: string }[];
    }
  | {
      kind: 'speak';
      exerciseType: 'speak';
      id: string;
      // Para a rota de pronúncia do vocabulário
      vocabularyId: string;
      term: string;
      pronunciation: string | null;
      termAudioUrl: string | null;
      answer: VocabularyAnswer;
    };

export interface VocabularyActivity extends ActivityBase {
  type: 'vocabulary';
  // Os tipos marcados no Dato; cada palavra aparece em um deles
  exerciseTypes: VocabularyExerciseType[];
  questions: VocabularyQuestion[];
}

export type Activity = ChoiceActivity | SentenceActivity | VocabularyActivity;

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
  activities: Activity[];
  isCompleted: boolean;
  // Há PDF da transcrição para baixar. Opcional: o site antigo não manda
  hasTranscription?: boolean;
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

// URL assinada do PDF da transcrição, válida por 60 segundos
export function getLessonTranscriptionUrl(token: string, lessonId: string) {
  return api<{ url: string }>(API_ROUTES.lessonTranscription(lessonId), {
    token,
  });
}

// completed: false ao começar ou errar, true ao acertar tudo
export function setActivityProgress(
  token: string,
  activityId: string,
  completed: boolean
) {
  return api<{ isCompleted: boolean }>(
    API_ROUTES.activityProgress(activityId),
    {
      method: 'POST',
      body: { completed },
      token,
    }
  );
}
