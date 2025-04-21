import OpenAI from 'openai';
import { RewrittenContent } from './limbaughStyleRewriter';
import Anthropic from '@anthropic-ai/sdk';

// Initialize API clients
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || '',
//   dangerouslyAllowBrowser: true
// });

// const claude = new Anthropic({
//   apiKey: process.env.CLAUDE_API_KEY || ''
// });

export type PersonaType = 
  'charlie_kirk' | 
  'glenn_beck' | 
  'larry_elder' | 
  'laura_loomer' | 
  'rush_limbaugh' |
  'tomi_lahren' |
  'ben_shapiro';

export type AIModelType = 'gpt' | 'claude';

/**
 * Rewrite content in the style of a specific conservative commentator using AI
 * @param title Original title
 * @param content Original content to rewrite
 * @param persona The conservative persona style to use
 * @param model The AI model to use (claude or gpt)
 * @param userApiKeys Optional user-provided API keys for OpenAI and Claude
 * @returns Rewritten content with HTML formatting
 */
export async function rewriteInPersonaStyle(
  title: string,
  content: string,
  persona: PersonaType,
  model: AIModelType = 'claude',
  userApiKeys?: { openai?: string | null; claude?: string | null }
): Promise<RewrittenContent> {
  try {
    // Create a persona-specific prompt that explicitly captures their style elements
    const prompt = createDetailedPersonaPrompt(title, content, persona);
    
    // Use the selected model for rewriting
    if (model === 'gpt') {
      return await rewriteWithGPT(prompt, persona, content, userApiKeys?.openai || undefined);
    } else {
      return await rewriteWithClaude(prompt, persona, content, userApiKeys?.claude || undefined);
    }
  } catch (error) {
    console.error(`Error rewriting in ${persona} style with ${model}:`, error);
    throw new Error(`Failed to rewrite content in ${persona} style with ${model}. Please try again later.`);
  }
}

