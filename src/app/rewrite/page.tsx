'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { personas, PersonaType } from '@/types/personas';

export default function RewritePage() {
  const [rewrittenContent, setRewrittenContent] = useState<{
    title: string;
    content: string;
    persona: PersonaType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Load rewritten content from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      const savedContent = localStorage.getItem('rewrittenContent');
      if (savedContent) {
        try {
          const parsedContent = JSON.parse(savedContent);
          setRewrittenContent(parsedContent);
        } catch (err) {
          setError('Failed to load rewritten content. Please try again.');
        }
      } else {
        setError('No rewritten content found. Please go back and rewrite content first.');
      }
      setIsLoading(false);
    }
  }, []);

  const handleProceedToWordPress = () => {
    router.push('/wordpress');
  };

  // Find the persona name if available
  const personaName = rewrittenContent?.persona 
    ? (personas.find(p => p.id === rewrittenContent.persona)?.name || 'Selected Commentator')
    : 'Selected Commentator';

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
          {personaName} Style Rewrite
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : rewrittenContent ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Rewritten Title:</h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h1 className="text-xl font-bold">{rewrittenContent.title}</h1>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Rewritten Content:</h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: rewrittenContent.content }} />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                onClick={() => router.push('/')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Back to Home
              </button>
              
              <button
                onClick={handleProceedToWordPress}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Proceed to WordPress
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No content found. Please go back and rewrite content first.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
