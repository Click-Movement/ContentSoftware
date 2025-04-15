import axios from 'axios';
import * as cheerio from 'cheerio';

interface FetchedContent {
  title: string;
  content: string;
  metaDescription?: string;
  url: string;
}

/**
 * Fetches content from a given URL
 * @param url The URL to fetch content from
 * @returns Object containing the title, content, meta description, and original URL
 */
export async function fetchContentFromUrl(url: string): Promise<FetchedContent> {
  try {
    // Validate URL
    new URL(url); // Validate URL format
    
    // Fetch the content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim() || '';
    
    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Extract main content
    // This is a simplified approach - real-world implementation would need to be more sophisticated
    // to identify the main content area of different websites
    let content = '';
    
    // Try to find main content container
    const mainContent = $('article, .article, .post, .content, main, #content, #main');
    
    if (mainContent.length > 0) {
      // If we found a main content container, use it
      content = mainContent.first().text().trim();
    } else {
      // Otherwise, get all paragraphs
      $('p').each((_, element) => {
        const paragraphText = $(element).text().trim();
        if (paragraphText.length > 100) { // Only include substantial paragraphs
          content += paragraphText + '\n\n';
        }
      });
    }
    
    // If we still don't have content, get the body text
    if (!content) {
      content = $('body').text().trim();
    }
    
    return {
      title,
      content,
      metaDescription,
      url
    };
  } catch (error) {
    console.error('Error fetching content:', error);
    throw new Error(`Failed to fetch content from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
