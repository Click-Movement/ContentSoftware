import { NextRequest, NextResponse } from 'next/server';
import { rewriteContent } from '@/lib/contentRewriter';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Rewrite content with SEO optimization
    const rewrittenContent = await rewriteContent(
      title,
      content,
      '', // No meta description since we're using direct input
      '', // No URL since we're not fetching from a URL
      {
        maintainLength: true, // Ensure we maintain the original length as requested
        seoKeywords: [], // No keywords needed
      }
    );
    
    return NextResponse.json(rewrittenContent);
  } catch (error) {
    console.error('Error in rewrite-content API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}
