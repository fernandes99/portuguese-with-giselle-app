import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import {
  getPracticeAllowance,
  type PracticeAllowance,
  type PracticeAllowanceItem,
} from '@/services/practice';

const LOAD_ERROR = 'Não foi possível carregar seu uso.';

// Uma linha do uso: ícone, nome, quanto resta e a barra do que resta
function UsageRow({
  icon,
  label,
  item,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  item: PracticeAllowanceItem;
}) {
  const isOver = item.remaining === 0;
  const share = item.limit > 0 ? item.remaining / item.limit : 0;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: restam ${item.remaining} de ${item.limit}`}
      className="flex-row items-center gap-3"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
        <Ionicons
          name={icon}
          size={20}
          color={isOver ? colors.red : colors.green}
        />
      </View>
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-poppins-medium text-sm text-gray-900">
            {label}
          </Text>
          <Text
            className={`font-poppins-semibold text-sm ${isOver ? 'text-red-600' : 'text-gray-900'}`}
          >
            {item.remaining} de {item.limit}
          </Text>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-surface">
          <View
            className="h-full rounded-full bg-green-600"
            style={{ width: `${Math.min(1, Math.max(0, share)) * 100}%` }}
          />
        </View>
      </View>
    </View>
  );
}

// Quanto resta hoje de mensagens, falas da Gisa e respostas por voz. Carrega
// ao aparecer (a folha monta o conteúdo só quando abre).
export function UsageToday() {
  const { token } = useAuth();
  const [allowance, setAllowance] = useState<PracticeAllowance | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCurrent = true;
    getPracticeAllowance(token)
      .then((result) => {
        if (isCurrent) {
          setAllowance(result);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setError(getErrorMessage(err, LOAD_ERROR));
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [token]);

  return (
    <View className="gap-4 px-1 py-2">
      <Text className="font-poppins-semibold text-base text-gray-900">
        Seu uso hoje
      </Text>
      {allowance ? (
        <>
          <UsageRow
            icon="chatbubble-ellipses"
            label="Mensagens"
            item={allowance.messages}
          />
          <UsageRow
            icon="volume-high"
            label="Falas da Gisa"
            item={allowance.speech}
          />
          <UsageRow
            icon="mic"
            label="Respostas por voz"
            item={allowance.voiceAnswers}
          />
          <Text className="font-poppins text-xs text-gray-500">
            Os limites voltam à meia-noite (horário de Brasília).
          </Text>
        </>
      ) : error ? (
        <Text className="font-poppins text-sm text-red-700">{error}</Text>
      ) : (
        <ActivityIndicator color={colors.green} />
      )}
    </View>
  );
}
