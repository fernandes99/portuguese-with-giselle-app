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
import { LevelCard } from '@/components/preferences/LevelCard';
import { NameStep } from '@/components/preferences/NameStep';
import { TeacherPrompt } from '@/components/preferences/TeacherPrompt';
import { WelcomeStep } from '@/components/preferences/WelcomeStep';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ApiError, getErrorMessage } from '@/lib/api';
import { KeyboardAvoidingView } from '@/lib/keyboard';
import {
  getPreferences,
  type LearningGoal,
  type NativeLanguage,
  type PortugueseLevel,
  savePreferences,
} from '@/services/preferences';
import {
  getGoalIcon,
  getInterestsLimitMessage,
  getMissingAnswerMessage,
  getPreferencesSteps,
  getStepInstruction,
  getStepPrompt,
  groupLevels,
  type PreferencesMode,
  type PreferencesStep,
} from '@/utils/preferences';

const LOAD_ERROR = 'Não foi possível carregar as perguntas.';
const SAVE_ERROR = 'Não foi possível salvar suas respostas.';

interface PreferencesFlowProps {
  // onboarding: boas-vindas depois do login; edit: aberto pelo Perfil
  mode: PreferencesMode;
  // Chamado depois de gravar, com o nome da conta devolvido pela rota
  onDone: (name: string | null) => void;
  // Só na edição: fechar sem gravar
  onCancel?: () => void;
}

// Idioma nativo, nome, nível, objetivo e três temas de conversa, um passo
// por vez; no primeiro acesso, uma tela de boas-vindas no fim. As respostas
// são gravadas uma vez só, no último passo.
export function PreferencesFlow({
  mode,
  onDone,
  onCancel,
}: PreferencesFlowProps) {
  const { token, user, signOut } = useAuth();
  const { data, error, refresh } = useApiQuery(getPreferences, LOAD_ERROR);

  const steps = getPreferencesSteps(mode);
  const [stepIndex, setStepIndex] = useState(0);
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage | null>(
    null
  );
  const [name, setName] = useState(user?.name ?? '');
  const [level, setLevel] = useState<PortugueseLevel | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const prefilled = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const step = steps[stepIndex];

  // Respostas já gravadas (edição, ou outro aparelho) vêm marcadas, uma vez
  // só: a recarga ao voltar o foco não desfaz o que o aluno mudou. Idioma,
  // nível ou tema que não está mais na lista não vem marcado.
  useEffect(() => {
    if (!data || prefilled.current) {
      return;
    }
    prefilled.current = true;

    const saved = data.preferences;
    if (!saved) {
      return;
    }

    const { options } = data;
    const hasOption = (list: { id: string }[], id: string | null) =>
      id !== null && list.some((option) => option.id === id);

    if (hasOption(options.nativeLanguages, saved.nativeLanguage)) {
      setNativeLanguage(saved.nativeLanguage);
    }
    if (hasOption(options.levels, saved.level)) {
      setLevel(saved.level);
    }
    setGoal(saved.goal);
    setInterests(
      saved.interests
        .filter((id) => hasOption(options.interests, id))
        .slice(0, options.interestsCount)
    );
  }, [data]);

  const interestsCount = data?.options.interestsCount ?? 3;
  const isLastStep = stepIndex === steps.length - 1;
  const answered: Record<PreferencesStep, boolean> = {
    language: nativeLanguage !== null,
    name: name.trim().length > 0,
    level: level !== null,
    goal: goal !== null,
    interests: interests.length === interestsCount,
    welcome: true,
  };
  const hasAnswer = answered[step];

  const showToast = (text: string) => setToast({ text, id: Date.now() });

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sair da conta?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setSaveError('');
      return;
    }
    if (mode === 'edit') {
      onCancel?.();
    } else {
      confirmSignOut();
    }
  }, [stepIndex, mode, onCancel, confirmSignOut]);

  // O voltar do Android volta um passo; no primeiro, segue o padrão (sai do
  // app nas boas-vindas, volta ao Perfil na edição)
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (stepIndex === 0) {
            return false;
          }
          setStepIndex(stepIndex - 1);
          setSaveError('');
          return true;
        }
      );
      return () => subscription.remove();
    }, [stepIndex])
  );

  // Cada passo começa do topo
  // biome-ignore lint/correctness/useExhaustiveDependencies: roda a cada troca de passo
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [stepIndex]);

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
    if (!token || !nativeLanguage || !level || !goal || saving) {
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const saved = await savePreferences(token, {
        nativeLanguage,
        name: name.trim(),
        level,
        goal,
        interests,
      });
      onDone(saved.name);
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
      setStepIndex(stepIndex + 1);
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
  const instruction = getStepInstruction(step, interestsCount);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <FlowHeader
        progress={(stepIndex + 1) / steps.length}
        onClose={goBack}
        closeIcon={stepIndex === 0 ? 'close' : 'back'}
        closeLabel={
          stepIndex > 0
            ? 'Voltar'
            : mode === 'edit'
              ? 'Fechar'
              : 'Sair da conta'
        }
      />

      {/* O rodapé sobe junto com o teclado no passo do nome */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        automaticOffset
      >
        {step === 'welcome' ? (
          <WelcomeStep name={name} />
        ) : (
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-6 px-5 pb-8 pt-4"
          >
            <TeacherPrompt text={getStepPrompt(step, mode, name)} />

            <View className="gap-3">
              {instruction ? (
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 font-poppins text-sm text-gray-500">
                    {instruction}
                  </Text>
                  {step === 'interests' ? (
                    <Text className="font-poppins-semibold text-sm text-green-700">
                      {interests.length} de {interestsCount}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {step === 'language' ? (
                <View accessibilityRole="radiogroup" className="gap-3">
                  {options.nativeLanguages.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      title={option.title}
                      emoji={option.emoji}
                      selected={nativeLanguage === option.id}
                      onPress={() =>
                        setNativeLanguage(option.id as NativeLanguage)
                      }
                    />
                  ))}
                </View>
              ) : null}

              {step === 'name' ? (
                <NameStep
                  value={name}
                  onChange={setName}
                  onSubmit={() => {
                    if (answered.name) {
                      next();
                    }
                  }}
                />
              ) : null}

              {step === 'level' ? (
                <View accessibilityRole="radiogroup" className="gap-5">
                  {groupLevels(options.levels).map((group) => (
                    <View key={group.title} className="gap-3">
                      {group.title ? (
                        <Text className="font-poppins-medium text-xs uppercase tracking-wider text-gray-500">
                          {group.title}
                        </Text>
                      ) : null}
                      {group.options.map((option) => (
                        <LevelCard
                          key={option.id}
                          code={option.title}
                          description={option.description}
                          selected={level === option.id}
                          onPress={() => setLevel(option.id as PortugueseLevel)}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              ) : null}

              {step === 'goal' ? (
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

              {step === 'interests' ? (
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
        )}

        <FlowFooter
          label={
            step === 'welcome' ? 'Começar' : isLastStep ? 'Salvar' : 'Continuar'
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
