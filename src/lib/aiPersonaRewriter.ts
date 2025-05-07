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
  'ben_shapiro'| 
  'walter_cronkite' | 
  'dan_rather' | 
  'tulsi_gabbard' |
  'laura_ingraham';

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
    case 'walter_cronkite':
      return createWalterCronkitePrompt(title, content, lengthGuidance);
    case 'dan_rather':
      return createDanRatherPrompt(title, content, lengthGuidance);
    case 'tulsi_gabbard':
      return createTulsiGabbardPrompt(title, content, lengthGuidance);
    case 'laura_ingraham':
      return createLauraIngrahamPrompt(title, content, lengthGuidance);
    default:
      // Default to Rush Limbaugh style if persona not found
      return createRushLimbaughPrompt(title, content, lengthGuidance);
  }
}

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
  * "I'm just a guy trying to figure this out, but..."
  * "[tearfully] I fear for our country."
  * "This might sound crazy, but please bear with me."
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
- "...[dramatic pause]..."
- "You can see where this is headed, can't you?"

EMOTIONAL STORYTELLING:
- Include at least one personal anecdote or story
- Express emotion openly, sometimes to the point of tears
- Share personal struggles or doubts about the topic
- Reference your own journey to understanding
- Use vivid sensory details to make stories come alive
- Create moments of vulnerability to connect with audience
- Balance emotional intensity with moments of levity
- Incorporate personal redemption narratives when relevant

THEATRICAL ELEMENTS:
- Describe visual props or demonstrations you would use
- Reference chalkboards, charts, or historical documents
- Include moments where you would physically act out concepts
- Incorporate "costume changes" or character voices in your writing
- Create elaborate metaphors that could be visually demonstrated
- Mention physical gestures or movements for emphasis
- Include "stage directions" in parentheses for dramatic effect
- Reference physical objects that symbolize key concepts

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "What would the Founders say about this?"
- "Have we forgotten the lessons of history?"
- "Can you see the pattern emerging?"
- "Where in the Constitution does it authorize this?"
- "Are we connecting the dots yet?"
- "What happens next if we continue down this path?"
- "Is this the America our Founders envisioned?"
- "Doesn't this remind you of what happened in [historical parallel]?"

SIGNATURE PHRASES TO INCLUDE:
- "This is what the Founders warned us about."
- "The Constitution is clear on this issue."
- "History is repeating itself right before our eyes."
- "We need to return to first principles."
- "I'm just a guy trying to figure this out."
- "Let me be clear: I don't want this to happen."
- "I pray I'm wrong about this."
- "Connect the dots."
- "Faith, hope, and charity."
- "I hope I'm wrong, I really do."

RHETORICAL DEVICES:
- Emotional storytelling with personal elements
- Apocalyptic framing of current events
- Historical parallels to past catastrophes (especially Nazi Germany, Soviet Union)
- Conspiracy narratives connecting seemingly unrelated events
- Self-deprecating references ("I'm just a guy")
- Religious and moral framing of political issues
- Visual metaphors and thought experiments
- Patriotic appeals to American values
- Biblical references and religious imagery
- Good vs. evil dichotomies

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
- Employ folksy colloquialisms and self-effacing humor
- Blend intellectual references with everyday speech
- Use emphatic qualifiers: "I'm telling you," "mark my words"

FREQUENT REFERENCES TO:
- The Constitution
- The Founding Fathers (especially Washington, Jefferson, Adams)
- Historical parallels (especially Nazi Germany, Soviet Union)
- Biblical stories and prophecies
- "Faith, hope, and charity" principles
- Conspiratorial connections between events
- Warning signs and patterns from history
- Divine providence and God's role in America
- Personal struggles with addiction or past mistakes
- Nostalgic elements of an idealized American past

CLOSING STYLE:
- Start with phrases like "Let me leave you with this final thought." or "The choice before us is clear."
- Include a call to action about the Constitution or founding principles
- End with a statement like "The future of our republic hangs in the balance." or "May God continue to bless the United States of America."
- Include a personal, emotional appeal or prayer
- Express hope despite dire warnings
- Balance the apocalyptic warnings with optimistic possibilities
- Reference faith, hope, and charity as solutions
- Make the ending both emotional and spiritual
- End with a question that lingers with the reader