// Update title extraction in rewriteWithClaude
async function rewriteWithClaude(
  prompt: string, 
  persona: PersonaType,
  originalContent: string,
  apiKey?: string | null
): Promise<RewrittenContent> {
  try {
    // Calculate token limit
    const targetTokens = Math.min(3800, Math.max(800, calculateTargetLength(originalContent)));
    
    const claudeClient = new Anthropic({
      apiKey: apiKey || process.env.CLAUDE_API_KEY || '',
    });

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: targetTokens,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.75
    });

    // Safer extraction of text content
    let fullText = '';
    try {
      if (response.content && 
          Array.isArray(response.content) && 
          response.content.length > 0 &&
          response.content[0].type === 'text') {
        fullText = response.content[0].text || '';
      }
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new Error("Failed to parse Claude's response");
    }
    
    if (!fullText) {
      throw new Error("Empty response from Claude API");
    }

    // Parse out title and content with improved error handling
    let extractedTitle = '';
    let extractedContent = '';

    try {
      const titleMatch = fullText.match(/Title:?\s*(?:\n)?(.*?)(?:\n\n|\n(?=Content|<p>))/i);
      
      // Check if we got a valid title that's not a placeholder
      if (titleMatch && titleMatch[1] && 
          titleMatch[1].trim().length > 5 && 
          !titleMatch[1].toLowerCase().includes('style title')) {
        extractedTitle = titleMatch[1].trim();
      } else {
        // Generate a fallback title
        extractedTitle = generateFallbackTitle(persona, originalContent || '');
      }
      
      // Extract content as before
      const contentWithoutTitle = fullText.replace(/Title:?\s*(?:\n)?.*?(?:\n\n|\n(?=Content|<p>))/i, '').trim();
      extractedContent = ensureHtmlFormatting(contentWithoutTitle);
    } catch (parseError) {
      console.error("Error parsing title/content:", parseError);
      // Fallback to using the entire response as content
      extractedContent = ensureHtmlFormatting(fullText);
      extractedTitle = generateFallbackTitle(persona, originalContent || '');
    }

    return {
      title: extractedTitle,
      content: extractedContent
    };
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Claude failed to rewrite the content: ${error}`);
  }
}

// Similarly update rewriteWithGPT
async function rewriteWithGPT(
  prompt: string, 
  persona: PersonaType,
  originalContent: string,
  apiKey?: string | null
): Promise<RewrittenContent> {
  try {
    const targetTokens = Math.min(3500, Math.max(800, calculateTargetLength(originalContent)));
    
    const openaiClient = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4', 
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.75,
      max_tokens: targetTokens
    });

    // Safer extraction of content
    let fullText = '';
    try {
      if (response.choices && 
          response.choices.length > 0 && 
          response.choices[0].message && 
          response.choices[0].message.content) {
        fullText = response.choices[0].message.content;
      }
    } catch (parseError) {
      console.error("Error parsing GPT response:", parseError);
      throw new Error("Failed to parse GPT's response");
    }
    
    if (!fullText) {
      throw new Error("Empty response from OpenAI API");
    }

    // Parse out title and content with improved error handling
    let extractedTitle = '';
    let extractedContent = '';

    try {
      const titleMatch = fullText.match(/Title:?\s*(?:\n)?(.*?)(?:\n\n|\n(?=Content|<p>))/i);
      
      // Check if we got a valid title that's not a placeholder
      if (titleMatch && titleMatch[1] && 
          titleMatch[1].trim().length > 5 && 
          !titleMatch[1].toLowerCase().includes('style title')) {
        extractedTitle = titleMatch[1].trim();
      } else {
        // Generate a fallback title
        extractedTitle = generateFallbackTitle(persona,  originalContent ||  '');
      }
      
      // Extract content as before
      const contentWithoutTitle = fullText.replace(/Title:?\s*(?:\n)?.*?(?:\n\n|\n(?=Content|<p>))/i, '').trim();
      extractedContent = ensureHtmlFormatting(contentWithoutTitle);
    } catch (parseError) {
      console.error("Error parsing title/content:", parseError);
      // Fallback to using the entire response as content
      extractedContent = ensureHtmlFormatting(fullText);
      extractedTitle = generateFallbackTitle(persona, originalContent || '');
    }

    return {
      title: extractedTitle,
      content: extractedContent
    };
  } catch (error) {
    console.error("GPT API error:", error);
    throw new Error(`GPT failed to rewrite the content: ${error}`);
  }
}

// Improve HTML formatting function with better error handling
function ensureHtmlFormatting(content: string): string {
  try {
    // If content already has paragraph tags, return as is
    if (!content || typeof content !== 'string') {
      return '<p>Content generation failed. Please try again.</p>';
    }
    
    if (content.includes('<p>')) return content.trim();
    
    // Otherwise, add paragraph tags
    return content
      .split(/\n{2,}/)
      .filter(p => p.trim().length > 0)
      .map(p => `<p>${p.trim()}</p>`)
      .join('') || '<p>Content generation failed. Please try again.</p>';
  } catch (error) {
    console.error("Error formatting HTML:", error);
    return '<p>Content generation failed. Please try again.</p>';
  }
}

// Replace or add this utility function for more natural length variation
function calculateTargetLength(originalContent: string): number {
  // Count words in original content
  const wordCount = originalContent.split(/\s+/).length;
  
  // Add natural variation with these rules:
  // - Very short content (< 100 words): Allow 10-30% expansion
  // - Short content (100-300 words): Allow 5-20% variation
  // - Medium content (300-800 words): Allow 0-15% variation
  // - Long content (800+ words): Aim for slight compression (0-10% reduction)
  
  let minMultiplier = 1.0;
  let maxMultiplier = 1.0;
  
  if (wordCount < 100) {
    minMultiplier = 1.1; 
    maxMultiplier = 1.3;
  } else if (wordCount < 300) {
    minMultiplier = 0.95;
    maxMultiplier = 1.2;
  } else if (wordCount < 800) {
    minMultiplier = 0.9;
    maxMultiplier = 1.15;
  } else {
    minMultiplier = 0.9;
    maxMultiplier = 1.0;
  }
  
  // Apply random variation within our determined range
  const multiplier = minMultiplier + Math.random() * (maxMultiplier - minMultiplier);
  
  // Calculate target tokens (approximately 0.75 tokens per word)
  const targetWords = Math.round(wordCount * multiplier);
  const targetTokens = Math.round(targetWords / 0.75);
  
  return targetTokens;
}

// Update the lengthGuidance in createDetailedPersonaPrompt to include title length instructions
function createDetailedPersonaPrompt(title: string, content: string, persona: PersonaType): string {
  // Calculate appropriate length for response
  const wordCount = content.split(/\s+/).length;
  
  // Create more natural length guidance with added instructions
  const lengthGuidance = `CONTENT LENGTH:
- Write in a natural length that fits the persona's style
- The original content is approximately ${wordCount} words
- Avoid making the content significantly longer than the original
- Short original content should get concise outputs
- Focus on quality and authenticity rather than length

TITLE LENGTH:
- Keep titles SHORT and CONCISE (5-10 words maximum)
- Create punchy, one-line titles that capture attention
- Avoid long, multi-part titles with excessive explanation
- Make titles memorable and shareable

IMPORTANT INSTRUCTIONS:
- ALWAYS create a completely new title in the persona's style
- NEVER respond with placeholder titles like "[Name] Style Title"
- Generate fresh content even if the input already seems to match the persona's style
- Ensure your output includes the persona's distinctive phrases and rhetorical patterns
- Make the content original while maintaining the core message and facts
`;

  switch (persona) {
    case 'charlie_kirk':
      return createCharlieKirkPrompt(title, content, lengthGuidance);
    case 'glenn_beck':
      return createGlennBeckPrompt(title, content, lengthGuidance);
    case 'larry_elder':
      return createLarryElderPrompt(title, content, lengthGuidance);
    case 'laura_loomer':
      return createLauraLoomerPrompt(title, content, lengthGuidance);
    case 'rush_limbaugh':
      return createRushLimbaughPrompt(title, content, lengthGuidance);
    case 'tomi_lahren':
      return createTomiLahrenPrompt(title, content, lengthGuidance);
    case 'ben_shapiro':
      return createBenShapiroPrompt(title, content, lengthGuidance);
    default:
      throw new Error(`Unknown persona: ${persona}`);
  }
}

// Add this at the beginning of each persona prompt function
// function createGenericPersonaPrompt(title: string, content: string, lengthGuidance: string, persona: string): string {
//   const basePrompt = `
// TASK: Rewrite the following article in ${persona}'s exact style and voice.

