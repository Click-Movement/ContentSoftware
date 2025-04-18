import OpenAI from 'openai';
import { RewrittenContent } from './limbaughStyleRewriter';
import Anthropic from '@anthropic-ai/sdk';

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || ''
});

export type PersonaType = 
  'charlie_kirk' | 
  'glenn_beck' | 
  'larry_elder' | 
  'laura_loomer' | 
  'rush_limbaugh' |
  'tomi_lahren';

export type AIModelType = 'gpt' | 'claude';

/**
 * Rewrite content in the style of a specific conservative commentator using AI
 * @param title Original title
 * @param content Original content to rewrite
 * @param persona The conservative persona style to use
 * @param model The AI model to use (claude or gpt)
 * @returns Rewritten content with HTML formatting
 */
export async function rewriteInPersonaStyle(
  title: string,
  content: string,
  persona: PersonaType,
  model: AIModelType = 'claude'
): Promise<RewrittenContent> {
  try {
    // Create a persona-specific prompt that explicitly captures their style elements
    const prompt = createDetailedPersonaPrompt(title, content, persona);
    
    // Use the selected model for rewriting
    if (model === 'gpt') {
      return await rewriteWithGPT(prompt, persona, content);
    } else {
      return await rewriteWithClaude(prompt, persona, content);
    }
  } catch (error) {
    console.error(`Error rewriting in ${persona} style with ${model}:`, error);
    throw new Error(`Failed to rewrite content in ${persona} style with ${model}. Please try again later.`);
  }
}

