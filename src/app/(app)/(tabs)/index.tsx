import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  type ScrollViewInstance,
  Text,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CourseSelectSheet } from '@/components/learn/CourseSelectSheet';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { LearnModule } from '@/components/learn/LearnModule';
import { TabTopBar } from '@/components/TabTopBar';
import { TeacherChatButton } from '@/components/teacherChat/TeacherChatButton';
import { colors } from '@/constants/theme';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getCourses } from '@/services/courses';
import {
  getDefaultCourse,
  getLearnPath,
  getPathTransition,
  type PathLesson,
} from '@/utils/learn';

// Espaço deixado acima da aula quando a tela rola até ela
const SCROLL_MARGIN = 140;
// Tempo para a animação de desbloqueio terminar antes de os parâmetros saírem
const TRANSITION_DURATION = 2200;
// Limite para descartar os parâmetros quando não há o que animar
const PARAMS_TIMEOUT = 6000;

export default function LearnScreen() {
  const router = useRouter();
  // Preenchidos pela tela de parabéns da aula: o curso e a aula concluída
  const params = useLocalSearchParams<{
    course?: string;
    completed?: string;
  }>();
  const reducedMotion = useReducedMotion();
  const {
    data: courses,
    error,
    refreshing,
    refresh,
  } = useApiQuery(getCourses, 'Erro ao carregar os cursos.');

  // null enquanto o aluno não escolhe: vale o curso em andamento
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  // Aula concluída com as opções de revisar e recomeçar abertas
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const positions = useRef(new Map<string, number>());
  // O que já foi rolado: o curso (aula atual) e a aula concluída da volta
  const scrolledSlug = useRef<string | null>(null);
  const scrolledCompleted = useRef<string | null>(null);

  // A volta de uma aula abre no curso dela, mesmo com outro selecionado
  useEffect(() => {
    if (params.course) {
      setSelectedSlug(params.course);
    }
  }, [params.course]);

  const course = useMemo(() => {
    if (!courses) {
      return null;
    }

    const slug = params.course ?? selectedSlug;
    return (
      courses.find((item) => item.slug === slug) ?? getDefaultCourse(courses)
    );
  }, [courses, params.course, selectedSlug]);

  const path = useMemo(() => (course ? getLearnPath(course) : []), [course]);
  const courseSlug = course?.slug ?? null;

  const completedId = params.completed ?? null;
  // Só existe depois que os cursos recarregam com a aula já concluída
  const transition = useMemo(
    () => (completedId ? getPathTransition(path, completedId) : null),
    [path, completedId]
  );

  const currentId = useMemo(
    () =>
      path
        .flatMap((module) => module.lessons)
        .find((lesson) => lesson.status === 'current')?.id ?? null,
    [path]
  );

  const scrollTo = useCallback((lessonId: string) => {
    const y = positions.current.get(lessonId);
    if (y === undefined) {
      return false;
    }

    scrollRef.current?.scrollTo({
      y: Math.max(0, y - SCROLL_MARGIN),
      animated: false,
    });
    return true;
  }, []);

  // Rola uma vez até a aula concluída na volta de uma aula e, sem isso, uma
  // vez por curso até a aula atual. Não repete a cada recarga.
  const syncScroll = useCallback(() => {
    if (!courseSlug) {
      return;
    }

    if (completedId) {
      if (scrolledCompleted.current !== completedId && scrollTo(completedId)) {
        scrolledCompleted.current = completedId;
        scrolledSlug.current = courseSlug;
      }
      return;
    }

    if (
      currentId &&
      scrolledSlug.current !== courseSlug &&
      scrollTo(currentId)
    ) {
      scrolledSlug.current = courseSlug;
    }
  }, [courseSlug, completedId, currentId, scrollTo]);

  // As posições já são conhecidas quando o aluno volta de uma aula
  useEffect(() => {
    syncScroll();
  }, [syncScroll]);

  const handleLessonLayout = useCallback(
    (lessonId: string, y: number) => {
      positions.current.set(lessonId, y);
      syncScroll();
    },
    [syncScroll]
  );

  // Os parâmetros saem depois de usados, para a animação não repetir quando
  // a aba voltar ao foco
  useEffect(() => {
    if (!completedId) {
      return;
    }

    const timeout = setTimeout(
      () => router.setParams({ course: undefined, completed: undefined }),
      transition ? TRANSITION_DURATION : PARAMS_TIMEOUT
    );
    return () => clearTimeout(timeout);
  }, [completedId, transition, router]);

  // restart: refaz em etapas uma aula já concluída, sem desfazer a conclusão
  function openLesson(lesson: PathLesson, restart = false) {
    if (!courseSlug) {
      return;
    }

    setExpandedLessonId(null);
    router.push({
      pathname: '/lesson/[courseSlug]/[lessonSlug]',
      params: {
        courseSlug,
        lessonSlug: lesson.slug,
        ...(restart ? { restart: '1' } : {}),
      },
    });
  }

  // A aula atual abre direto; a concluída mostra as opções de revisar e
  // recomeçar, e um segundo toque as esconde
  function pressLesson(lesson: PathLesson) {
    if (lesson.status === 'completed') {
      setExpandedLessonId((current) =>
        current === lesson.id ? null : lesson.id
      );
      return;
    }

    openLesson(lesson);
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="flex-grow gap-8 px-5 pb-8 pt-3"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        <TabTopBar />

        {error ? (
          <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <Text className="font-poppins text-sm text-red-700">{error}</Text>
            <Button variant="link" label="Tentar de novo" onPress={refresh} />
          </View>
        ) : null}

        {course ? (
          <LearnHeader
            course={course}
            canSwitch={(courses?.length ?? 0) > 1}
            onSwitch={() => setIsSelectOpen(true)}
          />
        ) : null}

        {/* A key refaz as medidas ao trocar de curso */}
        {path.map((module, index) => (
          <LearnModule
            key={`${courseSlug}-${module.id}`}
            module={module}
            index={index}
            // Com menos movimento, o caminho já aparece no estado final
            transition={reducedMotion ? null : transition}
            expandedLessonId={expandedLessonId}
            onPressLesson={pressLesson}
            onReviewLesson={(lesson) => openLesson(lesson)}
            onRestartLesson={(lesson) => openLesson(lesson, true)}
            onLessonLayout={handleLessonLayout}
          />
        ))}

        {courses?.length === 0 ? (
          <Text className="text-center font-poppins text-base text-gray-600">
            Nenhum curso disponível no momento.
          </Text>
        ) : null}

        {!courses && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.green} />
          </View>
        ) : null}
      </ScrollView>

      {/* Flutua no canto inferior direito, acima do menu */}
      <TeacherChatButton />

      {courses && course ? (
        <CourseSelectSheet
          visible={isSelectOpen}
          courses={courses}
          selectedSlug={course.slug}
          onClose={() => setIsSelectOpen(false)}
          onSelect={(selected) => {
            setIsSelectOpen(false);
            if (selected.slug !== course.slug) {
              setSelectedSlug(selected.slug);
              scrollRef.current?.scrollTo({ y: 0, animated: false });
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}
