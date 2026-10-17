import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import {
  KEYBOARD_BOTTOM_OFFSET,
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from '@/lib/keyboard';

interface ActivityCheckState {
  disabled: boolean;
  onCheck: () => void;
}

interface ActivityFooterState {
  // null enquanto nenhuma atividade registrou o Verificar (ou no placar)
  check: ActivityCheckState | null;
  footerHeight: number;
}

interface ActivityFooterSetters {
  setCheck: (check: ActivityCheckState | null) => void;
  setFooterHeight: (height: number) => void;
}

// Em dois contextos: a atividade só usa os setters, que não mudam, e não
// renderiza de novo quando o rodapé muda
const ActivityFooterStateContext = createContext<ActivityFooterState | null>(
  null
);
const ActivityFooterSettersContext =
  createContext<ActivityFooterSetters | null>(null);

// Liga a atividade ao rodapé fixo das duas telas que mostram atividades (aula
// guiada e modal da aba Atividades). Envolve a rolagem e o rodapé.
export function ActivityFooterProvider({ children }: { children: ReactNode }) {
  const [check, setCheck] = useState<ActivityCheckState | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  const setters = useMemo(() => ({ setCheck, setFooterHeight }), []);
  const state = useMemo(() => ({ check, footerHeight }), [check, footerHeight]);

  return (
    <ActivityFooterSettersContext.Provider value={setters}>
      <ActivityFooterStateContext.Provider value={state}>
        {children}
      </ActivityFooterStateContext.Provider>
    </ActivityFooterSettersContext.Provider>
  );
}

function useActivityFooterState() {
  const state = useContext(ActivityFooterStateContext);
  if (!state) {
    throw new Error(
      'useActivityFooterState must be used inside ActivityFooterProvider'
    );
  }
  return state;
}

function useActivityFooterSetters() {
  const setters = useContext(ActivityFooterSettersContext);
  if (!setters) {
    throw new Error(
      'useActivityFooterSetters must be used inside ActivityFooterProvider'
    );
  }
  return setters;
}

// Vai no lugar do botão: a atividade diz se já dá para verificar e o que
// fazer, e o ActivityFooter desenha o "Verificar" no pé da tela. Não desenha
// nada; ao sair (no placar), o rodapé fica sem o Verificar.
export function ActivityCheck({ disabled, onCheck }: ActivityCheckState) {
  const { setCheck } = useActivityFooterSetters();

  useEffect(() => {
    setCheck({ disabled, onCheck });
  }, [disabled, onCheck, setCheck]);

  useEffect(() => () => setCheck(null), [setCheck]);

  return null;
}

type ActivityScrollViewProps = Omit<
  ComponentProps<typeof KeyboardAwareScrollView>,
  'bottomOffset'
>;

// Rolagem das telas com atividade: leva o campo focado para cima do teclado
// e do rodapé, que sobe junto com ele
export function ActivityScrollView(props: ActivityScrollViewProps) {
  const insets = useSafeAreaInsets();
  const { footerHeight } = useActivityFooterState();
  // Com o teclado aberto, o rodapé perde a área segura de baixo (o offset
  // do KeyboardStickyView)
  const footerAboveKeyboard = Math.max(footerHeight - insets.bottom, 0);

  return (
    <KeyboardAwareScrollView
      {...props}
      bottomOffset={footerAboveKeyboard + KEYBOARD_BOTTOM_OFFSET}
    />
  );
}

interface ActivityFooterProps {
  // Só no modal da aba Atividades; a aula guiada não deixa pular
  skipLabel?: string;
  onSkip?: () => void;
}

// Rodapé fixo enquanto o aluno responde, com o "Verificar" da atividade e,
// no modal, o "Pular atividade". Depois do placar, cada tela troca este
// rodapé pelo FlowFooter, com o botão que avança.
export function ActivityFooter({ skipLabel, onSkip }: ActivityFooterProps) {
  const insets = useSafeAreaInsets();
  const { check } = useActivityFooterState();
  const { setFooterHeight } = useActivityFooterSetters();

  useEffect(() => () => setFooterHeight(0), [setFooterHeight]);

  return (
    // Aberto, o teclado já cobre a área segura de baixo: o offset tira esse
    // espaço, para o rodapé encostar no teclado
    <KeyboardStickyView offset={{ opened: insets.bottom }}>
      <View
        onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)}
        className="gap-1 border-t border-gray-100 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          label="Verificar"
          onPress={() => check?.onCheck()}
          disabled={!check || check.disabled}
        />
        {skipLabel && onSkip ? (
          <Button variant="link" label={skipLabel} onPress={onSkip} />
        ) : null}
      </View>
    </KeyboardStickyView>
  );
}
