import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getErrorMessage } from '@/lib/api';
import { getVocabulary, setVocabularySaved } from '@/services/vocabulary';

// A lista do vocabulário e os itens salvos. Salvar muda o estado na hora e
// desfaz se a rota falhar.
export function useVocabulary() {
  const { token } = useAuth();
  const query = useApiQuery(getVocabulary, 'Erro ao carregar o vocabulário.');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  // Cópia para o toggleSaved ler o estado atual sem mudar de identidade
  const savedIdsRef = useRef(savedIds);
  savedIdsRef.current = savedIds;

  // Cada carga (inclusive ao voltar à tela) traz os salvos do backend
  useEffect(() => {
    if (query.data) {
      setSavedIds(
        new Set(
          query.data.items.filter((item) => item.isSaved).map((item) => item.id)
        )
      );
    }
  }, [query.data]);

  const setSaved = useCallback((id: string, saved: boolean) => {
    setSavedIds((previous) => {
      const next = new Set(previous);
      if (saved) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleSaved = useCallback(
    async (id: string) => {
      if (!token) {
        return;
      }

      const saved = !savedIdsRef.current.has(id);
      setSaved(id, saved);

      try {
        await setVocabularySaved(token, id, saved);
      } catch (error) {
        setSaved(id, !saved);
        Alert.alert(
          'Não foi possível salvar',
          getErrorMessage(error, 'Tente de novo em instantes.')
        );
      }
    },
    [token, setSaved]
  );

  return { ...query, savedIds, toggleSaved };
}