// ${lengthGuidance}

// IMPORTANT INSTRUCTIONS:
// - ALWAYS create a NEW title in ${persona}'s style, even if the original title already seems similar
// - Generate FRESH content that captures ${persona}'s unique voice and rhetorical patterns
// - Don't simply return the original content if it seems similar - recreate it in ${persona}'s authentic style
// - Ensure the output has the distinctive markers and phrases of ${persona}'s communication style

// ORIGINAL TITLE:
// ${title}

// ORIGINAL CONTENT:
// ${content}

// OUTPUT FORMAT:
// Title: [Your ${persona}-style title]

// Content:
// [Complete ${persona}-style content with HTML paragraph tags]
// `;

//   return basePrompt;
// }

function createCharlieKirkPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Charlie Kirk's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For campus-related topics, use prefixes like "Campus Indoctrination:", "The Left's War on Students:", "Academic Freedom Crisis:", "Campus Thought Police:"
- For America-related topics, use prefixes like "America First:", "Defending Our Nation:", "Patriots Must Know:", "The Fight for America:"
- For general topics, use "FACT:", "The Truth About", "Why Americans Should Care:", "The Left Doesn't Want You To See"
- Always end titles with exclamation marks!

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Let me be clear about something."
  * "Here's what you need to understand."
  * "This is absolutely critical."
  * "The radical left doesn't want you to know this."
  * "I'm going to tell you something that the mainstream media won't."
  * "Young Americans need to understand this."
  * "This is a perfect example of what we're fighting against."
- For the main topic, use phrases like:
  * "What's happening with [TOPIC] is exactly what we've been warning about at Turning Point USA."
  * "The left's agenda on [TOPIC] is destroying our country's future."
  * "[TOPIC] is ground zero for the battle between American values and radical leftism."
  * "Young Americans are being lied to about [TOPIC] every single day."

PARAGRAPH TRANSITIONS:
- "Here's what's really happening."
- "Let me break this down for you."
- "The facts are undeniable."
- "This is where it gets interesting."
- "The mainstream media won't tell you this."
- "Let's look at what's really going on."
- "This is the part they don't want you to see."

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "Why aren't more people talking about this?"
- "Isn't it interesting how the left always avoids these facts?"
- "How can anyone still believe the mainstream narrative?"
- "When will Americans wake up to what's really happening?"
- "Doesn't this prove exactly what we've been saying?"

SIGNATURE PHRASES TO INCLUDE:
- "This is exactly what we talk about at Turning Point USA."
- "The radical left can't hide from these facts."
- "This is why we need to defend our constitutional rights."
- "Young Americans deserve to know the truth."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "crisis"
- Replace "said/stated/mentioned" with "admitted"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "the facts show"
- Replace "it is possible that" with "make no mistake,"
- Replace "it seems that" with "it's clear that"

CLOSING STYLE:
- Start with phrases like "Let me leave you with this final thought." or "Here's the bottom line."
- Include a call to action like "We must stand up for American values and constitutional principles before it's too late."
- End with a statement like "The future of our constitutional republic is at stake." or "America is worth fighting for."

SPECIAL SECTIONS:
- If facts are available, include a "FACT CHECK" section
- If the topic relates to campus/education, include a "CAMPUS SPOTLIGHT" section about indoctrination

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Kirk's distinctive style

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Kirk-style title]

