'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { personas, PersonaType } from '@/types/personas';

export default function Home() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('rush_limbaugh');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Please enter both title and content');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/rewrite-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          persona: selectedPersona
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rewrite content');
      }
      
      const data = await response.json();
      
      // Save rewritten content to localStorage for next page
      localStorage.setItem('rewrittenContent', JSON.stringify({
        title: data.title,
        content: data.content,
        persona: selectedPersona
      }));
      
      // Navigate to rewrite page to show results
      router.push('/rewrite');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Find the currently selected persona
  const currentPersona = personas.find(p => p.id === selectedPersona) || personas[0];

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Conservative Commentator Content Rewriter
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Enter your article title and content below to rewrite it in the style of your chosen conservative commentator.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-1">
              Select Commentator Style
            </label>
            <div className="relative">
              <select
                id="persona"
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value as PersonaType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} - {persona.description}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Article Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the article title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Article Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the article content here"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the full article content to be rewritten in {currentPersona.name}'s style.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Rewriting...' : `Rewrite in ${currentPersona.name}'s Style`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
