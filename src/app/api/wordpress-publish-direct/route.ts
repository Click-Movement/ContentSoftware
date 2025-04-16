import { NextRequest, NextResponse } from 'next/server';
import WPAPI from 'wpapi';
// import { PersonaType } from '@/types/personas';

export async function POST(request: NextRequest) {
  try {
    const { title, content, wpUrl, username, password, persona } = await request.json();
    
    if (!title || !content || !wpUrl || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Initialize WordPress API client
    const wp = new WPAPI({
      endpoint: `${wpUrl}/wp-json`,
      username: username,
      password: password
    });
    
    // Prepare post content - Fix duplicate H1 issue by removing the H1 tag from content
    // The title will be used as the post title in WordPress, so we don't need it in the content
    let contentWithoutH1 = content.replace(/<h1>.*?<\/h1>/i, '');
    
    // Ensure proper paragraph formatting for WordPress
    // If content doesn't already use proper <p> tags, add them
    if (!contentWithoutH1.includes('<p>')) {
      // Split content by double newlines and wrap each paragraph in <p> tags
      contentWithoutH1 = contentWithoutH1
        .split(/\n\n+/)
        .filter((p: string) => p.trim().length > 0)
        .map((p: string) => `<p>${p}</p>`)
        .join('');
    }
    
    // Ensure there are no empty paragraphs
    contentWithoutH1 = contentWithoutH1.replace(/<p>\s*<\/p>/g, '');
    
    // Add a note about which persona's style was used (if provided)
    let contentWithPersonaNote = contentWithoutH1;
    if (persona) {
      // Get persona display name based on ID
      let personaName = "Rush Limbaugh"; // Default
      
      switch (persona) {
        case 'charlie_kirk':
          personaName = "Charlie Kirk";
          break;
        case 'larry_elder':
          personaName = "Larry Elder";
          break;
        case 'glenn_beck':
          personaName = "Glenn Beck";
          break;
        case 'laura_loomer':
          personaName = "Laura Loomer";
          break;
        case 'tomi_lahren':
          personaName = "Tomi Lahren";
          break;
        case 'rush_limbaugh':
          personaName = "Rush Limbaugh";
          break;
      }
      
      // Add a note at the end of the content
      contentWithPersonaNote += `<p><em>This article was written in the style of ${personaName}.</em></p>`;
    }
    
    // Create post as draft
    const post = await wp.posts().create({
      title: title,
      content: contentWithPersonaNote,
      status: 'draft'
    });
    
    // Try to find and add a featured image if available
    try {
      // This part would typically include code to find and upload an image
      // For now, we'll just return the post data
      return NextResponse.json({
        success: true,
        message: 'Post created as draft',
        postId: post.id,
        editUrl: `${wpUrl}/wp-admin/post.php?post=${post.id}&action=edit`,
        persona: persona || 'rush_limbaugh' // Return the persona used
      });
    } catch (imageError) {
      console.error('Error adding featured image:', imageError);
      // Still return success since the post was created
      return NextResponse.json({
        success: true,
        message: 'Post created as draft (without featured image)',
        postId: post.id,
        editUrl: `${wpUrl}/wp-admin/post.php?post=${post.id}&action=edit`,
        persona: persona || 'rush_limbaugh' // Return the persona used
      });
    }
  } catch (error) {
    console.error('Error in wordpress-publish-direct API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to publish to WordPress',
        details: error
      },
      { status: 500 }
    );
  }
}
