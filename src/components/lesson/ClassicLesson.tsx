import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, type ReactNode, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { LessonActivities } from '@/components/activity/LessonActivities';
import { CourseOutlineSheet } from '@/components/lesson/CourseOutlineSheet';
import { LessonContent } from '@/components/lesson/LessonContent';
import { LessonDiscussions } from '@/components/lesson/LessonDiscussions';
import { LessonMaterials } from '@/components/lesson/LessonMaterials';
import { LessonMedia } from '@/components/lesson/LessonMedia';
import {
  getAdjacentTab,
  LessonTabBar,
  type LessonTabKey,
} from '@/components/lesson/LessonTabBar';
import { colors } from '@/constants/theme';
import { getErrorMessage } from '@/lib/api';
import {
  KEYBOARD_BOTTOM_OFFSET,
  KeyboardAwareScrollView,
} from '@/lib/keyboard';
import type { LessonDetail } from '@/services/lesson';
import { findLessonPosition } from '@/utils/lesson';

export function HeaderButton({
  icon,
  label,
  filled = false,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  // Cinza claro e sem borda, como os balões das telas de conversa
  filled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className={`h-10 w-10 items-center justify-center rounded-full ${filled ? 'bg-surface active:bg-surface-pressed' : 'border border-gray-200 bg-white active:bg-gray-100'}`}
    >
      <Ionicons name={icon} size={20} color={colors.gray} />
    </Pressable>
  );
}

// Cabeçalho da aula: voltar, título do curso (com uma linha opcional
// abaixo) e um botão opcional à direita
export function LessonHeader({
  title,
  subtitle,
  right,
  avatar,
  filled = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  // Foto à esquerda do título; com ela, o título fica alinhado à esquerda
  avatar?: ReactNode;
  // Botão de voltar cinza e sem borda (HeaderButton `filled`)
  filled?: boolean;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 px-4 py-2">
      <HeaderButton
        icon="arrow-back"
        label="Voltar"
        filled={filled}
        onPress={() => router.back()}
      />
      <View
        className={`flex-1 ${avatar ? 'flex-row items-center gap-2.5' : 'items-center'}`}
      >
        {avatar}
        <View className={avatar ? 'flex-1' : 'items-center'}>
          <Text
            numberOfLines={1}
            className={`font-poppins-semibold text-sm text-gray-900 ${avatar ? '' : 'text-center'}`}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className={`font-poppins text-xs text-gray-500 ${avatar ? '' : 'text-center'}`}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {/* Mantém o título centralizado quando não há botão à direita */}
      {right ?? <View className="w-10" />}
    </View>
  );
}

// Quanto o dedo precisa andar para os lados para trocar de aba
const SWIPE_DISTANCE = 60;

interface ClassicLessonProps {
  courseSlug: string;
  lessonSlug: string;
  data: LessonDetail;
  setCompleted: (completed: boolean) => Promise<void>;
  saveActivityProgress: (activityId: string, completed: boolean) => void;
}

// Tela de aula com abas, usada nas aulas que o aluno já concluiu
export function ClassicLesson({
  courseSlug,
  lessonSlug,
  data,
  setCompleted,
  saveActivityProgress,
}: ClassicLessonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LessonTabKey>('content');

  // Deslizar para os lados troca de aba. Só reage a um gesto claramente
  // horizontal, para não brigar com a rolagem vertical da tela.
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-30, 30])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (Math.abs(event.translationX) < SWIPE_DISTANCE) {
            return;
          }

          const direction = event.translationX < 0 ? 1 : -1;
          setActiveTab((current) => getAdjacentTab(current, direction));
        }),
    []
  );
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  function openLesson(slug: string) {
    setIsOutlineOpen(false);
    if (slug === lessonSlug) {
      return;
    }

    // replace: voltar sai da aula em vez de percorrer as aulas visitadas
    router.replace({
      pathname: '/lesson/[courseSlug]/[lessonSlug]',
      params: { courseSlug, lessonSlug: slug },
    });
  }

  async function handleToggleCompleted() {
    if (isSaving) {
      return;
    }

    setActionError('');
    setIsSaving(true);
    try {
      await setCompleted(!data.lesson.isCompleted);
    } catch (err) {
      setActionError(
        getErrorMessage(err, 'Erro ao concluir a aula. Tente novamente.')
      );
    } finally {
      setIsSaving(false);
    }
  }

  const { course, lesson, nextLesson } = data;
  const position = findLessonPosition(course, lesson.slug);
  const nextPosition = nextLesson
    ? findLessonPosition(course, nextLesson.slug)
    : null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LessonHeader
        title={course.title}
        right={
          <HeaderButton
            icon="list"
            label="Ver todas as aulas do curso"
            onPress={() => setIsOutlineOpen(true)}
          />
        }
      />

      {/* Rola o campo focado (discussões) para cima do teclado */}
      <KeyboardAwareScrollView
        // A barra de abas gruda no topo enquanto o conteúdo rola
        stickyHeaderIndices={[1]}
        bottomOffset={KEYBOARD_BOTTOM_OFFSET}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Sempre um View: os índices dos filhos definem a barra que gruda */}
        <View>
          <LessonMedia key={lesson.id} lesson={lesson} />
        </View>

        <LessonTabBar active={activeTab} onChange={setActiveTab} />

        <GestureDetector gesture={swipe}>
          {/* Altura mínima para o gesto funcionar também em abas curtas */}
          <View collapsable={false} className="min-h-[420px] px-5 pt-5">
            {activeTab === 'content' ? (
              <LessonContent
                lesson={lesson}
                moduleTitle={position?.moduleTitle ?? null}
                nextLesson={nextLesson}
                nextLessonInfo={nextPosition}
                isSaving={isSaving}
                error={actionError}
                onToggleCompleted={handleToggleCompleted}
                onOpenNextLesson={() =>
                  nextLesson && openLesson(nextLesson.slug)
                }
              />
            ) : null}

            {activeTab === 'materials' ? (
              <LessonMaterials materials={lesson.materials} />
            ) : null}

            {/* Fica montada mesmo com outra aba aberta, para o aluno não
              perder as respostas ao consultar o conteúdo */}
            <View className={activeTab === 'activities' ? '' : 'hidden'}>
              <LessonActivities
                key={lesson.id}
                activities={lesson.activities}
                onProgress={saveActivityProgress}
              />
            </View>

            {activeTab === 'discussions' ? (
              <LessonDiscussions key={lesson.id} lessonId={lesson.id} />
            ) : null}
          </View>
        </GestureDetector>
      </KeyboardAwareScrollView>

      <CourseOutlineSheet
        visible={isOutlineOpen}
        course={course}
        currentLessonId={lesson.id}
        onClose={() => setIsOutlineOpen(false)}
        onSelectLesson={(target) => openLesson(target.slug)}
      />
    </SafeAreaView>
  );
}