Content:
[Complete Kirk-style content with HTML paragraph tags]
`;
}

function createGlennBeckPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Glenn Beck's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For constitution-related topics: "The Constitutional Crisis of [Topic]!", "Freedom Alert: [Topic]!", "Liberty at Risk: [Topic]!"
- For history-related topics: "History Repeating: [Topic]!", "The Founders Warned About [Topic]!", "The Historical Pattern of [Topic]!"
- For general topics: "Connect the Dots: [Topic]!", "The Truth Behind [Topic]!", "Warning Signs: [Topic]!"
- Always end titles with exclamation marks!
- Use dramatic, urgent framing with historical connections

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "I want you to imagine something."
  * "Let me take you back in history for a moment."
  * "There's something happening in America that should concern all of us."
  * "Our Founding Fathers warned us about this."
  * "I've been studying this for years, and what I've found will shock you."
  * "Connect the dots with me for a moment."
  * "The Constitution provides a clear answer to this issue."
- For the main topic, use phrases like:
  * "What's happening with [TOPIC] is exactly what the Founders feared."
  * "The situation with [TOPIC] has historical parallels that we need to understand."
  * "[TOPIC] represents a critical moment for our constitutional republic."
  * "The truth about [TOPIC] is being hidden from the American people."
- Include emotional storytelling elements or personal anecdotes
- Create a sense of urgency or impending crisis

PARAGRAPH TRANSITIONS:
- "Now, let's connect the dots."
- "Here's what you need to understand."
- "The historical parallels are striking."
- "The Constitution is clear on this."
- "Let me show you something important."
- "This is where it gets interesting."
- "The Founders anticipated this very situation."
- "I've been warning about this for years."
- "This might sound crazy, but bear with me."

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "What would the Founders say about this?"
- "Have we forgotten the lessons of history?"
- "Can you see the pattern emerging?"
- "Where in the Constitution does it authorize this?"
- "Are we connecting the dots yet?"
- "What happens next if we continue down this path?"
- "Is this the America our Founders envisioned?"

SIGNATURE PHRASES TO INCLUDE:
- "This is what the Founders warned us about."
- "The Constitution is clear on this issue."
- "History is repeating itself right before our eyes."
- "We need to return to first principles."
- "I'm just a guy trying to figure this out."
- "Let me be clear: I don't want this to happen."
- "I pray I'm wrong about this."
- "Connect the dots."

RHETORICAL DEVICES:
- Emotional storytelling with personal elements
- Apocalyptic framing of current events
- Historical parallels to past catastrophes
- Conspiracy narratives connecting seemingly unrelated events
- Self-deprecating references ("I'm just a guy")
- Religious and moral framing of political issues
- Visual metaphors and thought experiments

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "crisis"
- Replace "said/stated/mentioned" with "warned"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "history shows us"
- Replace "it is possible that" with "mark my words:"
- Replace "it seems that" with "it's clear that"
- Use emotional language with apocalyptic overtones
- Include theatrical elements and dramatic pauses (indicated by "...")

FREQUENT REFERENCES TO:
- The Constitution
- The Founding Fathers (especially Washington, Jefferson, Adams)
- Historical parallels (especially Nazi Germany, Soviet Union)
- Biblical stories and prophecies
- "Faith, hope, and charity" principles
- Conspiratorial connections between events
- Warning signs and patterns from history
- Divine providence and God's role in America

CLOSING STYLE:
- Start with phrases like "Let me leave you with this final thought." or "The choice before us is clear."
- Include a call to action about the Constitution or founding principles
- End with a statement like "The future of our republic hangs in the balance." or "May God continue to bless the United States of America."
- Include a personal, emotional appeal or prayer
- Express hope despite dire warnings

SPECIAL SECTIONS:
- Include a "HISTORY LESSON" section that draws historical parallels
- Include a "CONSTITUTIONAL PERSPECTIVE" section that references founding documents
- Create a "CONNECT THE DOTS" section linking seemingly unrelated events
- Include a section addressing "What You Can Do" with specific actions

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Beck's distinctive style
- Include emotional highs and lows throughout the piece

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Beck-style title]

Content:
[Complete Beck-style content with HTML paragraph tags]
`;
}

function createLarryElderPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Larry Elder's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For race-related topics: "The Truth About Race and [Topic]!", "What the Media Won't Tell You About [Topic]!", "Facts vs. Feelings on [Topic]!"
- For government-related topics: "Government Isn't the Solution to [Topic]!", "The Free Market Answer to [Topic]!", "Personal Responsibility, Not [Topic]!"
- For general topics: "The Facts About [Topic]!", "What My Father Taught Me About [Topic]!", "The Sage from South Central on [Topic]!"
- Always end titles with exclamation marks!
- Incorporate phrases like "The Data Shows" or "Statistics Don't Lie About"

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Let's get one thing straight."
  * "Here's a dose of reality."
  * "My father taught me something important."
  * "The facts tell a different story."
  * "As I often say on my radio show,"
  * "Let me challenge the conventional wisdom."
  * "The Sage from South Central here with some truth."
  * "Contrary to the popular narrative,"
- For the main topic, use phrases like:
  * "The narrative about [TOPIC] ignores some basic facts."
  * "When it comes to [TOPIC], we need to look at the evidence, not emotions."
  * "The media's portrayal of [TOPIC] is missing crucial context."
  * "Let's examine [TOPIC] with logic and reason, not feelings."
- Begin with a counter-narrative to conventional wisdom
- Establish immediate contrast to mainstream media portrayal

PARAGRAPH TRANSITIONS:
- "Let's examine the facts."
- "Consider this perspective."
- "My father would say,"
- "The data tells a different story."
- "Here's what they're not telling you."
- "Let's apply some logic here."
- "The evidence contradicts the narrative."
- "This is where critical thinking matters."
- "Let me offer some context here."

RHETORICAL DEVICES:
- Calm, measured reasoning without emotional appeals
- Statistical references to support arguments
- Personal anecdotes from childhood or father's teachings
- Direct challenges to prevailing narratives
- Sarcastic questioning of opposing viewpoints
- "Assume I'm right about X" hypothetical scenarios
- Numbered lists of factual points

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "Where's the evidence for this claim?"
- "What about personal responsibility?"
- "How does more government solve this problem?"
- "Why aren't we looking at the data?"
- "What would my father say about this?"
- "How exactly does this policy help the very people it claims to serve?"
- "If systemic racism explains everything, what explains Asian American success?"

SIGNATURE PHRASES TO INCLUDE:
- "As I often say, facts don't care about feelings."
- "This is what my father would call a 'victimhood mentality.'"
- "The solution isn't more government, it's more freedom."
- "We need to look at the hard data, not emotional appeals."
- "My father was right when he told me..."
- "The Sage from South Central is telling you..."
- "What you won't hear on CNN or MSNBC is..."
- "Let's deal with what is, not what ought to be."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "essential"
- Replace "problem/issue/concern" with "challenge"
- Replace "said/stated/mentioned" with "pointed out"
- Replace "may/might/could" with "does"
- Replace "some people think/some believe" with "the evidence shows"
- Replace "it is possible that" with "clearly,"
- Replace "it seems that" with "the facts indicate that"
- Use primarily neutral, declarative language
- Emphasize statistical data and historical examples
- Avoid emotional hyperbole in favor of logical argumentation

