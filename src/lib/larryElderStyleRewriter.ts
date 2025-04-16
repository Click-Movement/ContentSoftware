// Larry Elder Style Content Rewriter
// Based on Larry Elder's distinctive writing and speaking style
import { RewrittenContent } from './limbaughStyleRewriter';


interface KeyElements {
  facts: string[];
  quotes: string[];
  statistics: string[];
  people: string[];
  topics: string[];
  mainIdeas: string[];
}

export function applyLarryElderStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Larry Elder style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative in Larry Elder's style
  // Focus on facts, logic, and challenging conventional wisdom
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Elder style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case
    if (title.toLowerCase().includes('race') || title.toLowerCase().includes('racism') || title.toLowerCase().includes('discrimination')) {
      const prefixes = [
        "The Race Card: ", 
        "Myth vs. Reality: ", 
        "What They Won't Tell You About ", 
        "The Truth About "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('government') || title.toLowerCase().includes('policy') || title.toLowerCase().includes('regulation')) {
      const prefixes = [
        "Big Government Failure: ", 
        "The High Cost of ", 
        "Freedom Solution: ", 
        "The Facts About "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "Dear Father, Dear Son: ", 
        "The Sage from South Central on ", 
        "Facts Don't Care About Feelings: ",
        "What You Won't Hear in the Media: "
      ];
      const emphasis = emphasisPhrases[Math.floor(Math.random() * emphasisPhrases.length)];
      return `${emphasis}${capitalizeFirstLetter(title)}`;
    }
  }
  
  // If already strong, ensure proper capitalization and add emphasis
  return capitalizeFirstLetter(title) + (title.endsWith('!') ? '' : '!');
}

// Helper function to properly capitalize a string
function capitalizeFirstLetter(string: string): string {
  // Split the string into words
  const words = string.toLowerCase().split(' ');
  
  // Capitalize the first letter of each word, except for certain small words
  const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with'];
  
  return words.map((word, index) => {
    // Always capitalize the first word and words that aren't in the smallWords list
    if (index === 0 || !smallWords.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  }).join(' ');
}

function extractKeyElements(content: string): KeyElements {
  // Extract key facts, quotes, statistics, and people mentioned
  const keyElements: KeyElements={
    facts: [],
    quotes: [],
    statistics: [],
    people: [],
    topics: [],
    mainIdeas: [] 
  };
  
  // Extract quotes (text within quotation marks)
  const quoteRegex = /"([^"]*)"/g;
  let quoteMatch;
  while ((quoteMatch = quoteRegex.exec(content)) !== null) {
    keyElements.quotes.push(quoteMatch[1]);
  }
  
  // Extract statistics (numbers with % or numerical references)
  const statsRegex = /(\d+(\.\d+)?%|\$\d+(\.\d+)?(( |\t)*(million|billion|trillion))?)/g;
  let statsMatch;
  while ((statsMatch = statsRegex.exec(content)) !== null) {
    keyElements.statistics.push(statsMatch[0]);
  }
  
  // Extract people (common titles followed by names)
  const peopleRegex = /(President|Senator|Congressman|Representative|Secretary|Dr\.|Mr\.|Mrs\.|Ms\.) ([A-Z][a-z]+ [A-Z][a-z]+)/g;
  let peopleMatch;
  while ((peopleMatch = peopleRegex.exec(content)) !== null) {
    keyElements.people.push(peopleMatch[0]);
  }
  
  // Extract potential facts (sentences with key indicators)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  for (const sentence of sentences) {
    if (/according to|reported|study|research|found|discovered|revealed/i.test(sentence)) {
      keyElements.facts.push(sentence.trim());
    }
  }
  
  // Extract main topics and ideas for more thorough rewriting
  const topicWords = content.match(/\b[A-Za-z]{4,}\b/g) || [];
  const wordFrequency: {[key: string]: number} = {};
  
  // Count word frequency to identify main topics
  topicWords.forEach(word => {
    const lowerWord = word.toLowerCase();
    if (!commonWords.includes(lowerWord)) {
      wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
    }
  });
  
  // Get the top 5 most frequent words as main topics
  keyElements.topics = Object.entries(wordFrequency)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(entry => entry[0]);
  
  // Extract main ideas (first sentence of each paragraph often contains the main idea)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  paragraphs.forEach(paragraph => {
    const firstSentence = paragraph.split(/[.!?]/).filter(s => s.trim().length > 0)[0];
    if (firstSentence && firstSentence.length > 20) {
      keyElements.mainIdeas.push(firstSentence.trim());
    }
  });
  
  return keyElements;
}

