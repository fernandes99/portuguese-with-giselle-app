import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

import teacherAvatar from '@assets/teacher-avatar.jpg';

import { colors } from '@/constants/theme';
import { formatMessageTime } from '@/utils/teacherChat';

// Foto da professora Giselle, usada no cabeçalho e ao lado das falas dela
export function TeacherAvatar({ size }: { size: number }) {
  return (
    <Image
      source={teacherAvatar}
      accessibilityIgnoresInvertColors
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

// Fala da professora, à esquerda, com a foto dela
export function TeacherMessage({
  content,
  createdAt,
}: {
  content: string;
  createdAt: string;
}) {
  return (
    <View className="max-w-[88%] flex-row items-end gap-2 self-start">
      <TeacherAvatar size={32} />
      <View className="shrink items-start">
        <View className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3">
          <Text className="font-poppins text-[15px] leading-6 text-gray-900">
            {content}
          </Text>
        </View>
        <Text className="mt-1 font-poppins text-[11px] text-gray-500">
          {formatMessageTime(createdAt)}
        </Text>
      </View>
    </View>
  );
}

interface StudentMessageProps {
  content: string;
  // sending: aguardando o backend; failed: o envio falhou
  status: 'sending' | 'sent' | 'failed';
  // Só as mensagens já gravadas têm horário
  createdAt?: string;
  onRetry?: () => void;
}

// Fala do aluno, à direita, com o horário e a situação do envio
export function StudentMessage({
  content,
  status,
  createdAt,
  onRetry,
}: StudentMessageProps) {
  return (
    <View className="max-w-[88%] items-end self-end">
      <View
        className={`rounded-2xl rounded-br-md px-4 py-3 ${status === 'failed' ? 'bg-red-500' : 'bg-green-600'} ${status === 'sending' ? 'opacity-60' : ''}`}
      >
        <Text className="font-poppins text-[15px] leading-6 text-white">
          {content}
        </Text>
      </View>

      {status === 'sending' ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-1 font-poppins text-[11px] text-gray-500"
        >
          Enviando...
        </Text>
      ) : null}

      {status === 'sent' && createdAt ? (
        <View className="mt-1 flex-row items-center gap-1">
          <Text className="font-poppins text-[11px] text-gray-500">
            {formatMessageTime(createdAt)}
          </Text>
          <Ionicons name="checkmark" size={13} color={colors.green} />
          <Text className="font-poppins text-[11px] text-gray-500">
            Enviada
          </Text>
        </View>
      ) : null}

      {status === 'failed' ? (
        <View className="mt-1 flex-row items-center gap-2">
          <Text
            accessibilityLiveRegion="polite"
            className="font-poppins text-[11px] text-red-700"
          >
            Não foi possível enviar
          </Text>
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
            <Text className="font-poppins-semibold text-xs text-green-700 underline">
              Tentar de novo
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