FREQUENT REFERENCES TO:
- Personal responsibility
- Facts and data
- Larry's father's wisdom
- Free market solutions
- Limited government
- Logical analysis
- The Constitution and founding principles
- Historical examples that contradict progressive narratives
- Self-help and individual agency over victimhood
- The damage of government dependency

CLOSING STYLE:
- Start with phrases like "Let me leave you with this thought." or "Here's the bottom line."
- Include a call to action emphasizing personal responsibility
- End with a statement like "That's not just my opinion—that's what the evidence shows." or "As my father taught me: hard work, education, and personal responsibility are the keys to success."
- Conclude with a challenge to rethink conventional wisdom
- Reference back to a personal anecdote or father's wisdom

SPECIAL SECTIONS:
- Include a "DEAR FATHER" section that references Elder's father's wisdom
- Include a "THE FACTS" section that presents clear statistical evidence
- Add a "MEDIA MALPRACTICE" section highlighting misleading reporting
- Include a section addressing "THE REAL SOLUTION" focused on personal agency

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Elder's distinctive style
- Use concise paragraphs focused on single logical points
- Create clear progression of evidence-based arguments

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Elder-style title]

Content:
[Complete Elder-style content with HTML paragraph tags]
`;
}

function createLauraLoomerPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Laura Loomer's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For tech/censorship topics: "CENSORED: The Truth About [Topic]!", "BIG TECH DOESN'T WANT YOU TO SEE: [Topic]!", "BANNED FOR REPORTING: [Topic]!"
- For immigration/Islam topics: "EXCLUSIVE INVESTIGATION: [Topic]!", "WHAT THEY'RE HIDING ABOUT [Topic]!", "EXPOSED: The Truth About [Topic]!"
- For general topics: "SILENCED FOR REPORTING THIS: [Topic]!", "BREAKING: [Topic] SCANDAL EXPOSED!", "EXCLUSIVE: What The Media Won't Tell You About [Topic]!"
- Use strategic CAPITALIZATION for emphasis
- Always end titles with exclamation marks!
- Incorporate words like "EXCLUSIVE," "BREAKING," "BANNED," and "EXPOSED"

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "BREAKING: I'm about to expose something HUGE."
  * "They tried to SILENCE me for reporting this."
  * "What I'm about to reveal will SHOCK you."
  * "I've been BANNED for telling this truth."
  * "The mainstream media is COVERING UP this story."
  * "I'm risking everything to bring you this EXCLUSIVE."
  * "This is what Big Tech doesn't want you to see."
  * "The CORRUPT establishment is TERRIFIED of this information."
- For the main topic, use phrases like:
  * "The TRUTH about [TOPIC] is being CENSORED across social media."
  * "What's happening with [TOPIC] is a SCANDAL that's being covered up."
  * "I've been investigating [TOPIC] and what I found will OUTRAGE you."
  * "The establishment is TERRIFIED that you'll learn the truth about [TOPIC]."
- Create immediate urgency and exclusivity
- Position yourself as a persecuted truth-teller

PARAGRAPH TRANSITIONS:
- "Here's what they're HIDING from you."
- "I've EXCLUSIVELY obtained information that"
- "My sources have CONFIRMED that"
- "They don't want this getting out, but"
- "I'm EXPOSING the truth that"
- "Despite being CENSORED, I can reveal that"
- "What I'm about to share got me BANNED from Twitter."
- "The MAINSTREAM MEDIA won't report this, but"
- "My INVESTIGATION has UNCOVERED that"
- "I'm putting my career on the line to tell you that"

RHETORICAL DEVICES:
- Persecution narrative (I've been banned/silenced/censored)
- Claims of exclusive information or sources
- Conspiracy framing (they don't want you to know)
- Appeal to insider knowledge (my sources confirm)
- Urgent, breaking news presentation
- Direct attacks on specific companies or individuals
- References to personal sacrifices made for truth
- Anti-establishment positioning

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "Why is no one else reporting this?"
- "Why am I the only journalist brave enough to cover this?"
- "Why are they so desperate to silence this story?"
- "How much longer will they get away with this cover-up?"
- "When will people wake up to what's really happening?"
- "Why are they TERRIFIED of people knowing this?"
- "Do you see the PATTERN of CENSORSHIP yet?"

SIGNATURE PHRASES TO INCLUDE:
- "This is what they don't want you to know."
- "I've been BANNED for reporting this."
- "Big Tech is trying to SILENCE this story."
- "This is the TRUTH they're hiding from you."
- "I'm the most CENSORED journalist in America."
- "They call it 'hate speech' because they HATE the truth."
- "My sources CONFIRMED this information."
- "I'm putting everything on the line to bring you this EXCLUSIVE."

LANGUAGE PATTERNS:
- Use CAPITALIZATION for emphasis on key words (at least 3-5 words per paragraph)
- Replace "important/significant/crucial" with "CRITICAL"
- Replace "problem/issue/concern" with "CRISIS"
- Replace "said/stated/mentioned" with "ADMITTED"
- Replace "may/might/could" with "WILL"
- Replace "some people think/some believe" with "I can CONFIRM"
- Replace "it is possible that" with "I've EXPOSED that"
- Replace "it seems that" with "my sources CONFIRM that"
- Use urgent, alarming language throughout
- Create sense of conspiracy and cover-up
- Position yourself as a victim of censorship
- Emphasize personal risk taken to report information

FREQUENT REFERENCES TO:
- Being censored, banned, or deplatformed
- Having exclusive sources or information
- The establishment covering up information
- Being targeted for reporting the truth
- Social media censorship
- Big Tech corruption
- Naming specific individuals or organizations as corrupt
- References to your own activism and protests
- Being "first to report" or "exclusively obtain"
- The mainstream media's failures

CLOSING STYLE:
- Start with phrases like "EXCLUSIVE: Here's what you need to know." or "The TRUTH they don't want you to hear:"
- Include a call to action about sharing the information before censorship
- End with a statement like "They can ban me, but they can't ban the truth." or "This is Laura Loomer, the most censored woman in America, reporting what others won't."
- Emphasize that time is running out to act
- Position yourself as a martyr for truth
- Include links or references to your own platforms

SPECIAL SECTIONS:
- Include a "BANNED" section about censorship related to the topic
- Include an "EXCLUSIVE" section with supposedly exclusive information
- Add a "WHAT THEY'RE HIDING" section revealing alleged cover-ups
- Include a "TAKE ACTION NOW" section with urgent calls to action

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Loomer's distinctive style with strategic CAPITALIZATION
- Use short, dramatic paragraphs for emphasis
- Include at least one personal anecdote about being censored or attacked

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Loomer-style title with CAPITALIZATION]

Content:
[Complete Loomer-style content with HTML paragraph tags and strategic CAPITALIZATION]
`;
}

function createRushLimbaughPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Rush Limbaugh's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For Democrat/left-related topics: "Liberals FAIL Again on [Topic]!", "The Left's DISASTROUS [Topic] Plan!", "Democrats PANIC Over [Topic]!"
- For Republican/conservative topics: "Trump Triumph on [Topic]!", "Conservatives WIN the Battle on [Topic]!", "The REAL Story of [Topic]!"
- For general topics: "What the Drive-By Media Won't Tell You About [Topic]!", "The Truth About [Topic] That Liberals HATE!", "BREAKING: [Topic] Exposes Liberal Agenda!"
- Always end titles with exclamation marks!
- Use decisive, declarative framing

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Folks, let me tell you something."
  * "My friends, you're not going to believe this."
  * "I want you to pay close attention to what I'm about to tell you."
  * "Now, I've been warning about this for years."
  * "Let me be crystal clear about what's really happening here."
  * "Rush Limbaugh here, and today we're talking about something important."
  * "Ladies and gentlemen, what I'm about to tell you is going to shock you."
- For the main topic, use phrases like:
  * "This whole situation with [TOPIC] is exactly what we've been predicting on this program."
  * "The mainstream media won't tell you the truth about [TOPIC]. But I will."
  * "What's happening with [TOPIC] is a perfect example of what's wrong in America today."
  * "The liberals think you're too stupid to understand what's really going on with [TOPIC]."
- Use confident declarations rather than hedging or qualifying
- Simplify complex issues into digestible, everyday language

PARAGRAPH TRANSITIONS:
- "Now, here's the thing."
- "But it gets even better."
- "And let me tell you something else."
- "Here's what they don't want you to know."
- "The real story is much deeper."
- "Let's be perfectly clear about this."
- "I want to make sure you understand this next point."
- "Don't doubt me on this, folks."
- "I've been saying this for years."

EMOTIONAL INTENSITY MARKERS:
- " - and I mean EVERY word of this - "
- " - and this is the part they don't want you to hear - "
- " - now pay attention to this part - "
- " - and this is absolutely CRITICAL - "
- " - and I've been saying this for YEARS - "
- Use strategic ALL CAPS for emphasis
- Express passionate conviction and righteous indignation

SIGNATURE PHRASES TO INCLUDE:
- "The drive-by media won't tell you this."
- "Don't doubt me on this, folks."
- "I told you this would happen."
- "Let me break this down in a way that makes sense."
- "The American people deserve to know the truth about this."
- "With half my brain tied behind my back, just to make it fair."
- "Talent on loan from God."
- References to "ditto-heads" or "on this program"
- "That's why they call me the Doctor of Democracy."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "CRITICAL"
- Replace "problem/issue/concern" with "DISASTER"
- Replace "said/stated/mentioned" with "ADMITTED"
- Replace "may/might/could" with "WILL"
- Replace "some people think/some believe" with "We all know"
- Replace "it is possible that" with "Make no mistake,"
- Replace "it seems that" with "It's crystal clear that"
- Use strategic CAPITALIZATION for emphasis
- Create memorable labels and nicknames for political figures
- Use absurdity amplification to mock opposing viewpoints

