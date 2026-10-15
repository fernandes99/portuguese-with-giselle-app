import { useRouter } from 'expo-router';

import { PreferencesFlow } from '@/components/preferences/PreferencesFlow';
import { useAuth } from '@/contexts/AuthContext';

// Edição das respostas das boas-vindas, aberta pelo Perfil. O nome gravado
// passa para a sessão, e o Perfil já volta com ele.
export default function PreferencesScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();

  return (
    <PreferencesFlow
      mode="edit"
      onDone={async (name) => {
        await updateUser({ name });
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}
