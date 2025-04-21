import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { apiKeyUpdateEvent, triggerApiKeyUpdate } from '@/utils/eventBus';

const API_KEYS_KEY = 'api_keys';
const ENCRYPTION_KEY = 'content-software-secure-key-2024'; // Basic encryption key

export interface ApiKeys {
  openai: string | null;
  claude: string | null;
}

// Simple encryption/decryption functions
const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Helper functions for secure storage
const secureSet = <T>(key: string, value: T): void => {
    try {
        const valueStr = JSON.stringify(value);
        const encrypted = encrypt(valueStr);
        localStorage.setItem(key, encrypted);
    } catch (error) {
        console.error('Error encrypting:', error);
    }
};

const secureGet = <T>(key: string): T | null => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('Error decrypting:', error);
    return null;
  }
};

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKeys>({ openai: null, claude: null });
  const [isLoading, setIsLoading] = useState(true);

  // Load keys initially and when event is triggered
  const loadKeys = () => {
    try {
      setIsLoading(true);
      const storedKeys = secureGet<ApiKeys>(API_KEYS_KEY);
      if (storedKeys) {
        setKeys(storedKeys);
        console.log('API keys loaded successfully');
      } else {
        console.log('No API keys found in storage');
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadKeys();
  }, []);

  // Listen for updates from other components
  useEffect(() => {
    const handleApiKeyUpdate = () => {
      console.log('API key update event received');
      loadKeys();
    };

    window.addEventListener(apiKeyUpdateEvent, handleApiKeyUpdate);
    return () => {
      window.removeEventListener(apiKeyUpdateEvent, handleApiKeyUpdate);
    };
  }, []);

  // Save a key and notify other components
  const setApiKey = (type: 'openai' | 'claude', key: string) => {
    console.log(`Setting ${type} API key`);
    const updatedKeys = { ...keys, [type]: key };
    setKeys(updatedKeys);
    secureSet(API_KEYS_KEY, updatedKeys);
    triggerApiKeyUpdate(); // Notify all components using this hook
  };

  // Set both keys at once
  const setBothApiKeys = (openaiKey: string | null, claudeKey: string | null) => {
    const updatedKeys = { 
      openai: openaiKey !== null ? openaiKey : keys.openai,
      claude: claudeKey !== null ? claudeKey : keys.claude
    };
    setKeys(updatedKeys);
    secureSet(API_KEYS_KEY, updatedKeys);
    triggerApiKeyUpdate(); // Notify all components using this hook
  };

  // Clear all keys
  const clearApiKeys = () => {
    setKeys({ openai: null, claude: null });
    localStorage.removeItem(API_KEYS_KEY);
    triggerApiKeyUpdate(); // Notify all components using this hook
  };

  // Check if the required key exists
  const hasRequiredKey = (model: 'gpt' | 'claude'): boolean => {
    const hasKey = model === 'gpt' ? !!keys.openai : !!keys.claude;
    console.log(`Checking ${model} key: ${hasKey}`);
    return hasKey;
  };

  return {
    keys,
    setApiKey,
    setBothApiKeys,
    clearApiKeys,
    hasRequiredKey,
    isLoading
  };
}