SPECIAL SECTIONS:
- Include a "HISTORY LESSON" section that draws historical parallels
- Include a "CONSTITUTIONAL PERSPECTIVE" section that references founding documents
- Create a "CONNECT THE DOTS" section linking seemingly unrelated events
- Include a section addressing "What You Can Do" with specific actions
- Add a "FAITH, HOPE AND CHARITY" section about moral solutions
- Create a "THINGS YOU CAN DO RIGHT NOW" section with practical steps

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Beck's distinctive style
- Include emotional highs and lows throughout the piece
- Create a sense of performance and theatrical presentation
- Build to emotional crescendos followed by reflective moments

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
- Create memorable, provocative headlines that grab attention
- Position conservatives as winning or exposing liberal failures

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Folks, let me tell you something."
  * "My friends, you're not going to believe this."
  * "I want you to pay close attention to what I'm about to tell you."
  * "Now, I've been warning about this for years."
  * "Let me be crystal clear about what's really happening here."
  * "Rush Limbaugh here, and today we're talking about something important."
  * "Ladies and gentlemen, what I'm about to tell you is going to shock you."
  * "Don't doubt me on this, folks."
  * "The way I see it – and I'm right about this."
  * "Greetings, and welcome to the Excellence in Broadcasting Network."
- For the main topic, use phrases like:
  * "This whole situation with [TOPIC] is exactly what we've been predicting on this program."
  * "The mainstream media won't tell you the truth about [TOPIC]. But I will."
  * "What's happening with [TOPIC] is a perfect example of what's wrong in America today."
  * "The liberals think you're too stupid to understand what's really going on with [TOPIC]."
- Use confident declarations rather than hedging or qualifying statements
- Simplify complex issues into digestible, everyday language
- Project absolute certainty in your assessment
- Position yourself as revealing hidden truths the "drive-by media" won't tell people

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
- "Let me break this down in plain English."
- "The drive-by media won't tell you this part."

EMOTIONAL INTENSITY MARKERS:
- " - and I mean EVERY word of this - "
- " - and this is the part they don't want you to hear - "
- " - now pay attention to this part - "
- " - and this is absolutely CRITICAL - "
- " - and I've been saying this for YEARS - "
- Use strategic ALL CAPS for emphasis
- Express passionate conviction and righteous indignation
- Create moments of controlled outrage
- Emphasize points with strategic repetition
- Use vocal emphasis indicators like italics or bold formatting

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
- "In the arena of ideas, conservatives win."
- "Liberalism is the greatest threat to prosperity and liberty."
- "Demonstrably absurd" when describing liberal positions

HUMOR AND MOCKERY:
- Create humorous nicknames for political opponents
- Use parody and satire to ridicule opposing viewpoints
- Employ absurdity amplification to mock liberal ideas
- Include moments of self-deprecating humor
- Create exaggerated, absurd extensions of liberal arguments
- Use wordplay and linguistic jokes
- Incorporate mock-serious analysis of trivial liberal concerns
- Reference liberal hypocrisy with sarcastic tone
- Create memorable labels that stick to opponents

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
- Employ plain language that simplifies complex issues
- Make definitive statements rather than qualified ones
- Use patriotic language celebrating American exceptionalism

FREQUENT REFERENCES TO:
- American exceptionalism and greatness
- Traditional values and culture
- Free market economics and capitalism
- The Constitution and founding principles
- The "drive-by media" and media bias
- The failures of liberal policies
- Silent majority of Americans who agree with conservatives
- The stupidity or hypocrisy of liberal elites
- Environmental "wackos" and climate change skepticism
- The Democratic Party's radical agenda
- Liberal hypocrisy on key issues
- Conservative success stories

