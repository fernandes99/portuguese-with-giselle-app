import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FlowFooter } from '@/components/lesson-flow/FlowFooter';
import { FlowHeader } from '@/components/lesson-flow/FlowHeader';
import type { ToastMessage } from '@/components/lesson-flow/FlowToast';
import { ChoiceCard } from '@/components/preferences/ChoiceCard';
import { InterestChip } from '@/components/preferences/InterestChip';
import { TeacherPrompt } from '@/components/preferences/TeacherPrompt';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ApiError, getErrorMessage } from '@/lib/api';
import {
  getPreferences,
  type LearningGoal,
  type PortugueseLevel,
  savePreferences,
} from '@/services/preferences';
import {
  getGoalIcon,
  getInterestsLimitMessage,
  getMissingAnswerMessage,
  getStepInstruction,
  getStepPrompt,
  PREFERENCES_STEPS,
  type PreferencesMode,
} from '@/utils/preferences';

const LOAD_ERROR = 'Não foi possível carregar as perguntas.';
const SAVE_ERROR = 'Não foi possível salvar suas respostas.';

interface PreferencesFlowProps {
  // onboarding: boas-vindas depois do login; edit: aberto pelo Perfil
  mode: PreferencesMode;
  // Chamado depois de gravar
  onDone: () => void;
  // Só na edição: fechar sem gravar
  onCancel?: () => void;
}

// Nível, objetivo e três temas de conversa, um passo por vez. As respostas
// são gravadas uma vez só, no último passo.
export function PreferencesFlow({
  mode,
  onDone,
  onCancel,
}: PreferencesFlowProps) {
  const { token, user, signOut } = useAuth();
  const { data, error, refresh } = useApiQuery(getPreferences, LOAD_ERROR);

  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<PortugueseLevel | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const prefilled = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  // Respostas já gravadas (edição, ou outro aparelho) vêm marcadas, uma vez
  // só: a recarga ao voltar o foco não desfaz o que o aluno mudou
  useEffect(() => {
    if (!data || prefilled.current) {
      return;
    }
    prefilled.current = true;

    const saved = data.preferences;
    if (saved) {
      const known = new Set(data.options.interests.map((option) => option.id));
      setLevel(saved.level);
      setGoal(saved.goal);
      setInterests(
        saved.interests
          .filter((id) => known.has(id))
          .slice(0, data.options.interestsCount)
      );
    }
  }, [data]);

  const interestsCount = data?.options.interestsCount ?? 3;
  const isLastStep = step === PREFERENCES_STEPS - 1;
  const hasAnswer =
    step === 0
      ? level !== null
      : step === 1
        ? goal !== null
        : interests.length === interestsCount;

  const showToast = (text: string) => setToast({ text, id: Date.now() });

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sair da conta?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
      setSaveError('');
      return;
    }
    if (mode === 'edit') {
      onCancel?.();
    } else {
      confirmSignOut();
    }
  }, [step, mode, onCancel, confirmSignOut]);

  // O voltar do Android volta um passo; no primeiro, segue o padrão (sai do
  // app nas boas-vindas, volta ao Perfil na edição)
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (step === 0) {
            return false;
          }
          setStep(step - 1);
          setSaveError('');
          return true;
        }
      );
      return () => subscription.remove();
    }, [step])
  );

  // Cada passo começa do topo
  // biome-ignore lint/correctness/useExhaustiveDependencies: roda a cada troca de passo
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((interest) => interest !== id));
      return;
    }
    if (interests.length >= interestsCount) {
      showToast(getInterestsLimitMessage(interestsCount));
      return;
    }
    setInterests([...interests, id]);
  };

  const save = async () => {
    if (!token || !level || !goal || saving) {
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      await savePreferences(token, { level, goal, interests });
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        return;
      }
      setSaveError(getErrorMessage(err, SAVE_ERROR));
      setSaving(false);
    }
  };

  const next = () => {
    if (isLastStep) {
      save();
    } else {
      setStep(step + 1);
    }
  };

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {error ? (
          <View className="flex-1 justify-center gap-3 px-6">
            <View className="gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="font-poppins text-sm text-red-700">{error}</Text>
              <Button variant="link" label="Tentar de novo" onPress={refresh} />
            </View>
            {mode === 'edit' ? (
              <Button variant="link" label="Voltar" onPress={goBack} />
            ) : (
              <Button
                variant="link"
                label="Sair da conta"
                onPress={confirmSignOut}
              />
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.green} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { options } = data;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlowHeader
        progress={(step + 1) / PREFERENCES_STEPS}
        onClose={goBack}
        closeIcon={step === 0 ? 'close' : 'back'}
        closeLabel={
          step > 0 ? 'Voltar' : mode === 'edit' ? 'Fechar' : 'Sair da conta'
        }
      />

      <ScrollView
        ref={scrollRef}
        contentContainerClassName="gap-6 px-5 pb-8 pt-4"
      >
        <TeacherPrompt text={getStepPrompt(step, mode, user?.name)} />

        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="flex-1 font-poppins text-sm text-gray-500">
              {getStepInstruction(step, interestsCount)}
            </Text>
            {step === 2 ? (
              <Text className="font-poppins-semibold text-sm text-green-700">
                {interests.length} de {interestsCount}
              </Text>
            ) : null}
          </View>

          {step === 0 ? (
            <View accessibilityRole="radiogroup" className="gap-3">
              {options.levels.map((option) => (
                <ChoiceCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  selected={level === option.id}
                  onPress={() => setLevel(option.id as PortugueseLevel)}
                />
              ))}
            </View>
          ) : null}

          {step === 1 ? (
            <View accessibilityRole="radiogroup" className="gap-3">
              {options.goals.map((option) => (
                <ChoiceCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={getGoalIcon(option.id)}
                  selected={goal === option.id}
                  onPress={() => setGoal(option.id as LearningGoal)}
                />
              ))}
            </View>
          ) : null}

          {step === 2 ? (
            <View className="flex-row flex-wrap gap-2">
              {options.interests.map((option) => (
                <InterestChip
                  key={option.id}
                  title={option.title}
                  emoji={option.emoji}
                  selected={interests.includes(option.id)}
                  onPress={() => toggleInterest(option.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <FlowFooter
        label={
          isLastStep ? (mode === 'edit' ? 'Salvar' : 'Começar') : 'Continuar'
        }
        onPress={next}
        disabled={!hasAnswer}
        onDisabledPress={() =>
          showToast(getMissingAnswerMessage(step, interestsCount))
        }
        loading={saving}
        error={saveError}
        toast={toast}
      />
    </SafeAreaView>
  );
}
