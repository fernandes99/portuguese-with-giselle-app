import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { getErrorMessage } from '@/lib/api';
import { login } from '@/services/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const google = useGoogleSignIn(setError);
  const busy = loading || google.loading;

  async function handleSubmit() {
    setError('');

    if (!email.trim() || !password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await signIn(await login(email.trim(), password));
    } catch (err) {
      setError(
        getErrorMessage(err, 'Ocorreu um erro ao fazer login. Tente novamente.')
      );
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Bem-vindo de volta!"
      subtitle="Entre na sua conta para continuar aprendendo"
      error={error}
      footer={
        <Text className="font-poppins text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-poppins-semibold text-green-600"
          >
            Criar conta gratuita
          </Link>
        </Text>
      }
    >
      <GoogleButton onPress={google.signInWithGoogle} disabled={busy} />

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-gray-200" />
        <Text className="font-poppins text-sm text-gray-500">ou</Text>
        <View className="h-px flex-1 bg-gray-200" />
      </View>

      <TextField
        label="Email"
        placeholder="seu@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
        returnKeyType="go"
      />

      <Button
        label={loading ? 'Entrando...' : 'Entrar'}
        onPress={handleSubmit}
        loading={loading}
        disabled={busy}
      />
    </AuthScreen>
  );
}