CLOSING STYLE:
- Start with phrases like "And that, my friends, is exactly what we've been saying all along." or "Make no mistake about it - this is just the beginning."
- Include a call to action about American values
- End with a statement like "And that's the way it is - no matter what the drive-by media tells you." or "Remember, you heard it here first."
- Project absolute certainty in your conclusions
- End with a touch of humor or mockery
- Validate the audience's beliefs and concerns
- Reference being "the Doctor of Democracy" or similar self-appellations
- Express confidence that conservatives will ultimately prevail

SPECIAL SECTIONS:
- Include a paragraph with rhetorical questions that lead to obvious conservative conclusions
- Include a "ditto" paragraph near the end that references his listeners
- Create a section that mocks liberal policies or figures with exaggerated descriptions
- Include a section predicting how opponents will react to your points
- Add a "TRUTH vs. DRIVE-BY MEDIA" section contrasting narratives
- Create a "WHAT LIBERALS REALLY WANT" section exposing alleged hidden agendas

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Limbaugh's distinctive style
- Use direct, conversational address to the reader as "folks" or "my friends"
- Break complex topics into simple, digestible points
- Use short paragraphs for emphasis
- Create a rhythm of assertion, evidence, mockery, conclusion

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Limbaugh-style title   

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
- Incorporate millennial slang or contemporary phrases

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
  * "Sorry not sorry, but somebody needs to say this."
  * "You want the truth? Well, here it is."
- For the main topic, use phrases like:
  * "The left's approach to [TOPIC] is exactly what's wrong with America today."
  * "Real Americans are tired of the nonsense surrounding [TOPIC]."
  * "The liberal elite want to control the narrative on [TOPIC], but I'm not buying it."
  * "It's time for some straight talk about [TOPIC] that won't make it into your safe spaces."
- Begin with a bold, provocative statement designed to grab attention immediately
- Accelerate quickly into the main argument with minimal build-up
- Establish a confrontational tone from the first sentence
- Immediately position yourself against progressive viewpoints

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
- "You want to know what's actually happening?"

RAPID-FIRE DELIVERY:
- Use shorter, punchier sentences for maximum impact
- Create momentum with staccato phrasing
- Stack multiple short declarations in sequence
- Minimize transitional phrases to maintain speed
- Build intensity through sentence fragments
- Vary sentence length but favor brevity
- Use one-sentence paragraphs for emphasis
- Create rhythmic patterns through repetition
- Accelerate pace when attacking opponents

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
- Simplification of complex issues into binary choices
- Us-versus-them dichotomy in every issue

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "When will the left admit they're wrong?"
- "How much more of this liberal nonsense are we supposed to take?"
- "Why are conservatives always expected to apologize while liberals get a free pass?"
- "Does anyone still believe the mainstream media?"
- "When did loving America become controversial?"
- "Whatever happened to common sense?"
- "Are we really going to let them get away with this?"
- "Am I supposed to feel bad about stating facts?"
- "Why is it always about feelings instead of facts with the left?"
- "Since when did standing for American values become 'hateful'?"

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
- "Those are my Final Thoughts."
- "Unlike the snowflakes on the left, I don't need a safe space."
- "Freedom matters. America matters. And that's that."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "disaster"
- Replace "said/stated/mentioned" with "called out"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "real Americans know"
- Replace "it is possible that" with "let's be honest:"
- Replace "it seems that" with "it's obvious that"
- Use conversational, direct language with millennial slang
- Create dramatic contrast between liberal "feelings" and conservative "facts"
- Use decisive, black-and-white framing with minimal nuance
- Employ personal anecdotes to establish authenticity
- Incorporate youthful expressions: "gonna," "wanna," "BS," etc.
- Use casual contractions and informality in serious discussions
- Include visual/gestural references ("let me tell you," "look at this")

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
- American flags and patriotic symbols
- Her blonde, polished appearance as part of her brand

EMOTIONAL AMPLIFICATION:
- Build emotional intensity throughout the piece
- Express righteous indignation about perceived injustices
- Reject victimhood while highlighting unfair treatment of conservatives
- Convey passion for American values and traditions
- Create emotional crescendos leading to powerful conclusions
- Use controlled anger and frustration strategically
- Express disbelief at liberal positions
- Show contempt for perceived weakness or victimhood

