import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { AuthDivider, AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { GoogleButton } from '@/components/GoogleButton';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { useWelcome } from '@/contexts/WelcomeContext';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { getErrorMessage } from '@/lib/api';
import { login } from '@/services/auth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { showWelcome } = useWelcome();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const google = useGoogleSignIn(setError);
  const busy = loading || google.loading;

  async function handleSubmit() {
    setError('');

    if (!email.trim() || !password) {
      setError(t('entry.login.missingFields'));
      return;
    }

    setLoading(true);
    try {
      await signIn(await login(email.trim(), password));
    } catch (err) {
      setError(getErrorMessage(err, t('entry.login.error')));
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title={t('entry.login.title')}
      subtitle={t('entry.login.subtitle')}
      error={error}
      onBackToStart={showWelcome}
      footer={
        <Text className="font-poppins text-sm text-gray-600">
          {t('entry.login.noAccount')}{' '}
          <Link
            href="/register"
            className="font-poppins-semibold text-green-700"
          >
            {t('entry.login.createAccount')}
          </Link>
        </Text>
      }
    >
      <GoogleButton onPress={google.signInWithGoogle} disabled={busy} />

      <AuthDivider label={t('entry.login.divider')} />

      <TextField
        label={t('entry.auth.email')}
        icon="mail-outline"
        placeholder={t('entry.auth.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />
      <TextField
        label={t('entry.auth.password')}
        icon="lock-closed-outline"
        placeholder={t('entry.login.passwordPlaceholder')}
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
        size="lg"
        label={t(loading ? 'entry.login.submitting' : 'entry.login.submit')}
        onPress={handleSubmit}
        loading={loading}
        disabled={busy}
      />
    </AuthScreen>
  );
}
