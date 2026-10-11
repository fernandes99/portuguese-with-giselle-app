import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ComponentProps, type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { LessonActivities } from '@/components/activity/LessonActivities';
import { Button } from '@/components/Button';
import { CourseOutlineSheet } from '@/components/lesson/CourseOutlineSheet';
import { LessonContent } from '@/components/lesson/LessonContent';
import { LessonDiscussions } from '@/components/lesson/LessonDiscussions';
import { LessonMaterials } from '@/components/lesson/LessonMaterials';
import { LessonMedia } from '@/components/lesson/LessonMedia';
import {
  LessonTabBar,
  type LessonTabKey,
} from '@/components/lesson/LessonTabBar';
import { colors } from '@/constants/theme';
import { useLesson } from '@/hooks/useLesson';
import { getErrorMessage } from '@/lib/api';
import { findLessonPosition } from '@/utils/lesson';

function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white active:bg-gray-100"
    >
      <Ionicons name={icon} size={20} color={colors.gray} />
    </Pressable>
  );
}

export default function LessonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { courseSlug, lessonSlug } = useLocalSearchParams<{
    courseSlug: string;
    lessonSlug: string;
  }>();

  const { data, error, locked, reload, setCompleted, saveActivityProgress } =
    useLesson(courseSlug, lessonSlug);
  const [activeTab, setActiveTab] = useState<LessonTabKey>('content');
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
    if (!data || isSaving) {
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

  function renderHeader(title: string, right?: ReactNode) {
    return (
      <View className="flex-row items-center gap-3 px-4 py-2">
        <HeaderButton
          icon="arrow-back"
          label="Voltar"
          onPress={() => router.back()}
        />
        <Text
          numberOfLines={1}
          className="flex-1 text-center font-poppins-semibold text-sm text-gray-900"
        >
          {title}
        </Text>
        {/* Mantém o título centralizado quando não há botão à direita */}
        {right ?? <View className="w-10" />}
      </View>
    );
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {renderHeader('')}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          {locked ? (
            <>
              <Ionicons name="lock-closed" size={40} color={colors.gray} />
              <Text className="text-center font-poppins-bold text-xl text-gray-900">
                Conteúdo exclusivo para alunos
              </Text>
              <Text className="text-center font-poppins text-base text-gray-600">
                Esta aula está disponível apenas para alunos matriculados.
              </Text>
            </>
          ) : error ? (
            <>
              <Text className="text-center font-poppins text-base text-red-700">
                {error}
              </Text>
              <Button variant="link" label="Tentar de novo" onPress={reload} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colors.green} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { course, lesson, nextLesson } = data;
  const position = findLessonPosition(course, lesson.slug);
  const nextPosition = nextLesson
    ? findLessonPosition(course, nextLesson.slug)
    : null;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {renderHeader(
        course.title,
        <HeaderButton
          icon="list"
          label="Ver todas as aulas do curso"
          onPress={() => setIsOutlineOpen(true)}
        />
      )}

      <ScrollView
        // A barra de abas gruda no topo enquanto o conteúdo rola
        stickyHeaderIndices={[1]}
        // Para os campos das atividades não ficarem atrás do teclado
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Sempre um View: os índices dos filhos definem a barra que gruda */}
        <View>
          <LessonMedia key={lesson.id} lesson={lesson} />
        </View>

        <LessonTabBar active={activeTab} onChange={setActiveTab} />

        <View className="px-5 pt-5">
          {activeTab === 'content' ? (
            <LessonContent
              lesson={lesson}
              moduleTitle={position?.moduleTitle ?? null}
              nextLesson={nextLesson}
              nextLessonInfo={nextPosition}
              isSaving={isSaving}
              error={actionError}
              onToggleCompleted={handleToggleCompleted}
              onOpenNextLesson={() => nextLesson && openLesson(nextLesson.slug)}
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
      </ScrollView>

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
