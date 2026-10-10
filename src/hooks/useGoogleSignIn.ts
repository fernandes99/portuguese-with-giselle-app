import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { getGoogleIdToken } from '@/lib/google';
import { loginWithGoogle } from '@/services/auth';

// Login e cadastro usam o mesmo fluxo do Google: o backend cria a conta
// se o email ainda não existir.
export function useGoogleSignIn(onError: (message: string) => void) {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    onError('');
    setLoading(true);

    try {
      const idToken = await getGoogleIdToken();
      if (idToken) {
        await signIn(await loginWithGoogle(idToken));
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      onError(getErrorMessage(error, 'Erro ao fazer login com Google'));
    } finally {
      setLoading(false);
    }
  }

  return { signInWithGoogle, loading };
}