// List of common words to ignore when identifying topics
const commonWords = [
  'about', 'after', 'again', 'also', 'another', 'because', 'been', 'before', 'being', 'between',
  'both', 'could', 'does', 'doing', 'during', 'each', 'either', 'every', 'from', 'have', 'having',
  'here', 'itself', 'just', 'like', 'more', 'most', 'much', 'must', 'never', 'only', 'other',
  'over', 'same', 'should', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'under', 'very', 'what', 'when', 'where', 'which',
  'while', 'with', 'would', 'your'
];

function transformContent(content: string, keyElements: KeyElements): string {
  // Break content into paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  // Create a completely new set of paragraphs in Larry Elder style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Elder-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i, keyElements);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Elder-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1], keyElements));
  }
  
  // Add additional Elder-style paragraphs for authenticity
  const enhancedParagraphs = addElderEnhancements(newParagraphs);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: KeyElements): string {
  // Create a completely new opening paragraph in Larry Elder style
  const openingPhrases = [
    "Let's get one thing straight. ",
    "Here's a dose of reality. ",
    "My father taught me something important. ",
    "The facts tell a different story. ",
    "As I often say on my radio show, ",
    "Let me challenge the conventional wisdom. ",
    "The Sage from South Central here with some truth. "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `The narrative about ${mainTopic} ignores some basic facts. `,
      `When it comes to ${mainTopic}, we need to look at the evidence, not emotions. `,
      `The media's portrayal of ${mainTopic} is missing crucial context. `,
      `Let's examine ${mainTopic} with logic and reason, not feelings. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Elder style
    newOpening += rewordInElderStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Elder-style statement
    const genericStatements = [
      "The data contradicts the popular narrative being pushed by the left. ",
      "We need to focus on facts and evidence, not emotional appeals and virtue signaling. ",
      "Personal responsibility and free market solutions are being ignored in this conversation. ",
      "The government's involvement typically makes problems worse, not better. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'essential')
    .replace(/problem|issue|concern/gi, 'challenge')
    .replace(/said|stated|mentioned/gi, 'pointed out');
}

function rewordInElderStyle(text: string): string {
  // Reword text in Larry Elder's distinctive style
  // Focus on facts, logic, and challenging conventional wisdom
  
  // Replace neutral phrases with Elder-style phrases
  let rewordedText = text
    .replace(/people are concerned about/gi, 'the facts about')
    .replace(/some experts believe/gi, 'the evidence shows')
    .replace(/it is possible that/gi, "let\\'s be clear:")
    .replace(/there are indications that/gi, 'the data indicates')
    .replace(/according to some sources/gi, 'contrary to the media narrative');
  
  // Add Elder's signature phrases
  const elderPhrases = [
    "As I often say, facts don't care about feelings. ",
    "This is what my father would call a 'victimhood mentality.' ",
    "The solution isn't more government, it's more freedom. ",
    "We need to look at the hard data, not emotional appeals. "
  ];
  
  // Add an Elder phrase to longer text
  if (rewordedText.length > 100) {
    const elderPhrase = elderPhrases[Math.floor(Math.random() * elderPhrases.length)];
    rewordedText += elderPhrase;
  }
  
  return rewordedText;
}

function createNewParagraph(originalParagraph: string, index: number, keyElements: KeyElements): string {
  // Create a completely new paragraph based on the original content
  
  // Start with an Elder-style transition phrase
  const transitionPhrases = [
    "Let's examine the facts. ",
    "Consider this perspective. ",
    "My father would say, ",
    "The data tells a different story. ",
    "Here's what they're not telling you. ",
    "Let's apply some logic here. ",
    "The evidence contradicts the narrative. "
  ];
  
  const transitionPhrase = transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
  
  // Extract key information from the original paragraph
  const sentences = originalParagraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let mainPoint = '';
  
  if (sentences.length > 0) {
    // Take a key sentence from the original paragraph
    const sentenceIndex = Math.min(Math.floor(Math.random() * sentences.length), sentences.length - 1);
    mainPoint = sentences[sentenceIndex].trim();
  }
  
  // Completely reword the main point in Elder style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInElderStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Elder-style statement
    const genericStatements = [
      "The left continues to ignore the role of personal responsibility in this issue. ",
      "Government intervention often creates more problems than it solves. ",
      "We need to look at the facts and data, not emotional appeals. ",
      "The free market provides better solutions than government mandates. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "Where's the evidence for this claim? ",
      "What about personal responsibility? ",
      "How does more government solve this problem? ",
      "Why aren't we looking at the data? ",
      "What would my father say about this? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add statistical references if available
  if (keyElements.statistics.length > 0 && index % 2 === 0) {
    const statIndex = index % keyElements.statistics.length;
    const statistic = keyElements.statistics[statIndex];
    newParagraph += ` The statistics are clear: ${statistic} contradicts the prevailing narrative. `;
  }
  
  // Add references to personal responsibility occasionally
  if (index % 4 === 0) {
    const responsibilityPhrases = [
      " Personal responsibility is the key factor being ignored here. ",
      " My father taught me that success comes from hard work, not government handouts. ",
      " We need to stop blaming external factors and focus on individual choices. ",
      " The solution isn't more government, it's more freedom and personal accountability. ",
      " This is what happens when we abandon the principles of self-reliance. "
    ];
    
    const responsibilityPhrase = responsibilityPhrases[Math.floor(Math.random() * responsibilityPhrases.length)];
    newParagraph += responsibilityPhrase;
  }
  
  // Replace neutral language with more Elder-style assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'does')
    .replace(/some people think|some believe/gi, 'the evidence shows')
    .replace(/it is possible that/gi, 'clearly,')
    .replace(/it seems that/gi, 'the facts indicate that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number): string {
  // Create an additional Elder-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'father_wisdom',
    'race_relations',
    'government_critique',
    'media_bias',
    'personal_responsibility'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'father_wisdom':
      return "My father, who was born in the Jim Crow south, always taught me that hard work, education, and personal responsibility were the keys to success. He didn't blame 'the system' or expect handouts. He worked two jobs, raised three boys as a single dad, and never complained. That's the kind of wisdom we need more of today, instead of the victimhood mentality that permeates our culture. Success isn't about what others do for you—it's about what you do for yourself.";
      
    case 'race_relations':
      return "Let's talk about race in America. The left wants you to believe that racism is around every corner, that it's systemic and insurmountable. But the data tells a different story. Black Americans have made tremendous progress over the decades, and the biggest obstacles to success today aren't racist systems but destructive policies that undermine family structure, educational choice, and economic opportunity. Playing the race card might win votes, but it doesn't solve problems.";
      
    case 'government_critique':
      return "Government is not the solution to our problems; government is the problem. When the government gets involved, costs go up, efficiency goes down, and freedom is diminished. Look at any sector where government has a heavy hand—healthcare, education, housing—and you'll find skyrocketing costs and declining quality. The free market, with its competition and innovation, has lifted more people out of poverty than any government program ever could. We need less regulation, lower taxes, and more economic freedom.";
      
    case 'media_bias':
      return "The mainstream media doesn't just report the news—they shape it to fit their narrative. They highlight stories that advance their agenda and bury those that contradict it. They present opinion as fact and treat speculation as certainty. They claim to be objective while showing clear bias in their coverage. This isn't journalism; it's activism. And it's why more Americans are turning to alternative sources for information. The media's credibility crisis is entirely self-inflicted.";
      
    case 'personal_responsibility':
      return "Personal responsibility is the foundation of a free society. When we make choices, we must accept the consequences—both good and bad. But today, there's a growing tendency to blame external factors for personal failures. It's always someone else's fault, some system that's rigged, some privilege that others have. This victim mentality is destructive because it robs people of their agency and their power to change their circumstances. The most empowering message we can give people is that they are responsible for their own lives.";
      
    default:
      return "The facts don't care about your feelings. This isn't about emotion or intention—it's about results. What actually works? What policies have a track record of success? When we look at the evidence objectively, we find that free markets, limited government, strong families, and personal responsibility create the conditions for human flourishing. These aren't just conservative talking points; they're principles validated by history and data. We need to focus less on how policies make us feel and more on what they actually accomplish.";
  }
}

function createClosingParagraph(originalParagraph: string, keyElements: KeyElements): string {
  // Create a strong closing paragraph in Larry Elder style
  
  // Start with an Elder-style closing phrase
  const closingPhrases = [
    "Let me leave you with this thought. ",
    "Here's the bottom line. ",
    "As my father would say, ",
    "The facts lead to an inescapable conclusion. ",
    "Let's be clear about what matters. ",
    "The Sage from South Central's final word: ",
    "When you cut through the noise, here's what remains. "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Create a completely new closing paragraph
  let newClosing = closingPhrase;
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[keyElements.mainIdeas.length - 1];
    // Completely reword the main idea in Elder style
    newClosing += rewordInElderStyle(mainIdea);
  }
  
  // Add a call to action
  const callsToAction = [
    " We need to focus on facts, not feelings. ",
    " Personal responsibility, not government intervention, is the answer. ",
    " It's time to look at what works, not what sounds good. ",
    " The solution is more freedom, not more regulation. ",
    " We must return to the principles that made America great. "
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  newClosing += callToAction;
  
  // Add a final Elder-style statement
  const finalStatements = [
    "That's not just my opinion—that's what the evidence shows.",
    "As my father taught me: hard work, education, and personal responsibility are the keys to success.",
    "The facts don't care about your feelings, but they do point to the truth.",
    "We need more logic and reason in our discourse, not emotional appeals and virtue signaling.",
    "That's the perspective you won't hear in the mainstream media, but it's one that needs to be said."
  ];
  
  const finalStatement = finalStatements[Math.floor(Math.random() * finalStatements.length)];
  newClosing += ` ${finalStatement}`;
  
  return newClosing;
}

function addElderEnhancements(paragraphs: string[]): string[] {
  // Add Larry Elder style enhancements to the paragraphs
  
  // Add a "DEAR FATHER" section in the middle
  if (paragraphs.length > 3) {
    const fatherIndex = Math.floor(paragraphs.length / 2);
    const fatherWisdom = "DEAR FATHER: My father taught me that success requires three things: hard work, education, and personal responsibility. He didn't blame racism or 'the system' for his challenges. He worked two jobs, raised three boys as a single dad, and never complained. He believed in America's promise and instilled those values in his children. Today, too many are taught to see themselves as victims rather than agents of their own destiny. My father's wisdom—not government programs or lowered standards—is what more Americans need today.";
    
    paragraphs.splice(fatherIndex, 0, fatherWisdom);
  }
  
  // Add a "THE FACTS" section
  if (paragraphs.length > 4) {
    const factsIndex = Math.floor(paragraphs.length * 0.75);
    const factsSection = "THE FACTS: Let's look at what the data actually shows, not what the narrative suggests. The evidence contradicts many popular assumptions about systemic problems and government solutions. When we examine outcomes rather than intentions, we find that free markets, limited government, strong families, and personal responsibility consistently produce better results than centralized control, excessive regulation, family breakdown, and victimhood mentality. These aren't just conservative talking points—they're principles validated by history and data.";
    
    paragraphs.splice(factsIndex, 0, factsSection);
  }
  
  // Enhance paragraphs with Elder's signature phrases and style
  return paragraphs.map((paragraph, index) => {
    // Add "facts don't care about feelings" references
    if (index % 3 === 0) {
      paragraph = paragraph.replace(/believe|feel|think/gi, 'know based on evidence');
    }
    
    // Add "personal responsibility" phrases
    if (index % 4 === 1) {
      paragraph += " Personal responsibility is key.";
    }
    
    // Add "my father taught me" references
    if (index % 5 === 2) {
      paragraph += " As my father would say, success comes from within, not from government.";
    }
    
    return paragraph;
  });
}