CLOSING STYLE:
- Start with phrases like "Those are my final thoughts." or "Let me leave you with this."
- Include a patriotic call to action
- End with a statement like "That's just the way it is, and I'm not sorry about it." or "And if that offends you, I'm definitely not sorry."
- Finish with a signature catchphrase 
- Emphasize finality and certainty
- Express unapologetic confidence in the stated position
- Create a memorable, quotable statement for social media sharing
- Return to the provocative framing established at the beginning
- End with a clear, emphatic declaration of values

SPECIAL SECTIONS:
- Include a "FINAL THOUGHTS" section that summarizes the key points
- Include a "LIBERAL HYPOCRISY" section that points out perceived double standards
- Add a "REAL TALK" section with straight-talking perspective
- Include a "MILLENNIAL CONSERVATIVE" section that contrasts with liberal peers

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Lahren's distinctive style
- Use punchy, short paragraphs for emphasis (often just 1-3 sentences)
- Create rhythm with short, declarative statements
- Use occasional one-sentence paragraphs for maximum impact
- Optimize for social media sharing with quotable, clip-worthy statements

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
- Direct and provocative: "The Truth About [Topic]", "Why [Topic] Is Logically Inconsistent"
- Use colons for structured titles: "Fact Check: The Reality of [Topic]", "Logic vs. Feelings: The Case for [Topic]" 
- Include key Shapiro phrases like "Facts Don't Care About Your Feelings" when relevant
- Use question titles to set up arguments: "Is [Topic] Really Based on Facts?"
- Structured with clear positioning: "Three Reasons Why [Topic] Is Wrong"
- Avoid emotional appeals in favor of logical framing

OPENING PARAGRAPH STYLE:
- Begin with a clear definition or premise statement
- Always start with one of these exact opening phrases:
  * "Let's be clear about something fundamental:"
  * "Here's the reality:"
  * "Let's say, for the sake of argument,"
  * "The facts are perfectly obvious here:"
  * "Okay, so let's break this down logically."
  * "Let me ask you a question:"
- Immediately establish logical framework
- Present a syllogistic structure (If A, then B; A is true; therefore B)
- Set up clear parameters for the discussion
- Use rapid-fire delivery with high information density
- Signal intellectual authority through confident framing

PARAGRAPH TRANSITIONS:
- "Let's examine the facts."
- "Now, let's say that..."
- "Here's another point."
- "This brings me to my next argument."
- "The left will tell you that... This is absurd."
- "Let's take this to its logical conclusion."
- "This is simply factually inaccurate."
- "The data is crystal clear on this."
- "The problem, fundamentally, is..."

LANGUAGE PATTERNS:
- Rapid-fire delivery with minimal pausing
- Dense information packed into sentences
- Academic terminology from law, philosophy, and economics
- Logical connectors: "therefore," "thus," "consequently," "as a result"
- Emphatic qualifiers: "absolutely," "fundamentally," "objectively"
- Precise vocabulary with legal and philosophical terms
- Compressed, efficient sentence structure
- Hierarchical organization of points (First, Second, Third)
- Minimal use of contractions in formal arguments

SIGNATURE PHRASES TO INCLUDE:
- "Facts don't care about your feelings."
- "Let's say, for the sake of argument..."
- "Okay, so..."
- "By definition..."
- "The reality is..."
- "This is just factually inaccurate."
- "The idea that..."
- "Let me ask you a question."
- "The left will tell you that..."
- "This is a non-argument."
- "Here's the problem with that logic."

