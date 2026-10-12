import { createContext, useContext } from 'react';

interface WelcomeContextValue {
  // Mostra a introdução de novo, no lugar da navegação
  showWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextValue | null>(null);

export const WelcomeProvider = WelcomeContext.Provider;

export function useWelcome() {
  const context = useContext(WelcomeContext);
  if (!context) {
    throw new Error('useWelcome must be used inside WelcomeProvider');
  }
  return context;
}
