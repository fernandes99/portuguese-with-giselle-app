import { PreferencesFlow } from '@/components/preferences/PreferencesFlow';
import { useAuth } from '@/contexts/AuthContext';

// Boas-vindas: aparece depois do login enquanto o aluno não respondeu. Ao
// gravar, o layout raiz troca para as abas.
export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();

  return <PreferencesFlow mode="onboarding" onDone={completeOnboarding} />;
}
