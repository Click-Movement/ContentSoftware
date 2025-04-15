import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Return the direct content input
    return NextResponse.json({
      title,
      content,
      url: '' // Empty URL since we're not fetching from a URL
    });
  } catch (error) {
    console.error('Error in fetch-content API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process content' },
      { status: 500 }
    );
  }
}