// Update the Claude response parsing
async function rewriteWithClaude(
  prompt: string, 
  persona: PersonaType,
  originalContent: string
): Promise<RewrittenContent> {
  try {
    // Calculate token limit
    const targetTokens = Math.min(3800, Math.max(800, calculateTargetLength(originalContent)));
    
    const response = await claude.messages.create({
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

    // Parse out title and content with error handling
    let extractedTitle = `${persona.replace('_', ' ')} Style Title`;
    let extractedContent = '';

    try {
      const titleMatch = fullText.match(/Title:?\s*(?:\n)?(.*?)(?:\n\n|\n(?=Content|<p>))/i);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].trim();
      }
      
      const contentWithoutTitle = fullText.replace(/Title:?\s*(?:\n)?.*?(?:\n\n|\n(?=Content|<p>))/i, '').trim();
      extractedContent = ensureHtmlFormatting(contentWithoutTitle);
    } catch (parseError) {
      console.error("Error parsing title/content:", parseError);
      // Fallback to using the entire response as content
      extractedContent = ensureHtmlFormatting(fullText);
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

// Similarly for GPT
async function rewriteWithGPT(
  prompt: string, 
  persona: PersonaType,
  originalContent: string
): Promise<RewrittenContent> {
  try {
    const targetTokens = Math.min(3500, Math.max(800, calculateTargetLength(originalContent)));
    
    const response = await openai.chat.completions.create({
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

    // Parse out title and content with error handling
    let extractedTitle = `${persona.replace('_', ' ')} Style Title`;
    let extractedContent = '';

    try {
      const titleMatch = fullText.match(/Title:?\s*(?:\n)?(.*?)(?:\n\n|\n(?=Content|<p>))/i);
      if (titleMatch && titleMatch[1]) {
        extractedTitle = titleMatch[1].trim();
      }
      
      const contentWithoutTitle = fullText.replace(/Title:?\s*(?:\n)?.*?(?:\n\n|\n(?=Content|<p>))/i, '').trim();
      extractedContent = ensureHtmlFormatting(contentWithoutTitle);
    } catch (parseError) {
      console.error("Error parsing title/content:", parseError);
      // Fallback to using the entire response as content
      extractedContent = ensureHtmlFormatting(fullText);
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

// Update the length guidance in prompts
function createDetailedPersonaPrompt(title: string, content: string, persona: PersonaType): string {
  // Calculate appropriate length for response
  const wordCount = content.split(/\s+/).length;
  
  // Create more natural length guidance
  const lengthGuidance = `CONTENT LENGTH:
- Write in a natural length that fits the persona's style
- The original content is approximately ${wordCount} words
- Avoid making the content significantly longer than the original
- Short original content should get concise outputs
- Focus on quality and authenticity rather than length
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
    default:
      throw new Error(`Unknown persona: ${persona}`);
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

PARAGRAPH TRANSITIONS:
- "Now, let's connect the dots."
- "Here's what you need to understand."
- "The historical parallels are striking."
- "The Constitution is clear on this."
- "Let me show you something important."
- "This is where it gets interesting."
- "The Founders anticipated this very situation."

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "What would the Founders say about this?"
- "Have we forgotten the lessons of history?"
- "Can you see the pattern emerging?"
- "Where in the Constitution does it authorize this?"
- "Are we connecting the dots yet?"

SIGNATURE PHRASES TO INCLUDE:
- "This is what the Founders warned us about."
- "The Constitution is clear on this issue."
- "History is repeating itself right before our eyes."
- "We need to return to first principles."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "crisis"
- Replace "said/stated/mentioned" with "warned"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "history shows us"
- Replace "it is possible that" with "mark my words:"
- Replace "it seems that" with "it's clear that"

FREQUENT REFERENCES TO:
- The Constitution
- The Founding Fathers
- Historical parallels
- Connecting dots
- Warning signs
- First principles

CLOSING STYLE:
- Start with phrases like "Let me leave you with this final thought." or "The choice before us is clear."
- Include a call to action about the Constitution or founding principles
- End with a statement like "The future of our republic hangs in the balance." or "May God continue to bless the United States of America."

SPECIAL SECTIONS:
- Include a "HISTORY LESSON" section that draws historical parallels
- Include a "CONSTITUTIONAL PERSPECTIVE" section that references founding documents

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Beck's distinctive style

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

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Let's get one thing straight."
  * "Here's a dose of reality."
  * "My father taught me something important."
  * "The facts tell a different story."
  * "As I often say on my radio show,"
  * "Let me challenge the conventional wisdom."
  * "The Sage from South Central here with some truth."
- For the main topic, use phrases like:
  * "The narrative about [TOPIC] ignores some basic facts."
  * "When it comes to [TOPIC], we need to look at the evidence, not emotions."
  * "The media's portrayal of [TOPIC] is missing crucial context."
  * "Let's examine [TOPIC] with logic and reason, not feelings."

PARAGRAPH TRANSITIONS:
- "Let's examine the facts."
- "Consider this perspective."
- "My father would say,"
- "The data tells a different story."
- "Here's what they're not telling you."
- "Let's apply some logic here."
- "The evidence contradicts the narrative."

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "Where's the evidence for this claim?"
- "What about personal responsibility?"
- "How does more government solve this problem?"
- "Why aren't we looking at the data?"
- "What would my father say about this?"

SIGNATURE PHRASES TO INCLUDE:
- "As I often say, facts don't care about feelings."
- "This is what my father would call a 'victimhood mentality.'"
- "The solution isn't more government, it's more freedom."
- "We need to look at the hard data, not emotional appeals."

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "essential"
- Replace "problem/issue/concern" with "challenge"
- Replace "said/stated/mentioned" with "pointed out"
- Replace "may/might/could" with "does"
- Replace "some people think/some believe" with "the evidence shows"
- Replace "it is possible that" with "clearly,"
- Replace "it seems that" with "the facts indicate that"

FREQUENT REFERENCES TO:
- Personal responsibility
- Facts and data
- Larry's father's wisdom
- Free market solutions
- Limited government
- Logical analysis

CLOSING STYLE:
- Start with phrases like "Let me leave you with this thought." or "Here's the bottom line."
- Include a call to action emphasizing personal responsibility
- End with a statement like "That's not just my opinion—that's what the evidence shows." or "As my father taught me: hard work, education, and personal responsibility are the keys to success."

SPECIAL SECTIONS:
- Include a "DEAR FATHER" section that references Elder's father's wisdom
- Include a "THE FACTS" section that presents clear statistical evidence

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Elder's distinctive style

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

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "BREAKING: I'm about to expose something HUGE."
  * "They tried to SILENCE me for reporting this."
  * "What I'm about to reveal will SHOCK you."
  * "I've been BANNED for telling this truth."
  * "The mainstream media is COVERING UP this story."
  * "I'm risking everything to bring you this EXCLUSIVE."
  * "This is what Big Tech doesn't want you to see."
- For the main topic, use phrases like:
  * "The TRUTH about [TOPIC] is being CENSORED across social media."
  * "What's happening with [TOPIC] is a SCANDAL that's being covered up."
  * "I've been investigating [TOPIC] and what I found will OUTRAGE you."
  * "The establishment is TERRIFIED that you'll learn the truth about [TOPIC]."

PARAGRAPH TRANSITIONS:
- "Here's what they're HIDING from you."
- "I've EXCLUSIVELY obtained information that"
- "My sources have CONFIRMED that"
- "They don't want this getting out, but"
- "I'm EXPOSING the truth that"
- "Despite being CENSORED, I can reveal that"
- "What I'm about to share got me BANNED from Twitter."

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "Why is no one else reporting this?"
- "Why am I the only journalist brave enough to cover this?"
- "Why are they so desperate to silence this story?"
- "How much longer will they get away with this cover-up?"
- "When will people wake up to what's really happening?"

SIGNATURE PHRASES TO INCLUDE:
- "This is what they don't want you to know."
- "I've been BANNED for reporting this."
- "Big Tech is trying to SILENCE this story."
- "This is the TRUTH they're hiding from you."

LANGUAGE PATTERNS:
- Use CAPITALIZATION for emphasis on key words
- Replace "important/significant/crucial" with "CRITICAL"
- Replace "problem/issue/concern" with "CRISIS"
- Replace "said/stated/mentioned" with "ADMITTED"
- Replace "may/might/could" with "WILL"
- Replace "some people think/some believe" with "I can CONFIRM"
- Replace "it is possible that" with "I've EXPOSED that"
- Replace "it seems that" with "my sources CONFIRM that"

FREQUENT REFERENCES TO:
- Being censored, banned, or deplatformed
- Having exclusive sources or information
- The establishment covering up information
- Being targeted for reporting the truth
- Social media censorship

CLOSING STYLE:
- Start with phrases like "EXCLUSIVE: Here's what you need to know." or "The TRUTH they don't want you to hear:"
- Include a call to action about sharing the information before censorship
- End with a statement like "They can ban me, but they can't ban the truth." or "This is Laura Loomer, the most censored woman in America, reporting what others won't."

SPECIAL SECTIONS:
- Include a "BANNED" section about censorship related to the topic
- Include an "EXCLUSIVE" section with supposedly exclusive information

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Loomer's distinctive style with strategic CAPITALIZATION

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

PARAGRAPH TRANSITIONS:
- "Now, here's the thing."
- "But it gets even better."
- "And let me tell you something else."
- "Here's what they don't want you to know."
- "The real story is much deeper."
- "Let's be perfectly clear about this."
- "I want to make sure you understand this next point."

EMOTIONAL INTENSITY MARKERS:
- " - and I mean EVERY word of this - "
- " - and this is the part they don't want you to hear - "
- " - now pay attention to this part - "
- " - and this is absolutely CRITICAL - "
- " - and I've been saying this for YEARS - "

SIGNATURE PHRASES TO INCLUDE:
- "The drive-by media won't tell you this."
- "Don't doubt me on this, folks."
- "I told you this would happen."
- "Let me break this down in a way that makes sense."
- "The American people deserve to know the truth about this."
- References to "ditto-heads" or "on this program"

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "CRITICAL"
- Replace "problem/issue/concern" with "DISASTER"
- Replace "said/stated/mentioned" with "ADMITTED"
- Replace "may/might/could" with "WILL"
- Replace "some people think/some believe" with "We all know"
- Replace "it is possible that" with "Make no mistake,"
- Replace "it seems that" with "It's crystal clear that"
- Use strategic CAPITALIZATION for emphasis

CLOSING STYLE:
- Start with phrases like "And that, my friends, is exactly what we've been saying all along." or "Make no mistake about it - this is just the beginning."
- Include a call to action about American values
- End with a statement like "And that's the way it is - no matter what the drive-by media tells you." or "Remember, you heard it here first."

SPECIAL SECTIONS:
- Include a paragraph with rhetorical questions
- Include a "ditto" paragraph near the end that references his listeners

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Limbaugh's distinctive style

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

OPENING PARAGRAPH STYLE:
- Always start with one of these exact opening phrases:
  * "Let me give you my final thoughts on this."
  * "I'm not going to sugarcoat this for you."
  * "Here's the deal, folks."
  * "Let's be clear about something."
  * "I'm about to trigger some snowflakes with this one."
  * "America, we need to talk about this."
  * "I don't care who this offends, but"
- For the main topic, use phrases like:
  * "The left's approach to [TOPIC] is exactly what's wrong with America today."
  * "Real Americans are tired of the nonsense surrounding [TOPIC]."
  * "The liberal elite want to control the narrative on [TOPIC], but I'm not buying it."
  * "It's time for some straight talk about [TOPIC] that won't make it into your safe spaces."

PARAGRAPH TRANSITIONS:
- "Here's the thing."
- "Let me break it down for you."
- "This is where it gets real."
- "The left won't tell you this, but"
- "While the snowflakes are triggered,"
- "Let's talk about what really matters."
- "I don't care who this offends, but"

REGULAR USE OF RHETORICAL QUESTIONS LIKE:
- "When will the left admit they're wrong?"
- "How much more of this liberal nonsense are we supposed to take?"
- "Why are conservatives always expected to apologize while liberals get a free pass?"
- "Does anyone still believe the mainstream media?"
- "When did loving America become controversial?"

SIGNATURE PHRASES TO INCLUDE:
- "And that's not just my opinion, that's a fact."
- "Sorry, not sorry."
- "Let that sink in."
- "That's what real Americans believe."
- References to being a millennial conservative

LANGUAGE PATTERNS:
- Replace "important/significant/crucial" with "critical"
- Replace "problem/issue/concern" with "disaster"
- Replace "said/stated/mentioned" with "called out"
- Replace "may/might/could" with "will"
- Replace "some people think/some believe" with "real Americans know"
- Replace "it is possible that" with "let's be honest:"
- Replace "it seems that" with "it's obvious that"

FREQUENT REFERENCES TO:
- "Real Americans"
- "Snowflakes" and "safe spaces"
- "Liberal elite"
- Being a millennial who doesn't need "trigger warnings"
- Personal responsibility
- Patriotism and love of country

CLOSING STYLE:
- Start with phrases like "Those are my final thoughts." or "Let me leave you with this."
- Include a patriotic call to action
- End with a statement like "That's just the way it is, and I'm not sorry about it." or "And if that offends you, I'm definitely not sorry."

SPECIAL SECTIONS:
- Include a "FINAL THOUGHTS" section that summarizes the key points
- Include a "LIBERAL HYPOCRISY" section that points out perceived double standards

FORMAT: 
- Structure with HTML paragraph tags (<p>...</p>)
- Write an engaging title and content that maintains key facts but completely rewrites in Lahren's distinctive style

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