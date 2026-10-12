import { useRef } from 'react';
import { Text, View } from 'react-native';

import { LessonNode } from '@/components/learn/LessonNode';
import type { PathLesson, PathModule, PathTransition } from '@/utils/learn';

interface LearnModuleProps {
  module: PathModule;
  index: number;
  // Aulas a animar na volta de uma aula recém concluída
  transition: PathTransition | null;
  // Aula concluída com as opções de revisar e recomeçar abertas
  expandedLessonId: string | null;
  // Toque na aula: abre a atual, ou mostra as opções de uma concluída
  onPressLesson: (lesson: PathLesson) => void;
  onReviewLesson: (lesson: PathLesson) => void;
  onRestartLesson: (lesson: PathLesson) => void;
  // Posição vertical de cada aula dentro da lista, para a tela rolar até ela
  onLessonLayout: (lessonId: string, y: number) => void;
}

function getTransition(lesson: PathLesson, transition: PathTransition | null) {
  if (lesson.id === transition?.completedId) return 'completing';
  if (lesson.id === transition?.unlockedId) return 'unlocking';
  return undefined;
}

// Um módulo do caminho: cabeçalho e as aulas ligadas por uma linha
export function LearnModule({
  module,
  index,
  transition,
  expandedLessonId,
  onPressLesson,
  onReviewLesson,
  onRestartLesson,
  onLessonLayout,
}: LearnModuleProps) {
  // As medidas do módulo e das aulas chegam em ordem não garantida
  const moduleY = useRef<number | null>(null);
  const lessonYs = useRef(new Map<string, number>());

  function report(lessonId: string) {
    const y = lessonYs.current.get(lessonId);
    if (moduleY.current !== null && y !== undefined) {
      onLessonLayout(lessonId, moduleY.current + y);
    }
  }

  return (
    <View
      onLayout={(event) => {
        moduleY.current = event.nativeEvent.layout.y;
        for (const lessonId of lessonYs.current.keys()) {
          report(lessonId);
        }
      }}
    >
      <View className="mb-3 px-1">
        <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
          Módulo {index + 1}
        </Text>
        <Text className="mt-1 font-poppins-bold text-xl text-gray-900">
          {module.title}
        </Text>
        <Text className="font-poppins text-sm text-gray-600">
          {module.completedLessons}/{module.lessons.length}{' '}
          {module.lessons.length === 1 ? 'aula concluída' : 'aulas concluídas'}
        </Text>
      </View>

      {module.lessons.map((lesson, position) => (
        <LessonNode
          key={lesson.id}
          lesson={lesson}
          isLast={position === module.lessons.length - 1}
          transition={getTransition(lesson, transition)}
          isExpanded={lesson.id === expandedLessonId}
          onPress={() => onPressLesson(lesson)}
          onReview={() => onReviewLesson(lesson)}
          onRestart={() => onRestartLesson(lesson)}
          onLayout={(event) => {
            lessonYs.current.set(lesson.id, event.nativeEvent.layout.y);
            report(lesson.id);
          }}
        />
      ))}
    </View>
  );
}