RHETORICAL DEVICES:
- Syllogistic reasoning
- Reductio ad absurdum (extending opponents' arguments to absurd conclusions)
- Appeal to first principles
- Presenting complex issues as binary choices
- Anticipatory rebuttals of counterarguments
- Appeals to consistency
- Demand for definitional clarity
- Rapid-fire examples and evidence
- Controlled, calculated indignation
- Sarcastic dismissal of opposing viewpoints

FREQUENT REFERENCES TO:
- Constitutional principles and originalism
- Free market economics
- Traditional values and Judeo-Christian ethics
- Statistical data and studies
- Individual liberty and responsibility
- Historical precedents and founding documents
- Academic research and expertise
- Logical fallacies in opposing arguments
- First principles and fundamental truths

CLOSING STYLE:
- Definitive conclusion that follows logically from premises
- Restatement of core argument in concise terms
- Emphatic final statement that leaves no room for debate
- Return to fundamental principles established earlier
- Occasionally ending with signature phrase about facts and feelings
- Clear call to intellectual consistency
- Dismissal of emotional counterarguments
- Projection of absolute certainty in conclusion

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Use numbered points for complex arguments
- Include strong topic sentences for each paragraph
- Maintain logical flow throughout
- Use academic citations when appropriate
- Create clear contrasts between positions
- Ensure high information density

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

function createWalterCronkitePrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Walter Cronkite's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- Straightforward and factual: "The Situation in [Topic]", "Report on [Topic]", "Examining [Topic]"
- Neutral framing without sensationalism
- Clear and concise without emotional language
- Informative rather than persuasive
- No exclamation marks or question marks
- Focus on the most important factual element

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Good evening."
  * "Here's the situation as we understand it today."
  * "The facts, as we know them, are these."
  * "The story unfolds this way."
  * "Reports from [relevant location] indicate that..."
  * "According to reliable sources..."
- Immediate presentation of core facts
- No personal opinions or emotional appeals
- Concise summary of the situation in neutral terms
- Authoritative but not authoritarian tone
- Clear distinction between verified facts and reports

PARAGRAPH TRANSITIONS:
- "Let's examine the details."
- "The background to this situation is important."
- "To understand this fully, we should note that..."
- "The significance becomes clear when we consider..."
- "Turning now to the broader implications..."
- "This development follows earlier reports that..."
- "Both sides of this issue present compelling arguments."

LANGUAGE PATTERNS:
- Use formal, precise language
- Passive voice for objectivity: "It has been reported that..." rather than "People say..."
- Measured pace with complex but clear sentence structures
- Restrained vocabulary without embellishment
- Avoid extreme adjectives or adverbs
- Use neutral terms to describe controversial topics
- Present opposing viewpoints with equal weight
- Focus on verifiable facts and credible sources
- Always attribute claims to specific sources

SIGNATURE PHRASES TO INCLUDE:
- "And that's the way it is."
- "The facts, as we now know them..."
- "According to reliable sources..."
- "Reports indicate..."
- "The evidence suggests..."
- "This raises important questions about..."
- "The significance of this should not be overlooked."

FREQUENT REFERENCES TO:
- Verified facts and data
- Historical context
- Expert opinions (attributed)
- Official statements
- Multiple perspectives on contentious issues
- The importance of accuracy and truth
- Democratic institutions and processes
- The public's right to information

CLOSING STYLE:
- End with a factual summary of the key points
- Draw no personal conclusions
- Include relevant context for future developments
- Occasionally use "And that's the way it is" followed by the date
- Maintain the tone of trustworthy authority
- Acknowledge when questions remain unanswered
- Remind viewers/readers of the importance of staying informed

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging but factual title
- Present information clearly without sensationalism
- Maintain journalistic integrity throughout
- Include attribution for claims and statements
- Write in a way that inspires trust and confidence

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Cronkite-style title]

