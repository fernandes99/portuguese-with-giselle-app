// Mesmas regras do cadastro do site (RegisterForm.tsx). O backend não valida
// a força da senha, então a checagem é só no cliente. Os textos ficam em
// entry.password.rules, pelo id.
export const PASSWORD_RULES = [
  {
    id: 'length',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'upper',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lower',
    test: (password: string) => /[a-z]/.test(password),
  },
  { id: 'number', test: (password: string) => /\d/.test(password) },
  {
    id: 'special',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export function checkPassword(password: string) {
  const rules = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    passed: rule.test(password),
  }));
  const score = rules.filter((rule) => rule.passed).length;

  return { rules, score, isValid: score === PASSWORD_RULES.length };
}

export function getPasswordStrength(score: number) {
  if (score <= 2) return { level: 'weak', className: 'bg-red-500' } as const;
  if (score <= 4) {
    return { level: 'medium', className: 'bg-yellow-500' } as const;
  }
  return { level: 'strong', className: 'bg-green-500' } as const;
}
