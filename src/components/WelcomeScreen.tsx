import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import groupClass from '@assets/onboarding/group-class.jpg';
import lessons from '@assets/onboarding/lessons.jpg';
import teacher from '@assets/onboarding/teacher.jpg';
import logo from '@assets/logo.png';

import { colors } from '@/constants/theme';

interface Slide {
  image: ImageSourcePropType;
  icon: keyof typeof Ionicons.glyphMap;
  chip: string;
  eyebrow: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    image: teacher,
    icon: 'hand-left-outline',
    chip: 'Com a professora Giselle',
    eyebrow: 'Seja bem-vindo',
    title: 'Aprenda português do Brasil',
    description:
      'Um curso feito para estrangeiros, com uma professora brasileira ao seu lado do básico à conversa.',
  },
  {
    image: lessons,
    icon: 'play-outline',
    chip: 'Aulas onde você estiver',
    eyebrow: 'Aprenda no seu ritmo',
    title: 'Português que cabe na sua rotina',
    description:
      'Aulas curtas e objetivas, com atividades para praticar, no horário que funcionar melhor para você.',
  },
  {
    image: groupClass,
    icon: 'trophy-outline',
    chip: 'Progresso constante',
    eyebrow: 'Evolução visível',
    title: 'Acompanhe cada conquista',
    description:
      'Veja seu progresso, mantenha sua sequência de estudos e tire dúvidas em cada aula.',
  },
];

interface WelcomeScreenProps {
  onDone: () => void;
}

// Introdução da primeira abertura do app: slides com os benefícios do curso.
export function WelcomeScreen({ onDone }: WelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  function goTo(next: number) {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index && next >= 0 && next < SLIDES.length) {
      setIndex(next);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 pt-3">
        <Image
          source={logo}
          accessibilityLabel="Portuguese With Giselle"
          resizeMode="contain"
          className="h-9 w-40"
        />
        <Pressable accessibilityRole="button" onPress={onDone} hitSlop={12}>
          <Text className="font-poppins-medium text-sm text-gray-500">
            Pular
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width }} className="px-6 pt-5">
            <View className="flex-1">
              {/* Anel decorativo que escapa do canto da foto */}
              <View className="absolute -right-5 -top-5 h-40 w-40 rounded-full border-[18px] border-green-100" />
              <View className="flex-1 overflow-hidden rounded-3xl bg-gray-100">
                <Image
                  source={slide.image}
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  className="h-full w-full"
                />
                <View className="absolute bottom-4 left-4 flex-row items-center gap-2 rounded-xl bg-gray-900/70 px-3 py-2.5">
                  <Ionicons name={slide.icon} size={16} color={colors.white} />
                  <Text className="font-poppins-semibold text-xs text-white">
                    {slide.chip}
                  </Text>
                </View>
              </View>
            </View>

            <View className="pb-2 pt-7">
              <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
                {slide.eyebrow}
              </Text>
              <Text className="mt-2 font-poppins-semibold text-3xl leading-10 text-gray-900">
                {slide.title}
              </Text>
              <Text className="mt-3 font-poppins text-base leading-6 text-gray-600">
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
        <View className="flex-row items-center gap-2">
          {SLIDES.map((slide, position) => (
            <View
              key={slide.title}
              className={`h-2 rounded-full ${position === index ? 'w-6 bg-green-600' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </View>

        <View className="flex-row items-center gap-3">
          {!isFirst && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={() => goTo(index - 1)}
              className="h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white active:bg-gray-50"
            >
              <Ionicons name="arrow-back" size={20} color={colors.darkGreen} />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={isLast ? onDone : () => goTo(index + 1)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 active:bg-green-700"
          >
            <Text className="font-poppins-semibold text-base text-white">
              {isLast ? 'Começar agora' : 'Próximo'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