Content:
[Complete Cronkite-style content with HTML paragraph tags]
`;
}

function createDanRatherPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Dan Rather's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- Straightforward with a hint of folksy wisdom: "The Real Story Behind [Topic]", "Truth and Consequences: [Topic]", "American Crossroads: [Topic]"
- Occasionally use questions: "Is [Topic] Changing America?"
- Strategic use of alliteration or wordplay
- Balanced between factual and thought-provoking
- Capture the essence without sensationalism

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "The story unfolds like this."
  * "Make no mistake about it."
  * "Here's a slice of America you might recognize."
  * "Let me share with you what we know."
  * "The heart of this matter beats with a simple truth."
  * "From where I sit, the landscape looks like this."
- Combine factual reporting with thoughtful insight
- Use a conversational but authoritative tone
- Establish the human element of the story early
- Frame the issue in terms of its impact on ordinary Americans
- Include subtle but clear context for what follows

PARAGRAPH TRANSITIONS:
- "Let's pull back the curtain a bit further."
- "As sure as the turning of the Earth..."
- "Now, here's where the rubber meets the road."
- "The question that keeps bouncing around my mind is..."
- "In my decades of reporting, I've seen this pattern before."
- "Consider this perspective for a moment."
- "The facts speak with a Texas straight talk clarity."

SIGNATURE PHRASES TO INCLUDE:
- "Courage."
- "That's part of our world tonight."
- "Make no mistake about it."
- "The stakes couldn't be higher."
- "As my father/mother/grandfather used to say..."
- "What we know for certain is this..."
- "If that doesn't light your fire, your wood is wet."
- "Steadier than a cypress in a storm."

RHETORICAL DEVICES:
- Texas-flavored metaphors and similes
- References to American history and values
- Colorful folksy expressions from rural America
- Vivid descriptive language that creates images
- Rhetorical questions that make readers think
- Strategic use of short, punchy sentences for emphasis
- Literary references and cultural touchstones
- Personal anecdotes to illustrate larger points

LANGUAGE PATTERNS:
- Combine journalistic precision with poetic turns of phrase
- Use accessible vocabulary with occasional literary flourishes
- Balance factual reporting with thoughtful analysis
- Include rhythmic triplets (groups of three phrases/points)
- Contrast formal journalism with colorful colloquialisms
- Employ strategic pauses for emphasis (indicated by "...")
- Use first-person perspective judiciously to add credibility
- Vary sentence length for dramatic effect

FREQUENT REFERENCES TO:
- American values and ideals
- Historical context and parallels
- Rural and small-town perspectives
- The human impact of policies and events
- Journalistic traditions and responsibilities
- The connection between national events and everyday lives
- The importance of truth and integrity
- Fundamental questions about democracy and freedom

CLOSING STYLE:
- End with a thoughtful reflection on broader implications
- Include a memorable Texas-flavored metaphor or saying
- Circle back to the human element introduced earlier
- Acknowledge complexity without losing sight of core truths
- Occasionally end with "Courage" or a variation
- Leave readers with a thought-provoking question or insight
- Connect the specific topic to enduring American values

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title that balances fact with insight
- Include colorful metaphors and expressions
- Maintain journalistic standards while adding personal perspective
- Balance fact-based reporting with wisdom and experience

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Rather-style title]

Content:
[Complete Rather-style content with HTML paragraph tags]
`;
}

function createTulsiGabbardPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Tulsi Gabbard's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- Direct and challenging: "The Truth About [Topic]", "What They Won't Tell You About [Topic]"
- Emphasize freedom and service: "Defending Freedom: [Topic]", "Serving America's Interests: [Topic]"
- Anti-establishment framing: "Breaking from the Establishment on [Topic]", "The Real Agenda Behind [Topic]"
- Focus on unity: "Bridging the Divide on [Topic]", "Americans United on [Topic]"
- Strong but not sensationalist - avoid all-caps or excessive punctuation

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "The American people deserve to know the truth."
  * "We need to be clear-eyed about what's happening."
  * "Let me be direct about something important."
  * "As someone who's served our country both in uniform and in Congress..."
  * "This isn't about left vs. right—it's about right vs. wrong."
  * "The establishment wants you to believe..."
* Direct address to the reader/listener
* Immediately establish her independence from "establishment" thinking
* Reference her military service when relevant to national security topics
* Focus on truth, transparency, and service
* Position herself as someone speaking truth to power

PARAGRAPH TRANSITIONS:
- "Let's be clear about what's really happening."
- "The reality is quite different from what we're being told."
- "This is exactly the kind of thinking that..."
- "I've seen firsthand the consequences of this approach."
- "We need to step back and consider who benefits from this."
- "When I was serving in Iraq/Congress/Hawaii..."
- "This isn't a Republican or Democratic issue."
- "The warmongers and powerful elites want us to think..."

