import { NextRequest, NextResponse } from 'next/server';
import { rewriteInPersonaStyle, PersonaType } from '@/lib/aiPersonaRewriter';

export async function POST(request: NextRequest) {
  try {
    const { title, content, persona, model } = await request.json();
    
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
      'rush_limbaugh'
    ];
    
    // Use default persona if not specified or invalid
    const selectedPersona = validPersonas.includes(persona) 
      ? persona as PersonaType 
      : 'rush_limbaugh' as PersonaType;
    
    // Validate model selection
    const selectedModel = model === 'gpt' ? 'gpt' : 'claude';
    
    // Apply the AI-powered persona rewriting with model selection
    const rewrittenContent = await rewriteInPersonaStyle(
      title, 
      content, 
      selectedPersona,
      selectedModel
    );
    
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
    
    // Handle rate limiting or quota errors specifically
    const isRateLimitError = errorMessage.toLowerCase().includes('rate limit') || 
                           errorMessage.toLowerCase().includes('quota');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        isRateLimitError: isRateLimitError
      },
      { status: isRateLimitError ? 429 : 500 }
    );
  }
}
