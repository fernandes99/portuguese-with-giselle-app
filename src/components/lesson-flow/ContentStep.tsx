import { Text, View } from 'react-native';

import { HtmlContent } from '@/components/lesson/HtmlContent';
import type { Lesson } from '@/services/lesson';

// Segunda parte da aula guiada: o texto da aula
export function ContentStep({ lesson }: { lesson: Lesson }) {
  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="font-poppins-semibold text-xs uppercase tracking-widest text-green-700">
          Conteúdo da aula
        </Text>
        <Text className="font-poppins-semibold text-2xl text-gray-900">
          {lesson.title}
        </Text>
      </View>

      {lesson.content ? <HtmlContent html={lesson.content} /> : null}
    </View>
  );
}
