import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export type LessonTabKey =
  'content' | 'activities' | 'materials' | 'discussions';

const TABS: LessonTabKey[] = [
  'content',
  'activities',
  'materials',
  'discussions',
];

// Aba vizinha na ordem da barra; nas pontas, continua na mesma
export function getAdjacentTab(tab: LessonTabKey, direction: 1 | -1) {
  return TABS[TABS.indexOf(tab) + direction] ?? tab;
}

interface LessonTabBarProps {
  active: LessonTabKey;
  onChange: (tab: LessonTabKey) => void;
}

export function LessonTabBar({ active, onChange }: LessonTabBarProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-b border-gray-200 bg-background px-2"
    >
      {TABS.map((tab) => {
        const isActive = tab === active;

        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab)}
            className="flex-1 items-center pt-3"
          >
            <Text
              numberOfLines={1}
              className={`pb-2.5 text-sm ${isActive ? 'font-poppins-semibold text-gray-900' : 'font-poppins-medium text-gray-500'}`}
            >
              {t(`lesson.lesson.tabs.${tab}`)}
            </Text>
            <View
              className={`h-0.5 w-full rounded-full ${isActive ? 'bg-green-600' : 'bg-transparent'}`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
