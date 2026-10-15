import { useRouter } from 'expo-router';

import { PreferencesFlow } from '@/components/preferences/PreferencesFlow';

// Edição das respostas das boas-vindas, aberta pelo Perfil
export default function PreferencesScreen() {
  const router = useRouter();

  return (
    <PreferencesFlow
      mode="edit"
      onDone={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
