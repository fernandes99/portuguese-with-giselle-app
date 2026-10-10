import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthScreen } from '@/components/AuthScreen';
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
      setError('Email é obrigatório');
      return;
    }
    if (!isPasswordValid) {
      setError('A senha não atende aos critérios de segurança.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos e Política.');
      return;
    }

    setLoading(true);
    try {
      await requestCode();
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao enviar código.'));
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
      setNotice('Enviamos um novo código para o seu email.');
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao enviar código.'));
    }
    setLoading(false);
  }

  async function handleVerify() {
    setError('');
    setNotice('');

    if (code.length !== 6) {
      setError('Preencha todos os 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await verifyCodeAndRegister(email.trim(), code);
    } catch (err) {
      setError(getErrorMessage(err, 'Erro na verificação.'));
      setLoading(false);
      return;
    }

    try {
      await signIn(await login(email.trim(), password));
    } catch {
      setError('Conta criada, mas erro ao fazer login.');
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
        title="Verifique seu email"
        subtitle={`Digite o código de 6 dígitos que enviamos para ${email.trim()}`}
        error={error}
      >
        {notice ? (
          <Text className="text-center font-poppins text-sm text-green-700">
            {notice}
          </Text>
        ) : null}

        <CodeInput value={code} onChange={setCode} />

        <Button
          label={loading ? 'Verificando...' : 'Verificar e Criar Conta'}
          onPress={handleVerify}
          loading={loading}
        />
        <View>
          <Button
            variant="link"
            label="Reenviar código"
            onPress={handleResend}
            disabled={loading}
          />
          <Button
            variant="link"
            label="← Voltar"
            onPress={handleBack}
            disabled={loading}
          />
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Criar conta"
      error={error}
      footer={
        <Text className="font-poppins text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-poppins-semibold text-green-600">
            Entrar
          </Link>
        </Text>
      }
    >
      <GoogleButton onPress={google.signInWithGoogle} disabled={busy} />

      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
      />
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
        autoComplete="new-password"
        textContentType="newPassword"
      />
      {password ? <PasswordRules password={password} /> : null}
      <TextField
        label="Confirmar senha"
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
          accessibilityLabel="Eu concordo com os Termos de Uso e Política de Privacidade"
          onPress={() => setAcceptedTerms((value) => !value)}
          hitSlop={8}
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${acceptedTerms ? 'border-green-600 bg-green-600' : 'border-gray-400 bg-white'}`}
        >
          {acceptedTerms && (
            <Text className="font-poppins-bold text-xs text-white">✓</Text>
          )}
        </Pressable>
        <Text className="flex-1 font-poppins text-sm text-gray-600">
          Eu concordo com os{' '}
          <Text
            className="text-green-600 underline"
            onPress={() => WebBrowser.openBrowserAsync(LINKS.terms)}
          >
            Termos de Uso
          </Text>{' '}
          e{' '}
          <Text
            className="text-green-600 underline"
            onPress={() => WebBrowser.openBrowserAsync(LINKS.privacy)}
          >
            Política de Privacidade
          </Text>
        </Text>
      </View>

      <Button
        label={loading ? 'Carregando...' : 'Criar conta'}
        onPress={handleSubmit}
        loading={loading}
        disabled={!isPasswordValid || !acceptedTerms || busy}
      />
    </AuthScreen>
  );
}
