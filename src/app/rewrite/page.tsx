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
          
        } catch {
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
      <div className="w-full max-w-4xl mx-auto">
        {/* Enhanced Header with Gradient Background */}
        <header className="mb-8 text-center">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 px-4 rounded-lg shadow-lg mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Conservative Content Rewriter</h1>
            <p className="text-lg text-blue-100">Transform your content with distinctive conservative voices</p>
          </div>
        </header>
        
        {/* Step Indicator */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="bg-green-600 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="mt-2 text-sm font-medium text-green-800">Input</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-green-200"></div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-md">
                <span className="font-bold">2</span>
              </div>
              <span className="mt-2 text-sm font-medium text-blue-800">Preview</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <div className="bg-gray-200 text-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
                <span className="font-bold">3</span>
              </div>
              <span className="mt-2 text-sm font-medium text-gray-600">Publish</span>
            </div>
          </div>
        </div>
        
        {/* Success Notification (when content is loaded) */}
        {rewrittenContent && !error && !isLoading && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Content successfully rewritten in {personaName}&#39;s style!</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-blue-800">{personaName} Style Rewrite</h2>
          </div>
          
          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : rewrittenContent ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Rewritten Title:</h3>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">{rewrittenContent.title}</h1>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Rewritten Content:</h3>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: rewrittenContent.content }} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <button
                    onClick={() => router.push('/')}
                    className="order-2 sm:order-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Edit Content
                  </button>
                  
                  <button
                    onClick={handleProceedToWordPress}
                    className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Proceed to Publish
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
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Conservative Content Rewriter &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
