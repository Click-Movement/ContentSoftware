import { NextRequest, NextResponse } from 'next/server';
import WPAPI from 'wpapi';
import { fetchContentFromUrl } from '@/lib/contentFetcher';
import { rewriteContent } from '@/lib/contentRewriter';

export async function POST(request: NextRequest) {
  try {
    const { sourceUrl, wpUrl, username, password } = await request.json();
    
    if (!sourceUrl || !wpUrl || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Fetch original content
    const originalContent = await fetchContentFromUrl(sourceUrl);
    
    // Rewrite content with SEO optimization
    const rewrittenContent = await rewriteContent(
      originalContent.title,
      originalContent.content,
      originalContent.metaDescription || '',
      originalContent.url,
      {
        maintainLength: true, // Ensure we maintain the original length
        seoKeywords: [], // No keywords specified here, they should have been applied in the previous step
      }
    );
    
    // Configure WordPress API
    let wp;
    try {
      // Ensure the WordPress URL has the correct format for the API
      const apiUrl = wpUrl.endsWith('/') ? `${wpUrl}wp-json` : `${wpUrl}/wp-json`;
      
      wp = new WPAPI({
        endpoint: apiUrl,
        username: username,
        password: password,
      });
    } catch (wpError) {
      console.error('Error configuring WordPress API:', wpError);
      return NextResponse.json(
        { error: 'Failed to connect to WordPress API. Please check your site URL.' },
        { status: 400 }
      );
    }
    
    // Create a draft post
    try {
      const post = await wp.posts().create({
        title: rewrittenContent.title,
        content: rewrittenContent.htmlContent,
        excerpt: rewrittenContent.metaDescription,
        status: 'draft', // Set as draft as requested
      });
      
      return NextResponse.json({
        success: true,
        message: 'Content published to WordPress as draft',
        postId: post.id,
        postUrl: post.link,
      });
    } catch (postError: unknown) {
      console.error('Error publishing to WordPress:', postError);
      
      // Handle common WordPress API errors
      const typedError = postError as { code?: string; message?: string };
      
      if (typedError.code === 'rest_cannot_create') {
        return NextResponse.json(
          { error: 'Authentication failed. Please check your username and password.' },
          { status: 401 }
        );
      } else if (typedError.code === 'rest_invalid_param') {
        return NextResponse.json(
          { error: 'Invalid parameters. WordPress rejected the post content.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: typedError.message || 'Failed to publish to WordPress' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in wordpress-publish API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish to WordPress' },
      { status: 500 }
    );
  }
}
