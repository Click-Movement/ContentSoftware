import * as cheerio from 'cheerio';
import wiki from 'wikijs';
import axios from 'axios';

interface ImageResult {
  url: string;
  source: string;
  pageTitle?: string;
  pageUrl?: string;
  license: string;
  attribution?: string;
}

interface WikiSearchResults {
  results: string[];
  totalHits: number;
}

interface WikiPage {
  url(): string;
  images(): Promise<string[]>;
  // Add other methods you might use
}

// Define the type for wiki function
interface WikiJS {
  (): {
    search(term: string, limit: number): Promise<WikiSearchResults>;
    page(title: string): Promise<WikiPage>;
  };
}

// Type assertion for the wiki import
const typedWiki = wiki as unknown as WikiJS;

/**
 * Find a suitable non-copyright image from Wikipedia based on a search term
 * @param searchTerm The term to search for images
 * @returns Object containing image URL and attribution information
 */
export async function findWikipediaImage(searchTerm: string): Promise<ImageResult> {
  try {
    // Search Wikipedia for the term
    const searchResults = await typedWiki().search(searchTerm, 3);
    
    if (!searchResults.results || searchResults.results.length === 0) {
      throw new Error('No Wikipedia articles found for the search term');
    }
    
    // Try to get images from each result until we find a suitable one
    for (const pageTitle of searchResults.results) {
      try {
        const page = await typedWiki().page(pageTitle);
        const images = await page.images();
        
        // Filter out SVG images and look for suitable images
        // Define an interface for the filter conditions
        interface ImageFilterCriteria {
          lowerUrl: string;
          excludeExtensions: string[];
          excludeKeywords: string[];
        }
        
        const suitableImages: string[] = images.filter((img: string) => {
          const lowerUrl: string = img.toLowerCase();
          // Exclude SVGs, logos, icons, and maps which are often not suitable as featured images
          return !lowerUrl.endsWith('.svg') && 
           !lowerUrl.includes('logo') && 
           !lowerUrl.includes('icon') && 
           !lowerUrl.includes('map') &&
           !lowerUrl.includes('getty'); // Explicitly avoid Getty images
        });
        
        if (suitableImages.length > 0) {
          // Get the first suitable image
          const imageUrl = suitableImages[0];
          
          return {
            url: imageUrl,
            source: 'Wikipedia',
            pageTitle: pageTitle,
            pageUrl: page.url(),
            license: 'Wikipedia content is available under CC BY-SA 3.0 unless otherwise noted.'
          };
        }
      } catch (error) {
        console.error(`Error getting images from Wikipedia page ${pageTitle}:`, error);
        // Continue to the next result
      }
    }
    
    throw new Error('No suitable images found on Wikipedia');
  } catch (error) {
    console.error('Error finding Wikipedia image:', error);
    throw error;
  }
}

/**
 * Find a suitable non-copyright image from Unsplash based on a search term
 * @param searchTerm The term to search for images
 * @returns Object containing image URL and attribution information
 */
export async function findUnsplashImage(searchTerm: string): Promise<ImageResult> {
  try {
    // Search Unsplash for the term using their public API
    const response = await axios.get(`https://source.unsplash.com/featured/?${encodeURIComponent(searchTerm)}`);
    
    // The URL after redirects is the image URL
    const imageUrl = response.request.res.responseUrl;
    
    if (!imageUrl) {
      throw new Error('No image found on Unsplash');
    }
    
    return {
      url: imageUrl,
      source: 'Unsplash',
      license: 'Unsplash photos are freely usable under the Unsplash license',
      attribution: 'Photo from Unsplash'
    };
  } catch (error) {
    console.error('Error finding Unsplash image:', error);
    throw error;
  }
}

/**
 * Find a suitable non-copyright image from Pixabay based on a search term
 * @param searchTerm The term to search for images
 * @returns Object containing image URL and attribution information
 */
export async function findPixabayImage(searchTerm: string): Promise<ImageResult> {
  try {
    // Use web scraping to find images from Pixabay
    const response = await axios.get(`https://pixabay.com/images/search/${encodeURIComponent(searchTerm)}/`);
    const $ = cheerio.load(response.data);
    
    // Find image elements
    const imageElements = $('img.photo-result-image');
    
    if (imageElements.length === 0) {
      throw new Error('No images found on Pixabay');
    }
    
    // Get the first image URL
    const imageUrl = $(imageElements[0]).attr('src');
    
    if (!imageUrl) {
      throw new Error('Could not extract image URL from Pixabay');
    }
    
    return {
      url: imageUrl,
      source: 'Pixabay',
      license: 'Pixabay License - Free for commercial use, no attribution required',
      attribution: 'Image from Pixabay'
    };
  } catch (error) {
    console.error('Error finding Pixabay image:', error);
    throw error;
  }
}

/**
 * Find a suitable non-copyright image from multiple sources
 * @param searchTerm The term to search for images
 * @returns Object containing image URL and attribution information
 */
export async function findFreeImage(searchTerm: string): Promise<ImageResult> {
  // Type the array of source functions
  const sources: Array<(term: string) => Promise<ImageResult>> = [
    findWikipediaImage,
    findUnsplashImage,
    findPixabayImage
  ];
  
  let lastError = null;
  
  for (const sourceFunction of sources) {
    try {
      const imageInfo = await sourceFunction(searchTerm);
      return imageInfo;
    } catch (error) {
      lastError = error;
      // Continue to the next source
    }
  }
  
  // If we get here, all sources failed
  throw lastError || new Error('Failed to find a suitable image from any source');
}
