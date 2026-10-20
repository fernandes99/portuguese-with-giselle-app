import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/theme';

// Quanto tempo a faixa fica aberta ao cumprir uma tarefa
const HIGHLIGHT_MS = 3000;

// Faixa das tarefas no topo da conversa: recolhida, mostra o progresso; um
// toque abre a lista. Quando um turno cumpre tarefas (`highlight`, que muda a
// cada turno), ela abre sozinha com elas destacadas e recolhe depois.
export function TaskStrip({
  tasks,
  completed,
  highlight,
}: {
  tasks: string[];
  completed: number[];
  highlight: { tasks: number[]; turn: number } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: abre só quando chega um turno com tarefa nova
  useEffect(() => {
    if (!highlight) {
      return;
    }
    setIsOpen(true);
    setHighlighted(highlight.tasks);
    AccessibilityInfo.announceForAccessibility(
      highlight.tasks
        .map((task) => `Tarefa cumprida: ${tasks[task]}`)
        .join('. ')
    );
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setIsOpen(false);
      setHighlighted([]);
    }, HIGHLIGHT_MS);
  }, [highlight?.turn]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  const done = tasks.filter((_, task) => completed.includes(task)).length;

  return (
    <View className="border-b border-gray-200 bg-white px-4 py-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tarefas, ${done} de ${tasks.length} cumpridas`}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((current) => !current)}
        className="gap-2"
      >
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 font-poppins-semibold text-sm text-gray-900">
            Tarefas {done}/{tasks.length}
          </Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.gray}
          />
        </View>
        <ProgressBar
          percentage={
            tasks.length ? Math.round((done / tasks.length) * 100) : 0
          }
        />
      </Pressable>

      {isOpen ? (
        <View className="mt-3 gap-2">
          {tasks.map((task, index) => {
            const isDone = completed.includes(index);
            const isNew = highlighted.includes(index);
            return (
              <View
                key={task}
                className={`flex-row items-start gap-3 rounded-lg px-2 py-1 ${isNew ? 'bg-green-50' : ''}`}
              >
                <Ionicons
                  name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isDone ? colors.green : colors.gray}
                />
                <Text
                  className={`flex-1 font-poppins text-sm ${isDone ? 'text-gray-500' : 'text-gray-800'}`}
                >
                  {task}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
