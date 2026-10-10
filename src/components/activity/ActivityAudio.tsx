import { Ionicons } from '@expo/vector-icons';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pressable, Text } from 'react-native';

import { colors } from '@/constants/theme';

interface ActivityAudioValue {
  // URL tocando agora; null se nada estiver tocando
  playingUrl: string | null;
  toggle: (url: string) => void;
  stop: () => void;
}

const ActivityAudioContext = createContext<ActivityAudioValue | null>(null);

// Um único player para todos os áudios das atividades: tocar um para o outro.
export function ActivityAudioProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    // Sem isso o iPhone no modo silencioso não toca nada
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  const toggle = useCallback(
    (url: string) => {
      if (url !== currentUrl) {
        player.replace({ uri: url });
        player.play();
        setCurrentUrl(url);
        return;
      }

      if (status.playing) {
        player.pause();
        return;
      }

      // Depois de tocar até o fim o player fica parado no final do áudio
      player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => undefined);
    },
    [player, currentUrl, status.playing]
  );

  const stop = useCallback(() => {
    player.pause();
  }, [player]);

  const value = useMemo(
    () => ({
      playingUrl: status.playing ? currentUrl : null,
      toggle,
      stop,
    }),
    [status.playing, currentUrl, toggle, stop]
  );

  return (
    <ActivityAudioContext.Provider value={value}>
      {children}
    </ActivityAudioContext.Provider>
  );
}

export function useActivityAudio() {
  const context = useContext(ActivityAudioContext);
  if (!context) {
    throw new Error(
      'useActivityAudio must be used inside ActivityAudioProvider'
    );
  }
  return context;
}

interface AudioButtonProps {
  url: string;
  // Com texto vira um botão largo ("Ouvir"); sem texto, um botão redondo
  label?: string;
}

export function AudioButton({ url, label }: AudioButtonProps) {
  const { playingUrl, toggle } = useActivityAudio();
  const isPlaying = playingUrl === url;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Ouvir áudio'}
      onPress={() => toggle(url)}
      hitSlop={6}
      className={`flex-row items-center justify-center gap-2 rounded-full bg-green-100 active:bg-green-50 ${label ? 'self-start px-4 py-2.5' : 'h-10 w-10'}`}
    >
      <Ionicons
        name={isPlaying ? 'pause' : 'volume-high'}
        size={18}
        color={colors.darkGreen}
      />
      {label ? (
        <Text className="font-poppins-semibold text-sm text-green-700">
          {isPlaying ? 'Pausar' : label}
        </Text>
      ) : null}
    </Pressable>
  );
}
