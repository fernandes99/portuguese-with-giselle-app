import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { AuthDivider, AuthScreen } from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { CodeInput } from '@/components/CodeInput';
import { GoogleButton } from '@/components/GoogleButton';
import { PasswordRules } from '@/components/PasswordRules';
import { TextField } from '@/components/TextField';
import { LINKS } from '@/constants/config';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { getErrorMessage } from '@/lib/api';
import { login, sendCode, verifyCodeAndRegister } from '@/services/auth';
import { checkPassword } from '@/utils/password';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [step, setStep] = useState<'form' | 'code'>('form');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const google = useGoogleSignIn(setError);
  const busy = loading || google.loading;
  const isPasswordValid = checkPassword(password).isValid;

  async function requestCode() {
    await sendCode(email.trim(), password, name.trim());
  }

  async function handleSubmit() {
    setError('');

    if (!email.trim()) {
      setError(t('entry.register.missingEmail'));
      return;
    }
    if (!isPasswordValid) {
      setError(t('entry.register.weakPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('entry.register.passwordMismatch'));
      return;
    }
    if (!acceptedTerms) {
      setError(t('entry.register.termsRequired'));
      return;
    }

    setLoading(true);
    try {
      await requestCode();
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err, t('entry.register.sendCodeError')));
    }
    setLoading(false);
  }

  async function handleResend() {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await requestCode();
      setCode('');
      setNotice(t('entry.register.codeResent'));
    } catch (err) {
      setError(getErrorMessage(err, t('entry.register.sendCodeError')));
    }
    setLoading(false);
  }

  async function handleVerify() {
    setError('');
    setNotice('');

    if (code.length !== 6) {
      setError(t('entry.register.codeIncomplete'));
      return;
    }

    setLoading(true);
    try {
      await verifyCodeAndRegister(email.trim(), code);
    } catch (err) {
      setError(getErrorMessage(err, t('entry.register.verifyError')));
      setLoading(false);
      return;
    }

    try {
      await signIn(await login(email.trim(), password));
    } catch {
      setError(t('entry.register.accountCreatedError'));
      setLoading(false);
    }
  }

  function handleBack() {
    setStep('form');
    setCode('');
    setError('');
    setNotice('');
  }

  if (step === 'code') {
    return (
      <AuthScreen
        title={t('entry.register.verifyTitle')}
        subtitle={t('entry.register.verifySubtitle', { email: email.trim() })}
        error={error}
      >
        {notice ? (
          <Text className="text-center font-poppins text-sm text-green-700">
            {notice}
          </Text>
        ) : null}

        <CodeInput value={code} onChange={setCode} />

        <Button
          size="lg"
          label={t(
            loading ? 'entry.register.verifying' : 'entry.register.verify'
          )}
          onPress={handleVerify}
          loading={loading}
        />
        <View>
          <Button
            variant="link"
            label={t('entry.register.resendCode')}
            onPress={handleResend}
            disabled={loading}
          />
          <Button
            variant="link"
            label={t('entry.register.backArrow')}
            onPress={handleBack}
            disabled={loading}
          />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={t('entry.register.title')}
      subtitle={t('entry.register.subtitle')}
      error={error}
      footer={
        <Text className="font-poppins text-sm text-gray-600">
          {t('entry.register.hasAccount')}{' '}
          <Link href="/login" className="font-poppins-semibold text-green-700">
            {t('entry.register.signIn')}
          </Link>
        </Text>
      }
    >
      <GoogleButton onPress={google.signInWithGoogle} disabled={busy} />

      <AuthDivider label={t('entry.register.divider')} />

      <TextField
        label={t('entry.register.name')}
        icon="person-outline"
        placeholder={t('entry.register.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
      />
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
        placeholder={t('entry.register.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {password ? <PasswordRules password={password} /> : null}
      <TextField
        label={t('entry.register.confirmPassword')}
        icon="lock-closed-outline"
        placeholder={t('entry.register.confirmPlaceholder')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          accessibilityLabel={t('entry.register.acceptTerms')}
          onPress={() => setAcceptedTerms((value) => !value)}
          hitSlop={8}
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${acceptedTerms ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'}`}
        >
          {acceptedTerms && (
            <Text className="font-poppins-bold text-xs text-white">✓</Text>
          )}
        </Pressable>
        <Text className="flex-1 font-poppins text-sm text-gray-600">
          {t('entry.register.termsPrefix')}{' '}
          <Text
            className="text-green-600 underline"
            onPress={() => WebBrowser.openBrowserAsync(LINKS.terms)}
          >
            {t('entry.register.termsOfUse')}
          </Text>{' '}
          {t('entry.register.termsAnd')}{' '}
          <Text
            className="text-green-600 underline"
            onPress={() => WebBrowser.openBrowserAsync(LINKS.privacy)}
          >
            {t('entry.register.privacyPolicy')}
          </Text>
        </Text>
      </View>

      <Button
        size="lg"
        label={t(
          loading ? 'entry.register.submitting' : 'entry.register.submit'
        )}
        onPress={handleSubmit}
        loading={loading}
        disabled={!isPasswordValid || !acceptedTerms || busy}
      />
    </AuthScreen>
  );
}
