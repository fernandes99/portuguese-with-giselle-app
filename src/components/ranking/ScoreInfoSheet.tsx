import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useModalBottomInset } from '@/hooks/useModalBottomInset';
import type { RankingScoreRules } from '@/services/ranking';

import { ScoreValue } from './ScoreValue';

function RuleRow({ label, score }: { label: string; score: number }) {
  return (
    <View className="flex-row items-center justify-between gap-3 border-b border-gray-100 py-2.5">
      <Text className="flex-1 font-poppins text-sm text-gray-700">{label}</Text>
      <ScoreValue score={score} />
    </View>
  );
}

// Como se ganha score, aberta pelo botão de informação do ranking. Os valores
// vêm da rota, que os lê das mesmas regras que dão o score.
export function ScoreInfoSheet({
  rules,
  visible,
  onClose,
}: {
  rules: RankingScoreRules | null;
  visible: boolean;
  onClose: () => void;
}) {
  const bottomInset = useModalBottomInset();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Fechar"
          onPress={onClose}
          className="absolute inset-0 bg-black/30"
        />

        <View
          className="max-h-[85%] rounded-t-3xl bg-white px-5 pt-4"
          style={{ paddingBottom: bottomInset + 24 }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text className="font-poppins-bold text-xl text-gray-900">
              Como ganhar pontos
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={onClose}
              hitSlop={12}
              className="h-9 w-9 items-center justify-center rounded-full bg-surface active:bg-surface-pressed"
            >
              <Ionicons name="close" size={20} color={colors.gray} />
            </Pressable>
          </View>

          {rules ? (
            <ScrollView className="mt-3" contentContainerClassName="pb-2">
              <RuleRow label="Aula concluída" score={rules.lesson} />
              <RuleRow label="Atividade concluída" score={rules.activity} />
              <RuleRow
                label="Flashcard aprendido (cada card)"
                score={rules.flashcard}
              />
              <RuleRow label="Módulo concluído" score={rules.module} />
              <RuleRow label="Curso concluído" score={rules.course} />

              {rules.achievements.length > 0 ? (
                <>
                  <Text className="mt-5 font-poppins-semibold text-sm text-gray-900">
                    Conquistas
                  </Text>
                  {rules.achievements.map((achievement) => (
                    <RuleRow
                      key={achievement.title}
                      label={achievement.title}
                      score={achievement.score}
                    />
                  ))}
                </>
              ) : null}

              <View className="mt-5 gap-1.5">
                <Text className="font-poppins text-sm text-gray-600">
                  • Cada item conta uma vez, mesmo se você fizer de novo.
                </Text>
                <Text className="font-poppins text-sm text-gray-600">
                  • O ranking do mês recomeça no dia 1º (horário de Brasília).
                </Text>
                <Text className="font-poppins text-sm text-gray-600">
                  • A professora e a equipe não entram no ranking.
                </Text>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
