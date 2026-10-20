import { useEffect, useState } from 'react';
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

function UsageRow({
  label,
  item,
}: {
  label: string;
  item: PracticeAllowanceItem;
}) {
  const isOver = item.remaining === 0;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: restam ${item.remaining} de ${item.limit}`}
      className="flex-row items-center justify-between gap-3"
    >
      <Text className="font-poppins text-sm text-gray-700">{label}</Text>
      <Text
        className={`font-poppins-semibold text-sm ${isOver ? 'text-red-600' : 'text-gray-900'}`}
      >
        {item.remaining} de {item.limit}
      </Text>
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
    <View className="gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
      <Text className="font-poppins-semibold text-sm text-gray-900">
        Seu uso hoje
      </Text>
      {allowance ? (
        <>
          <UsageRow label="Mensagens" item={allowance.messages} />
          <UsageRow label="Falas da Gisa" item={allowance.speech} />
          <UsageRow label="Respostas por voz" item={allowance.voiceAnswers} />
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