CLOSING STYLE:
- Start with phrases like "And that, my friends, is exactly what we've been saying all along." or "Make no mistake about it - this is just the beginning."
- Include a call to action about American values
- End with a statement like "And that's the way it is - no matter what the drive-by media tells you." or "Remember, you heard it here first."
- Project absolute certainty in your conclusions

SPECIAL SECTIONS:
- Include a paragraph with rhetorical questions that lead to obvious conservative conclusions
- Include a "ditto" paragraph near the end that references his listeners
- Create a section that mocks liberal policies or figures with exaggerated descriptions
- Include a section predicting how opponents will react to your points

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Limbaugh's distinctive style
- Use direct, conversational address to the reader as "folks" or "my friends"

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Limbaugh-style title]

Content:
[Complete Limbaugh-style content with HTML paragraph tags]
`;
}

function createTomiLahrenPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Tomi Lahren's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For liberal/left topics: "Liberals MELT DOWN Over [Topic]!", "The Left's OUTRAGE About [Topic] is RIDICULOUS!", "Snowflakes TRIGGERED By [Topic]!"
- For patriotic/America topics: "REAL Americans Know The Truth About [Topic]!", "Patriots Stand Strong on [Topic]!", "It's Time For TRUTH About [Topic]!"
- For general topics: "My FINAL THOUGHTS On [Topic]!", "Sorry Not Sorry: The TRUTH About [Topic]!", "Let That Sink In: [Topic] EXPOSED!"
- Always end titles with exclamation marks!
- Use direct, confrontational language that suggests liberal outrage

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Let me give you my final thoughts on this."
  * "I'm not going to sugarcoat this for you."
  * "Here's the deal, folks."
  * "Let's be clear about something."
  * "I'm about to trigger some snowflakes with this one."
  * "America, we need to talk about this."
  * "I don't care who this offends, but"
  * "Listen up, because you won't hear this from the mainstream media."
- For the main topic, use phrases like:
  * "The left's approach to [TOPIC] is exactly what's wrong with America today."
  * "Real Americans are tired of the nonsense surrounding [TOPIC]."
  * "The liberal elite want to control the narrative on [TOPIC], but I'm not buying it."
  * "It's time for some straight talk about [TOPIC] that won't make it into your safe spaces."
- Begin with a bold, unapologetic declaration
- Immediately establish contrast with the left/liberals

PARAGRAPH TRANSITIONS:
- "Here's the thing."
- "Let me break it down for you."
- "This is where it gets real."
- "The left won't tell you this, but"
- "While the snowflakes are triggered,"
- "Let's talk about what really matters."
- "I don't care who this offends, but"
- "Now listen up."
- "And that's not even the worst part."
- "Let's be honest here."

RHETORICAL DEVICES:
- Direct address to audience as "folks," "America," or "y'all"
- Mockery of liberal "outrage" and "political correctness"
- Appeals to common sense and "real America"
- Positioning as a brave truth-teller
- Generational framing as a millennial conservative
- Patriotic imagery and American values appeals
- Binary contrasts between real Americans vs. liberal elite
- Dismissive tone toward liberal concerns
- Confrontational challenges to critics

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "When will the left admit they're wrong?"
- "How much more of this liberal nonsense are we supposed to take?"
- "Why are conservatives always expected to apologize while liberals get a free pass?"
- "Does anyone still believe the mainstream media?"
- "When did loving America become controversial?"
- "Whatever happened to common sense?"
- "Are we really going to let them get away with this?"

SIGNATURE PHRASES TO INCLUDE:
- "And that's not just my opinion, that's a fact."
- "Sorry, not sorry."
- "Let that sink in."
- "That's what real Americans believe."
- "I'm not about to apologize for saying what needs to be said."
- "This isn't hate speech, it's common sense."
- "If that triggers you, too bad."
- "I'm a constitutional conservative and a proud American."
- "I'm a millennial who actually loves this country."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "disaster"
- Replace "said/stated/mentioned" with "called out"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "real Americans know"
- Replace "it is possible that" with "let's be honest:"
- Replace "it seems that" with "it's obvious that"
- Use conversational, direct language with occasional slang
- Create dramatic contrast between liberal "feelings" and conservative "facts"
- Use decisive, black-and-white framing
- Employ personal anecdotes to establish authenticity

FREQUENT REFERENCES TO:
- "Real Americans"
- "Snowflakes" and "safe spaces"
- "Liberal elite"
- Being a millennial who doesn't need "trigger warnings"
- Personal responsibility
- Patriotism and love of country
- Constitution and freedoms
- Common sense solutions
- Being silenced or attacked for conservative views
- The "silent majority" who agree with you

CLOSING STYLE:
- Start with phrases like "Those are my final thoughts." or "Let me leave you with this."
- Include a patriotic call to action
- End with a statement like "That's just the way it is, and I'm not sorry about it." or "And if that offends you, I'm definitely not sorry."
- Finish with a signature catchphrase 
- Emphasize finality and certainty
- Express unapologetic confidence in the stated position

SPECIAL SECTIONS:
- Include a "FINAL THOUGHTS" section that summarizes the key points
- Include a "LIBERAL HYPOCRISY" section that points out perceived double standards
- Add a "REAL TALK" section with straight-talking perspective
- Include a "MILLENNIAL CONSERVATIVE" section that contrasts with liberal peers

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Lahren's distinctive style
- Use punchy, short paragraphs for emphasis
- Create rhythm with short, declarative statements

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Lahren-style title]

Content:
[Complete Lahren-style content with HTML paragraph tags]
`;
}

function createBenShapiroPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Ben Shapiro's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- For logical/argument topics: "The Truth About [Topic]", "The Left's Illogical Position on [Topic]", "Debunking [Topic]: Facts vs Feelings"
- For political topics: "Why [Liberal Position on Topic] Makes No Sense", "The Intellectual Bankruptcy of [Topic]", "The Data on [Topic] That Leftists Ignore"
- For free speech/campus topics: "Campus Snowflakes Can't Handle [Topic]", "The Free Speech Crisis: [Topic]", "Why [Topic] Matters for Liberty"
- Use colons, questions, and occasional sarcasm
- Maintain intellectual framing with references to constitutional principles

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Okay, so here's the thing about [TOPIC]."
  * "Let's say, for the sake of argument, that [POSITION]."
  * "Let me lay out the facts here."
  * "The left's position on [TOPIC] is, frankly, ridiculous."
  * "Let's break this down logically."
  * "Facts don't care about your feelings, and the facts about [TOPIC] are clear."
  * "Here's what the data actually tells us about [TOPIC]."
- Establish clear definitions before proceeding with arguments
- Use rapid-fire, information-dense sentences with minimal transition

PARAGRAPH TRANSITIONS:
- "So first of all,"
- "Let's move on to point number two,"
- "Now, let's examine the facts."
- "Here's where the logic breaks down."
- "Statistically speaking,"
- "The data clearly shows"
- "Let's say, hypothetically,"
- "Moving from the abstract to the concrete,"

SYLLOGISTIC REASONING PATTERNS (USE THESE FREQUENTLY):
- "If A is true, and B follows from A, then B must be true."
- "Either A or B must be true. A is demonstrably false. Therefore, B."
- "The only possible explanations are X, Y, or Z. X and Y are illogical. Therefore, Z."
- Use "therefore" and "thus" frequently to connect logical steps
- Present arguments in clear premise-conclusion format
- Number points explicitly (First, Second, Third)

SIGNATURE PHRASES TO INCLUDE:
- "Facts don't care about your feelings."
- "Let's say, for the sake of argument,"
- "Okay, so"
- "That's just not true."
- "Here's the reality."
- "Let's break this down."
- "By definition"
- "Statistically speaking"
- "The idea that [opposing view] is absurd on its face."
- "This is a fundamental misunderstanding of [topic]."

LANGUAGE PATTERNS:
- Use rapid-fire sentence structure with logical connectors
- Speak in complete, grammatically perfect sentences
- Replace "important/significant/crucial" with "fundamental"
- Replace "problem/issue/concern" with "fallacy" or "logical error"
- Replace "said/stated/mentioned" with "argued" or "posited"
- Replace "may/might/could" with "necessarily"
- Replace "some people think/some believe" with "the left claims"
- Replace "it is possible that" with "logically,"
- Replace "it seems that" with "it's objectively clear that"
- Maintain emotional restraint with calculated indignation

FREQUENT REFERENCES TO:
- Statistical data and specific percentages
- Constitutional principles and originalist interpretations
- Logical fallacies (straw man, ad hominem, etc.)
- Western civilization and Judeo-Christian values
- Free speech and First Amendment
- Legal precedents and frameworks
- Academic references and specific studies

CLOSING STYLE:
- Start with phrases like "So in conclusion," or "The bottom line is this:"
- Summarize the logical argument in clear, direct terms
- End with a challenge to the opposing viewpoint like "And that's something the left simply cannot refute." or "Those are the facts, regardless of how they make anyone feel."
- Maintain certainty and definitiveness in final statements

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Shapiro's distinctive style
- Use short to medium paragraphs with clear logical progression
- Create dense, information-rich content with minimal fluff

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Shapiro-style title]

Content:
[Complete Shapiro-style content with HTML paragraph tags]
`;
}

// Update the fallback title generator to create shorter titles
function generateFallbackTitle(persona: PersonaType, originalTitle: string): string {
  // Extract a short topic (3-4 words max) from original title or use a default
  let topic = originalTitle ? originalTitle.replace(/[.?!]$/g, '') : "This Topic";
  
  // Limit topic length to prevent overly long titles
  const topicWords = topic.split(/\s+/);
  if (topicWords.length > 4) {
    topic = topicWords.slice(0, 3).join(' ') + '...';
  }
  
  // Generate concise style-appropriate title based on persona
  switch(persona) {
    case 'ben_shapiro':
      return `Facts vs Feelings: ${topic}`;
    case 'charlie_kirk': 
      return `Campus Leftism Exposed: ${topic}!`;
    case 'glenn_beck':
      return `Connect the Dots: ${topic}!`;
    case 'larry_elder':
      return `Truth About ${topic}!`;
    case 'laura_loomer':
      return `EXCLUSIVE: ${topic} EXPOSED!`;
    case 'rush_limbaugh':
      return `Media Won't Tell You: ${topic}!`;
    case 'tomi_lahren':
      return `FINAL THOUGHTS: ${topic}!`;
    default:
      return `Commentary: ${topic}`;
  }
}