import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EmptyState } from '@/components/lesson/EmptyState';
import { HtmlContent } from '@/components/lesson/HtmlContent';
import { LessonMaterials } from '@/components/lesson/LessonMaterials';
import { colors } from '@/constants/theme';
import type { Lesson, LessonLink } from '@/services/lesson';

type TabKey = 'content' | 'activities' | 'materials' | 'discussions';

const TABS: {
  key: TabKey;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'content', label: 'Content', icon: 'document-text-outline' },
  { key: 'activities', label: 'Activities', icon: 'clipboard-outline' },
  { key: 'materials', label: 'Resources', icon: 'folder-open-outline' },
  { key: 'discussions', label: 'Discussions', icon: 'chatbubbles-outline' },
];

interface LessonTabsProps {
  lesson: Lesson;
  prevLesson: LessonLink | null;
  nextLesson: LessonLink | null;
  onOpenLesson: (lesson: LessonLink) => void;
}

function TabContent({ tab, lesson }: { tab: TabKey; lesson: Lesson }) {
  if (tab === 'content') {
    return lesson.content ? (
      <HtmlContent html={lesson.content} />
    ) : (
      <Text className="font-poppins text-base text-gray-600">
        No description available.
      </Text>
    );
  }

  if (tab === 'materials') {
    return <LessonMaterials materials={lesson.materials} />;
  }

  // Atividades e discussões ainda não foram portadas para o app
  if (tab === 'activities') {
    return lesson.activitiesCount === 0 ? (
      <EmptyState title="No activity available" />
    ) : (
      <EmptyState
        title={`${lesson.activitiesCount} ${lesson.activitiesCount === 1 ? 'activity' : 'activities'} in this lesson`}
        text="Activities are not available in the app yet. You can do them on the website."
      />
    );
  }

  return (
    <EmptyState
      title="Discussions are coming soon"
      text="For now, you can join the discussion on the website."
    />
  );
}

export function LessonTabs({
  lesson,
  prevLesson,
  nextLesson,
  onOpenLesson,
}: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('content');

  return (
    <View className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4 py-3"
        className="border-b border-gray-100"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${isActive ? 'bg-blue-600' : 'bg-gray-100'}`}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? colors.white : colors.placeholder}
              />
              <Text
                className={`font-poppins-medium text-sm ${isActive ? 'text-white' : 'text-gray-600'}`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="p-4">
        <TabContent tab={activeTab} lesson={lesson} />
      </View>

      {prevLesson || nextLesson ? (
        <View className="gap-3 border-t border-gray-100 p-4">
          {nextLesson ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenLesson(nextLesson)}
              className="items-center rounded-lg bg-blue-600 px-4 py-3 active:bg-blue-700"
            >
              <Text className="font-poppins-medium text-sm text-white">
                Next lesson →
              </Text>
            </Pressable>
          ) : null}
          {prevLesson ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onOpenLesson(prevLesson)}
              className="items-center rounded-lg px-4 py-3 active:bg-gray-50"
            >
              <Text className="font-poppins-medium text-sm text-gray-700">
                ← Previous lesson
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
