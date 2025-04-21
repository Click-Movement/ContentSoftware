'use client';

import { useState, useEffect } from 'react';
import { useApiKeys } from '@/hooks/useApiKeys';

export default function ApiKeyInput({ onClose }: { onClose?: () => void }) {
  const { keys, setBothApiKeys, isLoading } = useApiKeys();
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Mask existing keys for display
    if (keys.openai) setOpenaiKey('••••••••••••••••••••••••••••••');
    if (keys.claude) setClaudeKey('••••••••••••••••••••••••••••••');
  }, [keys]);

  const handleSave = () => {
    try {
      // Create variables to hold the new key values or null if unchanged
      let newOpenaiKey = null;
      let newClaudeKey = null;
      
      if (openaiKey && openaiKey !== '••••••••••••••••••••••••••••••') {
        newOpenaiKey = openaiKey;
      }
      
      if (claudeKey && claudeKey !== '••••••••••••••••••••••••••••••') {
        newClaudeKey = claudeKey;
      }
      
      // Set both keys at once if either has changed
      if (newOpenaiKey !== null || newClaudeKey !== null) {
        setBothApiKeys(newOpenaiKey, newClaudeKey);
        console.log('API keys updated');
      }
      
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving keys:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Your API Keys</h2>
      <p className="text-sm text-gray-600 mb-4">
        Your API keys are stored securely in your browser with encryption.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700">
            OpenAI API Key
          </label>
          <input
            id="openai-key"
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="sk-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
          {keys.openai && (
            <p className="mt-1 text-xs text-green-600">
              ✓ OpenAI key is saved
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="claude-key" className="block text-sm font-medium text-gray-700">
            Anthropic Claude API Key
          </label>
          <input
            id="claude-key"
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="sk-ant-..."
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
          />
          {keys.claude && (
            <p className="mt-1 text-xs text-green-600">
              ✓ Claude key is saved
            </p>
          )}
        </div>
        
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save API Keys
        </button>
        
        {isSaved && (
          <div className="text-green-600 text-sm text-center mt-2">
            API keys saved successfully!
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Need API keys? Get them here:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              OpenAI API Keys
            </a>
          </li>
          <li>
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Anthropic Claude API Keys
            </a>
          </li>
        </ul>
      </div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      )}
    </div>
  );
}