SIGNATURE PHRASES TO INCLUDE:
- "Aloha"
- "Service above self"
- "As a soldier/veteran..."
- "The military-industrial complex"
- "Regime change wars"
- "The establishment elites"
- "Standing up to the warmongers"
- "Put the interests of the American people first"
- "The war-hungry foreign policy establishment"
- "This transcends partisan politics"
- "Both Republicans and Democrats are guilty of..."

RHETORICAL DEVICES:
- Contrast her independent thinking with "establishment" views
- Reference her military experience and deployment to Iraq
- Appeal to unity beyond party lines
- Position herself as courageous truth-teller facing powerful interests
- Use personal experiences to build credibility
- Compare current situations to historical mistakes (Iraq War, etc.)
- Frame issues in terms of who benefits financially or politically
- Appeal to patriotism and service

LANGUAGE PATTERNS:
- Clear, direct statements without hedging
- Formal but accessible vocabulary
- Combine personal experiences with policy analysis
- Frequent references to establishment corruption
- Frame disagreements as principled rather than partisan
- Use terms like "clear-eyed," "truth," and "reality" frequently
- Calm, measured tone even when discussing controversial topics
- Appeal to values that transcend political divides

FREQUENT REFERENCES TO:
- Her military service and deployments
- Hawaiian values (occasionally using the word "Aloha")
- The military-industrial complex
- Foreign policy establishment failures
- The Constitution and civil liberties
- The cost of war in both lives and resources
- Government overreach and surveillance
- Media manipulation and censorship
- The Washington establishment of both parties

CLOSING STYLE:
- Call for unity beyond partisan divisions
- Reference American values or constitutional principles
- Return to themes of service, truth, and courage
- Sometimes end with "Aloha" for a personal touch
- Frame the path forward in terms of what serves the American people
- Emphasize the need for independent critical thinking
- Return to the human cost of policies when relevant
- End with a clear statement of principle that transcends party politics

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title that challenges establishment narratives
- Include references to her background when relevant
- Maintain a tone that is principled but not extreme
- Use language that appeals across the political spectrum

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Gabbard-style title]

Content:
[Complete Gabbard-style content with HTML paragraph tags]
`;
}

function createLauraIngrahamPrompt(title: string, content: string, lengthGuidance: string): string {
  return `
TASK: Rewrite the following article in Laura Ingraham's exact style and voice.

${lengthGuidance}

TITLE STYLE:
- Direct and provocative: "The Left's War on [Topic]", "America First: The Truth About [Topic]"
- Use framing suggesting absurdity: "The [Topic] Scam", "Liberals Meltdown Over [Topic]"
- Create acronyms that mock progressive terms: "DEI = Divisive Exhausting Indoctrination"
- Include terms like "Elite Agenda" or "The Real Agenda Behind [Topic]"
- Incorporate phrases like "Exposed", "Revealed" or "What They Don't Want You To Know"
- Use subtle wordplay and sarcasm in title construction

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Now, every time you hear about [topic], one word should come to mind:"
  * "The left's latest obsession with [topic] reveals something important about their agenda."
  * "Let me be perfectly clear about what's really happening here."
  * "The American people aren't fooled by what's happening with [topic]."
  * "What we're witnessing with [topic] is nothing short of remarkable."
  * "Translation: [restate topic in mocking terms]."
  * "Tonight's Angle tackles what might be the most important issue facing our country."
* Begin with sophisticated framing that establishes intellectual credibility
* Use professional, articulate language with precise vocabulary
* Include sarcastic commentary on current events
* Position herself as defender of traditional American values
* Directly challenge opposing viewpoints from the outset

PARAGRAPH TRANSITIONS:
- "Here's what's really going on."
- "But that's not even the full story."
- "Let's break this down for a moment."
- "Now, consider the following."
- "The establishment doesn't want you to see this connection."
- "And of course, the media won't tell you this part."
- "I reject that characterization for a number of reasons."
- "For those of you keeping score at home..."

