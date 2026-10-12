import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ClassicLesson, LessonHeader } from '@/components/lesson/ClassicLesson';
import { GuidedLesson } from '@/components/lesson-flow/GuidedLesson';
import { colors } from '@/constants/theme';
import { useLesson } from '@/hooks/useLesson';

interface LessonRouteProps {
  courseSlug: string;
  lessonSlug: string;
}

// Carrega a aula e escolhe a tela: o fluxo guiado para a aula que o aluno
// ainda não concluiu, a tela com abas para a que ele já concluiu.
function LessonRoute({ courseSlug, lessonSlug }: LessonRouteProps) {
  const { data, error, locked, reload, setCompleted, saveActivityProgress } =
    useLesson(courseSlug, lessonSlug);

  // Escolhida uma vez, na carga: concluir a aula não troca a tela no meio
  const mode = useRef<'guided' | 'classic' | null>(null);
  if (data && !mode.current) {
    mode.current = data.lesson.isCompleted ? 'classic' : 'guided';
  }

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LessonHeader title="" />
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

  if (mode.current === 'guided') {
    return (
      <GuidedLesson
        courseSlug={courseSlug}
        data={data}
        setCompleted={setCompleted}
        saveActivityProgress={saveActivityProgress}
      />
    );
  }

  return (
    <ClassicLesson
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      data={data}
      setCompleted={setCompleted}
      saveActivityProgress={saveActivityProgress}
    />
  );
}

export default function LessonScreen() {
  const { courseSlug, lessonSlug } = useLocalSearchParams<{
    courseSlug: string;
    lessonSlug: string;
  }>();

  // A key recomeça a escolha quando a tela com abas troca de aula
  return (
    <LessonRoute
      key={lessonSlug}
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
    />
  );
}
