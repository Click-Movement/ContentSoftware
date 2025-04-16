import { NextRequest, NextResponse } from 'next/server';
import { applyLimbaughStyle } from '@/lib/limbaughStyleRewriter';
import { applyCharlieKirkStyle } from '@/lib/charlieKirkStyleRewriter';
import { applyLarryElderStyle } from '@/lib/larryElderStyleRewriter';
import { applyGlennBeckStyle } from '@/lib/glennBeckStyleRewriter';
import { applyLauraLoomerStyle } from '@/lib/lauraLoomerStyleRewriter';
import { applyTomiLahrenStyle } from '@/lib/tomiLahrenStyleRewriter';
// import { PersonaType } from '@/types/personas';

export async function POST(request: NextRequest) {
  try {
    const { title, content, persona } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Apply the selected persona's style transformation
    let rewrittenContent;
    
    switch (persona) {
      case 'charlie_kirk':
        rewrittenContent = applyCharlieKirkStyle(title, content);
        break;
      case 'larry_elder':
        rewrittenContent = applyLarryElderStyle(title, content);
        break;
      case 'glenn_beck':
        rewrittenContent = applyGlennBeckStyle(title, content);
        break;
      case 'laura_loomer':
        rewrittenContent = applyLauraLoomerStyle(title, content);
        break;
      case 'tomi_lahren':
        rewrittenContent = applyTomiLahrenStyle(title, content);
        break;
      case 'rush_limbaugh':
      default:
        // Default to Rush Limbaugh style if no persona is specified or if it's explicitly selected
        rewrittenContent = applyLimbaughStyle(title, content);
        break;
    }
    
    return NextResponse.json({
      success: true,
      title: rewrittenContent.title,
      content: rewrittenContent.content,
      persona: persona || 'rush_limbaugh' // Return the persona used
    });
  } catch (error) {
    console.error('Error in rewrite-direct API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}
