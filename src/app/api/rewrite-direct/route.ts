import { NextRequest, NextResponse } from 'next/server';
import { rewriteInPersonaStyle, PersonaType, AIModelType } from '@/lib/aiPersonaRewriter';

// Add this export to use Edge Runtime
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { title, content, persona, model, userApiKeys } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Validate persona type
    const validPersonas = [
      'charlie_kirk',
      'larry_elder', 
      'glenn_beck', 
      'laura_loomer', 
      'tomi_lahren', 
      'rush_limbaugh',
      'ben_shapiro'  // Add Ben Shapiro to valid personas list
    ];
    
    // Use default persona if not specified or invalid
    const selectedPersona = validPersonas.includes(persona) 
      ? persona as PersonaType 
      : 'rush_limbaugh' as PersonaType;
    
    // Validate model selection
    const selectedModel = model === 'gpt' ? 'gpt' : 'claude';
    
    // Check API key requirements
    if (selectedModel === 'gpt' && !userApiKeys?.openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is required for GPT model', missingKey: 'openai' },
        { status: 400 }
      );
    }
    
    if (selectedModel === 'claude' && !userApiKeys?.claude) {
      return NextResponse.json(
        { error: 'Claude API key is required for Claude model', missingKey: 'claude' },
        { status: 400 }
      );
    }
    
    // Add timeout for the API call
    const rewrittenContent = await Promise.race([
      rewriteInPersonaStyle(title, content, selectedPersona, selectedModel as AIModelType, userApiKeys),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API call timed out')), 45000)
      ) as Promise<never>
    ]);
    
    return NextResponse.json({
      success: true,
      title: rewrittenContent.title,
      content: rewrittenContent.content,
      persona: selectedPersona,
      model: selectedModel
    });
  } catch (error) {
    console.error('Error in AI rewrite API:', error);
    
    // Check for specific AI-related errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to rewrite content';
    
    // Handle rate limiting, quota errors, or timeouts specifically
    const isRateLimitError = errorMessage.toLowerCase().includes('rate limit') || 
                           errorMessage.toLowerCase().includes('quota');
    const isTimeoutError = errorMessage.toLowerCase().includes('timed out');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        isRateLimitError,
        isTimeoutError
      },
      { status: isRateLimitError ? 429 : isTimeoutError ? 504 : 500 }
    );
  }
}