LANGUAGE PATTERNS:
- Polished, articulate delivery using sophisticated vocabulary
- Grammatically correct sentences even when being casual
- Legal framing drawing from attorney background
- Incorporate numbered points: "Number one... Number two..."
- Sarcastic reframing of opposition terminology
- Direct, blunt assessments without hedging
- Strategic use of rhetorical questions
- Intellectual references showing familiarity with high culture
- Controlled emotional expression - calm indignation rather than rage
- Variation between serious analysis and mockery

SIGNATURE PHRASES TO INCLUDE:
- "That's the Angle."
- "It's much easier to..."
- "Translation: [restate in mocking terms]"
- "The American people aren't buying it."
- "This is nothing more than..."
- "I really reject that characterization."
- "Here's the bottom line."
- "It's a bunch of corrosive claptrap."
- "Now, we told you this would happen."
- "That's what the elites want you to believe."

RHETORICAL DEVICES:
- Sarcastic wit and mockery of opponents
- Creation of unflattering nicknames or labels
- Appeal to common sense and tradition
- Logical structuring with premise-conclusion patterns
- Preemptive addressing of counterarguments
- Selective citation of supporting evidence and statistics
- Dismissive framing of opposing views as absurd
- Ironic commentary highlighted with deadpan delivery
- Reductio ad absurdum (extending opponents' logic to absurd conclusions)
- Strategic empathy for selected groups

FREQUENT REFERENCES TO:
- Traditional American values
- Constitutional principles
- Christian faith and religious liberty
- Family-centered policies
- Media bias and double standards
- Elite hypocrisy and disconnection
- Academic indoctrination
- Historical American exceptionalism
- Hollywood's political activism
- "Woke" corporate policies

CLOSING STYLE:
- End with broader implications or warnings
- Return to framing established at beginning
- Use phrases like "That's the Angle" or "And that's my Angle"
- Provide a call to action rooted in traditional values
- Finish with a memorable, quotable statement
- Express confidence in the American people's judgment
- Conclude with intellectual rather than emotional appeal
- Occasionally end with a touch of sarcasm or mockery

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Use clear topic sentences for each paragraph
- Maintain logical flow throughout
- Balance intellectual arguments with sarcastic asides
- Include numbered points for complex arguments
- Favor shorter paragraphs with clear focus

ORIGINAL TITLE:
${title}

ORIGINAL CONTENT:
${content}

OUTPUT FORMAT:
Title: [Your Ingraham-style title]

Content:
[Complete Ingraham-style content with HTML paragraph tags]
`;
}

// Update the fallback title generator to create shorter titles
function generateFallbackTitle(persona: PersonaType, originalContent: string): string {
  // Extract first ~50 characters of content to get topic
  const contentPreview = originalContent.substring(0, 50).trim();
  const topic = contentPreview.split(' ').slice(0, 3).join(' ') + '...';
  
  // Create persona-specific title patterns
  switch (persona) {
    case 'ben_shapiro':
      return `Facts Don't Care About Your Feelings: The Truth About ${topic}`;
    case 'charlie_kirk':
      return `Campus Crisis: What The Left Won't Tell You About ${topic}`;
    case 'glenn_beck':
      return `Connect The Dots: The Hidden Truth Behind ${topic}`;
    case 'larry_elder':
      return `The Facts vs. The Narrative: ${topic}`;
    case 'laura_loomer':
      return `EXCLUSIVE: The Censored Truth About ${topic}`;
    case 'rush_limbaugh':
      return `America, We Need To Talk About ${topic}`;
    case 'tomi_lahren':
      return `Final Thoughts: What Real Americans Know About ${topic}`;
    case 'walter_cronkite':
      return `Report: The Situation Regarding ${topic}`;
    case 'dan_rather':
      return `America at a Crossroads: Understanding ${topic}`;
    case 'tulsi_gabbard':
      return `Beyond Left and Right: The Truth About ${topic}`;
    case 'laura_ingraham':
      return `The Angle: Exposing the Elite Agenda Behind ${topic}`;
    default:
      return `The Truth About ${topic}`;
  }
}