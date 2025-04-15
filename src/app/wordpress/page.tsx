'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { personas, PersonaType } from '@/types/personas';

export default function WordPressPage() {
  const [wpUrl, setWpUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rewrittenContent, setRewrittenContent] = useState<{
    title: string;
    content: string;
    persona: PersonaType;
  } | null>(null);
  const router = useRouter();
  
  // Load rewritten content from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedContent = localStorage.getItem('rewrittenContent');
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          setRewrittenContent(parsedContent);
        } catch (err) {
          setError('Failed to load rewritten content. Please go back and rewrite content first.');
        }
      } else {
        setError('No rewritten content found. Please go back and rewrite content first.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wpUrl || !username || !password) {
      setError('Please fill in all WordPress details');
      return;
    }
    
    if (!rewrittenContent) {
      setError('No rewritten content found. Please go back and rewrite content first.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/wordpress-publish-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: rewrittenContent.title,
          content: rewrittenContent.content,
          wpUrl,
          username,
          password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish to WordPress');
      }
      
      const data = await response.json();
      setSuccess(`Successfully published to WordPress as a draft. Post ID: ${data.postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Find the persona name if available
  const personaName = rewrittenContent?.persona 
    ? (personas.find(p => p.id === rewrittenContent.persona)?.name || 'Selected Commentator')
    : 'Selected Commentator';

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Publish {personaName} Style Content to WordPress
        </h1>
        
        {!rewrittenContent ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'No rewritten content found. Please go back and rewrite content first.'}
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8 text-center">
              Enter your WordPress site details below to publish the rewritten content as a draft.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="wpUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  WordPress Site URL
                </label>
                <input
                  type="url"
                  id="wpUrl"
                  value={wpUrl}
                  onChange={(e) => setWpUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the full URL of your WordPress site (e.g., https://yoursite.com)
                </p>
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your WordPress username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your WordPress password or application password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  For better security, consider using an application password instead of your main account password.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/rewrite')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Back to Rewritten Content
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Publishing...' : 'Publish as Draft'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
