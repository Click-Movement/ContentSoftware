'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ApiKeys {
  openai: string | null;
  claude: string | null;
}

interface ApiKeysContextType {
  keys: ApiKeys;
  setApiKey: (type: 'openai' | 'claude', key: string) => void;
  clearApiKeys: () => void;
  hasRequiredKey: (model: 'gpt' | 'claude') => boolean;
}

const ApiKeysContext = createContext<ApiKeysContextType | null>(null);

export const ApiKeysProvider = ({ children }: { children: ReactNode }) => {
  // Store keys in memory only - no localStorage
  const [keys, setKeys] = useState<ApiKeys>({ openai: null, claude: null });

  const setApiKey = (type: 'openai' | 'claude', key: string) => {
    setKeys(prevKeys => ({ ...prevKeys, [type]: key }));
  };

  const clearApiKeys = () => {
    setKeys({ openai: null, claude: null });
  };

  const hasRequiredKey = (model: 'gpt' | 'claude'): boolean => {
    return model === 'gpt' ? !!keys.openai : !!keys.claude;
  };

  return (
    <ApiKeysContext.Provider value={{ keys, setApiKey, clearApiKeys, hasRequiredKey }}>
      {children}
    </ApiKeysContext.Provider>
  );
};

// Custom hook to use the context
export const useApiKeys = () => {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
};