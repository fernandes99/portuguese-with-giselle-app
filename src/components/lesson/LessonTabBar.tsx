import { Pressable, Text, View } from 'react-native';

export type LessonTabKey =
  'content' | 'activities' | 'materials' | 'discussions';

const TABS: { key: LessonTabKey; label: string }[] = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'activities', label: 'Atividades' },
  { key: 'materials', label: 'Recursos' },
  { key: 'discussions', label: 'Discussão' },
];

interface LessonTabBarProps {
  active: LessonTabKey;
  onChange: (tab: LessonTabKey) => void;
}

export function LessonTabBar({ active, onChange }: LessonTabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row border-b border-gray-200 bg-cream px-2"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            className="flex-1 items-center pt-3"
          >
            <Text
              numberOfLines={1}
              className={`pb-2.5 text-sm ${isActive ? 'font-poppins-semibold text-gray-900' : 'font-poppins-medium text-gray-500'}`}
            >
              {tab.label}
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
