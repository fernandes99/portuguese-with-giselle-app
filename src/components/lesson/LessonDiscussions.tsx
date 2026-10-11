import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussions } from '@/hooks/useDiscussions';
import { getErrorMessage } from '@/lib/api';
import {
  DISCUSSION_MAX_LENGTH,
  type DiscussionAuthor,
  type DiscussionComment,
} from '@/services/discussions';
import { formatTimeAgo } from '@/utils/date';

// "Mariana Costa" -> "MC"
function getInitials(name: string | null) {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

function getDisplayName(author: Pick<DiscussionAuthor, 'name'>) {
  return author.name?.trim() || 'Aluno';
}

function Avatar({
  name,
  image,
  isTeacher = false,
}: {
  name: string | null;
  image?: string | null;
  isTeacher?: boolean;
}) {
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        accessibilityIgnoresInvertColors
        className="h-10 w-10 rounded-full bg-gray-200"
      />
    );
  }

  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-full ${isTeacher ? 'bg-green-600' : 'bg-gray-200'}`}
    >
      <Text
        className={`font-poppins-bold text-sm ${isTeacher ? 'text-white' : 'text-gray-700'}`}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

interface ComposerProps {
  placeholder: string;
  // Texto inicial, usado para mencionar quem está sendo respondido
  initialValue?: string;
  autoFocus?: boolean;
  onPublish: (content: string) => Promise<void>;
  onCancel?: () => void;
}

function Composer({
  placeholder,
  initialValue = '',
  autoFocus = false,
  onPublish,
  onCancel,
}: ComposerProps) {
  const [content, setContent] = useState(initialValue);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  async function handlePublish() {
    const trimmed = content.trim();
    if (!trimmed || isPublishing) {
      return;
    }

    setError('');
    setIsPublishing(true);
    try {
      await onPublish(trimmed);
      setContent('');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao publicar o comentário.'));
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <View className="flex-1 gap-2">
      <TextInput
        accessibilityLabel={placeholder}
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        multiline
        autoFocus={autoFocus}
        maxLength={DISCUSSION_MAX_LENGTH}
        textAlignVertical="top"
        className="min-h-24 rounded-xl border border-gray-200 bg-white p-3 font-poppins text-[15px] text-gray-900 focus:border-green-600"
      />
      {error ? (
        <Text className="font-poppins text-sm text-red-700">{error}</Text>
      ) : null}
      <View className="flex-row items-center justify-end gap-4">
        {onCancel ? (
          <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8}>
            <Text className="font-poppins-medium text-sm text-gray-600">
              Cancelar
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{
            disabled: !content.trim() || isPublishing,
            busy: isPublishing,
          }}
          onPress={handlePublish}
          disabled={!content.trim() || isPublishing}
          className={`h-10 flex-row items-center justify-center gap-2 rounded-lg bg-green-600 px-5 active:bg-green-700 ${!content.trim() || isPublishing ? 'opacity-50' : ''}`}
        >
          {isPublishing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : null}
          <Text className="font-poppins-semibold text-sm text-white">
            Publicar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Comment({
  comment,
  onReply,
}: {
  comment: DiscussionComment;
  onReply: () => void;
}) {
  const { author } = comment;

  return (
    <View className="flex-row gap-3">
      <Avatar
        name={author.name}
        image={author.image}
        isTeacher={author.isTeacher}
      />
      <View className="flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text className="font-poppins-semibold text-sm text-gray-900">
            {getDisplayName(author)}
          </Text>
          {author.isTeacher ? (
            <View className="rounded bg-green-600 px-1.5 py-0.5">
              <Text className="font-poppins-bold text-[10px] tracking-widest text-white">
                PROFESSORA
              </Text>
            </View>
          ) : null}
          <Text className="ml-auto font-poppins text-xs text-gray-500">
            {formatTimeAgo(comment.createdAt)}
            {comment.isEdited ? ' · editado' : ''}
          </Text>
        </View>
        <Text className="font-poppins text-sm leading-5 text-gray-700">
          {comment.content}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Responder a ${getDisplayName(author)}`}
          onPress={onReply}
          hitSlop={8}
          className="mt-1 self-start"
        >
          <Text className="font-poppins-semibold text-xs text-green-700">
            Responder
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Aba "Discussão" da aula: qualquer aluno comenta e responde a qualquer um
export function LessonDiscussions({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const { threads, error, reload, publish } = useDiscussions(lessonId);
  // Comentário que está sendo respondido e a conversa a que ele pertence
  const [replyingTo, setReplyingTo] = useState<{
    threadId: string;
    comment: DiscussionComment;
  } | null>(null);

  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="font-poppins-semibold text-xs tracking-widest text-gray-500">
          COMUNIDADE
        </Text>
        <Text className="font-poppins-semibold text-2xl text-gray-900">
          Discussão da aula
        </Text>
        <Text className="font-poppins text-base text-gray-600">
          Compartilhe dúvidas e pratique com outros alunos.
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Avatar name={user?.name ?? null} image={user?.image} />
        <Composer
          placeholder="Escreva uma dúvida ou comentário..."
          onPublish={(content) => publish(content)}
        />
      </View>

      {error ? (
        <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="font-poppins text-sm text-red-700">{error}</Text>
          <Button variant="link" label="Tentar de novo" onPress={reload} />
        </View>
      ) : null}

      {!threads && !error ? <ActivityIndicator color={colors.green} /> : null}

      {threads?.length === 0 ? (
        <Text className="text-center font-poppins text-sm text-gray-500">
          Ainda não há comentários. Seja o primeiro a participar!
        </Text>
      ) : null}

      {threads?.map((thread) => (
        <View key={thread.id} className="gap-3">
          <Comment
            comment={thread}
            onReply={() =>
              setReplyingTo({ threadId: thread.id, comment: thread })
            }
          />

          {thread.replies.length > 0 ? (
            <View className="ml-6 gap-3">
              {thread.replies.map((reply) => (
                <View
                  key={reply.id}
                  className={`rounded-2xl p-3 ${reply.author.isTeacher ? 'border border-green-100 bg-green-50' : 'bg-gray-100'}`}
                >
                  <Comment
                    comment={reply}
                    onReply={() =>
                      setReplyingTo({ threadId: thread.id, comment: reply })
                    }
                  />
                </View>
              ))}
            </View>
          ) : null}

          {replyingTo?.threadId === thread.id ? (
            <View className="ml-6 gap-2">
              <Text className="font-poppins text-xs text-gray-500">
                Respondendo a{' '}
                <Text className="font-poppins-semibold text-gray-700">
                  {getDisplayName(replyingTo.comment.author)}
                </Text>
              </Text>
              <View className="flex-row">
                <Composer
                  // Trocar de comentário respondido recomeça o campo
                  key={replyingTo.comment.id}
                  placeholder="Escreva sua resposta..."
                  // Numa resposta a outra resposta, a menção deixa claro
                  // para quem é, já que todas ficam no mesmo nível
                  initialValue={
                    replyingTo.comment.id === thread.id
                      ? ''
                      : `@${getDisplayName(replyingTo.comment.author)} `
                  }
                  autoFocus
                  onPublish={async (content) => {
                    await publish(content, replyingTo.comment.id);
                    setReplyingTo(null);
                  }}
                  onCancel={() => setReplyingTo(null)}
                />
              </View>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
