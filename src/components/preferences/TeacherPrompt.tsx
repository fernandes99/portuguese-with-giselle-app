import { Text, View } from 'react-native';

import { TeacherAvatar } from '@/components/teacherChat/MessageBubble';

// A professora fazendo a pergunta do passo, num balão ao lado da foto
export function TeacherPrompt({ text }: { text: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <TeacherAvatar size={56} />
      <View
        accessible
        accessibilityRole="header"
        className="flex-1 rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3"
      >
        <Text className="font-poppins-semibold text-base leading-6 text-gray-900">
          {text}
        </Text>
      </View>
    </View>
  );
}
