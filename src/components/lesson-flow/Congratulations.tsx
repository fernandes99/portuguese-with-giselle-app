import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { LessonMaterials } from '@/components/lesson/LessonMaterials';
import { TranscriptionButton } from '@/components/lesson/TranscriptionButton';
import { Confetti } from '@/components/lesson-flow/Confetti';
import { DiscussionsSheet } from '@/components/lesson-flow/DiscussionsSheet';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import type { Lesson } from '@/services/lesson';
import { getFirstName } from '@/utils/format';
import completeSound from '@assets/sounds/lesson-complete.wav';

interface CongratulationsProps {
  lesson: Lesson;
  onContinue: () => void;
}

// Fim da aula guiada: comemoração, transcrição, recursos da aula e acesso às
// discussões
export function Congratulations({ lesson, onContinue }: CongratulationsProps) {
  const { user } = useAuth();
  const player = useAudioPlayer(completeSound);
  const [isDiscussionsOpen, setIsDiscussionsOpen] = useState(false);

  const pop = useSharedValue(0);

  // Som e animação tocam uma vez, na entrada
  useEffect(() => {
    player.play();
    pop.value = withSpring(1, { damping: 9, stiffness: 140 });
  }, [player, pop]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const firstName = getFirstName(user?.name);

  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="flex-grow gap-8 px-5 pb-8 pt-8">
        <View className="items-center gap-3">
          <Animated.View
            className="h-24 w-24 items-center justify-center rounded-full bg-green-100"
            style={trophyStyle}
          >
            <Ionicons name="trophy" size={48} color={colors.green} />
          </Animated.View>

          <Text className="mt-2 text-center font-poppins-bold text-3xl leading-10 text-gray-900">
            {firstName ? `Muito bem, ${firstName}!` : 'Muito bem!'}
          </Text>
          <Text className="text-center font-poppins text-base text-gray-600">
            Você completou a aula.
          </Text>

          <View className="mt-1 flex-row items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2">
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.darkGreen}
            />
            <Text
              numberOfLines={1}
              className="shrink font-poppins-semibold text-sm text-green-700"
            >
              {lesson.title}
            </Text>
          </View>
        </View>

        {lesson.hasTranscription ? (
          <TranscriptionButton lessonId={lesson.id} />
        ) : null}

        {lesson.materials.length > 0 ? (
          <LessonMaterials materials={lesson.materials} />
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => setIsDiscussionsOpen(true)}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
        >
          <Ionicons name="chatbubbles-outline" size={20} color={colors.gray} />
          <Text className="font-poppins-semibold text-base text-gray-900">
            Ver discussões da aula
          </Text>
        </Pressable>
      </ScrollView>

      <FlowFooter onPress={onContinue} />

      <Confetti />

      <DiscussionsSheet
        visible={isDiscussionsOpen}
        lessonId={lesson.id}
        onClose={() => setIsDiscussionsOpen(false)}
      />
    </View>
  );
}
