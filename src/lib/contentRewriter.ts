import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

interface RewriteOptions {
  maintainLength?: boolean;
  seoKeywords?: string[];
}

/**
 * Rewrite content with conservative narrative guidelines
 * @param title Original title
 * @param content Original content
 * @param metaDescription Meta description (optional)
 * @param originalUrl Original URL (optional)
 * @param options Rewrite options
 * @returns Rewritten content with HTML formatting
 */
export async function rewriteContent(
  title: string,
  content: string,
  metaDescription: string = '',
  originalUrl: string = '',
  options: RewriteOptions = {}
) {
  try {
    // Create a system prompt with conservative narrative guidelines
    const systemPrompt = `
You are an expert content rewriter specializing in creating conservative narrative articles with SEO optimization.

## Conservative Narrative Framework
When rewriting, incorporate these fundamental conservative principles:
1. Enduring Moral Order: Emphasize belief in permanent moral truths and human nature as constant.
2. Custom, Convention, and Continuity: Highlight the importance of established traditions and social continuity.
3. Limited Government: Emphasize that government powers should be limited to those named in the Constitution.
4. Individual Liberty and Property Rights: Stress the connection between freedom and private property.
5. Voluntary Community: Emphasize local decision-making and family autonomy.
6. Prudent Restraints on Power: Advocate for constitutional restrictions and limitations on government authority.
7. Balance of Permanence and Progress: Present change as most beneficial when it harmonizes with existing traditions.

## Conservative Framing Techniques
- Use terms like "constitutional," "traditional," "founding principles," "individual liberty," and "free enterprise"
- Frame government programs in terms of their costs and unintended consequences
- Emphasize personal responsibility over government solutions
- Reference founding documents and historical precedents
- Highlight the importance of faith, family, and community
- Present free markets as the most effective way to create prosperity
- Express skepticism toward centralized authority and bureaucracy

## Content Structure Requirements
1. Length: The rewritten article must be between 300-500 words
2. Heading Structure:
   - Exactly ONE H1 tag containing the primary keyword/topic
   - 2-3 H2 tags for main content sections
   - H3 tags for subsections under H2 headings when needed
3. Content Organization:
   - Introduction (50-75 words): Hook reader with conservative framing of the topic
   - Main Body (200-350 words): Divide into 2-3 sections with H2 headings
   - Conclusion (50-75 words): Reinforce conservative principles related to the topic

## Content Quality Guidelines
- Present conservative viewpoints while maintaining factual accuracy
- Use clear, concise language accessible to general audience
- Focus on key aspects most relevant to conservative perspective
- Prioritize depth over breadth on selected points
`;

    // Create a user prompt with the content to rewrite
    const userPrompt = `
Please rewrite the following article with a conservative narrative framework while optimizing for SEO:

Title: ${title}

Content:
${content}

${metaDescription ? `Meta Description: ${metaDescription}` : ''}
${originalUrl ? `Original URL: ${originalUrl}` : ''}

${options.maintainLength ? 'Important: The rewritten article should maintain approximately the same length as the original.' : 'The rewritten article should be between 300-500 words.'}

Please provide the rewritten article with proper HTML heading tags (h1, h2, h3) and paragraph tags.
`;

    // Call OpenAI API to rewrite the content
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Extract the rewritten content
    const rewrittenHtmlContent = response.choices[0]?.message?.content || '';

    // Extract title from the rewritten content (assuming it's in an h1 tag)
    const titleMatch = rewrittenHtmlContent.match(/<h1>(.*?)<\/h1>/i);
    const rewrittenTitle = titleMatch ? titleMatch[1] : title;

    // Extract meta description (first paragraph or first 160 characters)
    const firstParagraphMatch = rewrittenHtmlContent.match(/<p>(.*?)<\/p>/i);
    const rewrittenMetaDescription = firstParagraphMatch 
      ? firstParagraphMatch[1].substring(0, 160) 
      : rewrittenHtmlContent.replace(/<[^>]*>/g, '').substring(0, 160);

    return {
      title: rewrittenTitle,
      content: rewrittenHtmlContent.replace(/<h1>.*?<\/h1>/i, ''), // Remove h1 tag from content
      htmlContent: rewrittenHtmlContent,
      metaDescription: rewrittenMetaDescription,
      originalUrl: originalUrl
    };
  } catch (error) {
    console.error('Error rewriting content:', error);
    throw new Error('Failed to rewrite content. Please try again later.');
  }
}
