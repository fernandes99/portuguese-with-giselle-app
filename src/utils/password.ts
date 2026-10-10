// Mesmas regras do cadastro do site (RegisterForm.tsx). O backend não valida
// a força da senha, então a checagem é só no cliente.
export const PASSWORD_RULES = [
  {
    label: 'Mínimo 8 caracteres',
    test: (password: string) => password.length >= 8,
  },
  {
    label: '1 letra maiúscula',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: '1 letra minúscula',
    test: (password: string) => /[a-z]/.test(password),
  },
  { label: '1 número', test: (password: string) => /\d/.test(password) },
  {
    label: '1 caractere especial',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export function checkPassword(password: string) {
  const rules = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    passed: rule.test(password),
  }));
  const score = rules.filter((rule) => rule.passed).length;

  return { rules, score, isValid: score === PASSWORD_RULES.length };
}

export function getPasswordStrength(score: number) {
  if (score <= 2) return { label: 'Fraca', className: 'bg-red-500' };
  if (score <= 4) return { label: 'Média', className: 'bg-yellow-500' };
  return { label: 'Forte', className: 'bg-green-500' };
}
