// Laura Loomer Style Content Rewriter
// Based on Laura Loomer's distinctive writing and speaking style

import { RewrittenContent } from './limbaughStyleRewriter';

export function applyLauraLoomerStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Laura Loomer style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative in Laura Loomer's style
  // Focus on exposés, controversy, and direct accusations
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Loomer style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case
    if (title.toLowerCase().includes('tech') || title.toLowerCase().includes('social media') || title.toLowerCase().includes('censorship')) {
      const prefixes = [
        "BANNED: The Truth About ", 
        "Big Tech Doesn't Want You To See: ", 
        "CENSORED: Exposing ", 
        "Tech Tyranny: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('islam') || title.toLowerCase().includes('immigration') || title.toLowerCase().includes('border')) {
      const prefixes = [
        "EXCLUSIVE INVESTIGATION: ", 
        "What They're Hiding About ", 
        "The Dangerous Truth About ", 
        "EXPOSED: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "BREAKING: ", 
        "EXCLUSIVE: ", 
        "They Don't Want You To Know: ",
        "I'm EXPOSING "
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

function extractKeyElements(content: string): any {
  // Extract key facts, quotes, statistics, and people mentioned
  const keyElements: any = {
    facts: [],
    quotes: [],
    statistics: [],
    people: [],
    topics: [],
    mainIdeas: [],
    controversies: []
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
  
  // Extract controversies
  for (const sentence of sentences) {
    if (/controversy|scandal|exposed|banned|censored|silenced|cover-up|corruption/i.test(sentence)) {
      keyElements.controversies.push(sentence.trim());
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

function transformContent(content: string, keyElements: any): string {
  // Break content into paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  // Create a completely new set of paragraphs in Laura Loomer style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Loomer-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i, keyElements);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Loomer-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i, keyElements));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1], keyElements));
  }
  
  // Add additional Loomer-style paragraphs for authenticity
  const enhancedParagraphs = addLoomerEnhancements(newParagraphs, keyElements);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: any): string {
  // Create a completely new opening paragraph in Laura Loomer style
  const openingPhrases = [
    "BREAKING: I'm about to expose something HUGE. ",
    "They tried to SILENCE me for reporting this. ",
    "What I'm about to reveal will SHOCK you. ",
    "I've been BANNED for telling this truth. ",
    "The mainstream media is COVERING UP this story. ",
    "I'm risking everything to bring you this EXCLUSIVE. ",
    "This is what Big Tech doesn't want you to see. "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `The TRUTH about ${mainTopic} is being CENSORED across social media. `,
      `What's happening with ${mainTopic} is a SCANDAL that's being covered up. `,
      `I've been investigating ${mainTopic} and what I found will OUTRAGE you. `,
      `The establishment is TERRIFIED that you'll learn the truth about ${mainTopic}. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Loomer style
    newOpening += rewordInLoomerStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Loomer-style statement
    const genericStatements = [
      "The mainstream media won't report this because it doesn't fit their narrative. ",
      "I've been targeted, deplatformed, and silenced for exposing these facts. ",
      "This is the kind of journalism that gets you BANNED from social media. ",
      "What I'm about to show you is being actively suppressed by Big Tech. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'CRITICAL')
    .replace(/problem|issue|concern/gi, 'CRISIS')
    .replace(/said|stated|mentioned/gi, 'ADMITTED');
}

function rewordInLoomerStyle(text: string): string {
  // Reword text in Laura Loomer's distinctive style
  // Focus on exposés, controversy, and direct accusations
  
  // Replace neutral phrases with Loomer-style phrases
  let rewordedText = text
    .replace(/people are concerned about/gi, 'people are OUTRAGED about')
    .replace(/some experts believe/gi, 'sources have CONFIRMED')
    .replace(/it is possible that/gi, 'I can EXCLUSIVELY report that')
    .replace(/there are indications that/gi, "I\\'ve EXPOSED that")
    .replace(/according to some sources/gi, 'my INVESTIGATION has revealed');
  
  // Add Loomer's signature phrases
  const loomerPhrases = [
    " This is what they don't want you to know. ",
    " I've been BANNED for reporting this. ",
    " Big Tech is trying to SILENCE this story. ",
    " This is the TRUTH they're hiding from you. "
  ];
  
  // Add a Loomer phrase to longer text
  if (rewordedText.length > 100) {
    const loomerPhrase = loomerPhrases[Math.floor(Math.random() * loomerPhrases.length)];
    rewordedText += loomerPhrase;
  }
  
  return rewordedText;
}

function createNewParagraph(originalParagraph: string, index: number, keyElements: any): string {
  // Create a completely new paragraph based on the original content
  
  // Start with a Loomer-style transition phrase
  const transitionPhrases = [
    "Here's what they're HIDING from you. ",
    "I've EXCLUSIVELY obtained information that ",
    "My sources have CONFIRMED that ",
    "They don't want this getting out, but ",
    "I'm EXPOSING the truth that ",
    "Despite being CENSORED, I can reveal that ",
    "What I'm about to share got me BANNED from Twitter. "
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
  
  // Completely reword the main point in Loomer style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInLoomerStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Loomer-style statement
    const genericStatements = [
      "the mainstream media is COMPLICIT in covering up this scandal. ",
      "Big Tech is actively CENSORING anyone who speaks out about this. ",
      "I've been targeted for EXPOSING the truth that others are afraid to report. ",
      "this is exactly the kind of story that gets journalists DEPLATFORMED. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "Why is no one else reporting this? ",
      "Why am I the only journalist brave enough to cover this? ",
      "Why are they so desperate to silence this story? ",
      "How much longer will they get away with this cover-up? ",
      "When will people wake up to what's really happening? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add controversy references if available
  if (keyElements.controversies.length > 0 && index % 2 === 0) {
    const contIndex = index % keyElements.controversies.length;
    const controversy = keyElements.controversies[contIndex];
    newParagraph += ` I've been investigating this: ${rewordInLoomerStyle(controversy)} `;
  }
  
  // Add censorship references occasionally
  if (index % 4 === 0) {
    const censorshipPhrases = [
      " I've been BANNED from every major social media platform for reporting this. ",
      " This is exactly the kind of journalism that gets you DEPLATFORMED. ",
      " Big Tech doesn't want this information spreading, which is why they CENSOR people like me. ",
      " The establishment is TERRIFIED of this information getting out. ",
      " I've been SILENCED multiple times for exposing these facts. "
    ];
    
    const censorshipPhrase = censorshipPhrases[Math.floor(Math.random() * censorshipPhrases.length)];
    newParagraph += censorshipPhrase;
  }
  
  // Replace neutral language with more Loomer-style assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'WILL')
    .replace(/some people think|some believe/gi, 'I can CONFIRM')
    .replace(/it is possible that/gi, "I\\'ve EXPOSED that")
    .replace(/it seems that/gi, 'my sources CONFIRM that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number, keyElements: any): string {
  // Create an additional Loomer-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'tech_censorship',
    'investigative_journalism',
    'personal_persecution',
    'establishment_corruption',
    'call_to_action'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'tech_censorship':
      return "Big Tech is ACTIVELY CENSORING this information. I've been BANNED from Twitter, Facebook, Instagram, PayPal, Venmo, Uber, Lyft, and virtually every other platform for exposing these truths. They claim it's about 'terms of service' violations, but we all know it's political censorship. They can't handle independent journalists who don't follow their approved narratives. They're TERRIFIED of the truth getting out. But I won't be silenced. I'll continue to report what the mainstream media won't touch, no matter how many platforms ban me.";
      
    case 'investigative_journalism':
      return "My EXCLUSIVE INVESTIGATION has uncovered information that no other journalist is reporting. I've spoken to sources inside the organization, obtained confidential documents, and compiled evidence that EXPOSES what's really happening. This is the kind of hard-hitting journalism that's disappeared from mainstream media. They're too busy protecting the establishment to do actual reporting. But I'm not afraid to go where others won't, ask questions others don't dare to ask, and publish what others are too scared to touch.";
      
    case 'personal_persecution':
      return "I've been TARGETED for my journalism. They've banned me from social media, removed my financial accounts, put me on no-fly lists, and even sent law enforcement to harass me. This is what happens when you expose the truth in America today. They use every tool at their disposal to silence dissidents. But I won't back down. Every attack against me only PROVES that I'm over the target. They wouldn't try so hard to silence me if what I was reporting wasn't true. Their persecution only strengthens my resolve.";
      
    case 'establishment_corruption':
      return "The CORRUPTION runs deep. Government officials, tech executives, media conglomerates, and global organizations are all working together to control the narrative and hide the truth from the American people. This isn't conspiracy theory—it's conspiracy FACT. I've documented the connections, exposed the money trail, and revealed the coordination. The same people censoring speech are the ones profiting from policies they promote. The same officials claiming to protect you are the ones violating your rights. The system is RIGGED, and I'm one of the few brave enough to say it.";
      
    case 'call_to_action':
      return "AMERICANS MUST WAKE UP to what's happening. While you're distracted by manufactured outrage and celebrity gossip, your freedoms are being stripped away. The time for silence is OVER. Share this information everywhere before it's censored. Support independent journalists who are being deplatformed for telling the truth. Cancel your subscriptions to mainstream media outlets that lie to you. Follow me on alternative platforms where I haven't been banned yet. The only way we win this information war is if enough people become brave enough to speak out despite the consequences.";
      
    default:
      return "I'm the most BANNED, CENSORED journalist in America, and there's a reason for that. I report stories no one else will touch. I ask questions no one else will ask. I expose corruption that others ignore. The establishment has tried everything to silence me—social media bans, payment processor blacklisting, intimidation tactics—but I won't stop. Every attempt to censor me only confirms that I'm reporting the truth they don't want you to hear. This is what real journalism looks like in 2023: being willing to sacrifice everything to expose the truth.";
  }
}

function createClosingParagraph(originalParagraph: string, keyElements: any): string {
  // Create a strong closing paragraph in Laura Loomer style
  
  // Start with a Loomer-style closing phrase
  const closingPhrases = [
    "EXCLUSIVE: Here's what you need to know. ",
    "The TRUTH they don't want you to hear: ",
    "I'm RISKING EVERYTHING to tell you this: ",
    "This is what gets journalists BANNED: ",
    "My FINAL EXPOSÉ on this topic: ",
    "BREAKING: My investigation concludes that ",
    "The CENSORED truth about this story: "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Create a completely new closing paragraph
  let newClosing = closingPhrase;
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[keyElements.mainIdeas.length - 1];
    // Completely reword the main idea in Loomer style
    newClosing += rewordInLoomerStyle(mainIdea);
  }
  
  // Add a call to action
  const callsToAction = [
    " SHARE this before it gets censored! ",
    " The mainstream media WON'T report this, so you must spread it! ",
    " Follow me on alternative platforms before I'm completely silenced! ",
    " Support independent journalism that exposes the TRUTH! ",
    " This is what REAL journalism looks like—help me continue this work! "
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  newClosing += callToAction;
  
  // Add a final Loomer-style statement
  const finalStatements = [
    "They can ban me, but they can't ban the truth.",
    "This is Laura Loomer, the most censored woman in America, reporting what others won't.",
    "I've been banned for less explosive reporting than this—that's how you know it's important.",
    "The more they try to silence me, the louder I'll become.",
    "This is what journalism is supposed to be: fearless pursuit of truth regardless of consequences."
  ];
  
  const finalStatement = finalStatements[Math.floor(Math.random() * finalStatements.length)];
  newClosing += ` ${finalStatement}`;
  
  return newClosing;
}

function addLoomerEnhancements(paragraphs: string[], keyElements: any): string[] {
  // Add Laura Loomer style enhancements to the paragraphs
  
  // Add a "BANNED" section in the middle
  if (paragraphs.length > 3) {
    const bannedIndex = Math.floor(paragraphs.length / 2);
    const bannedSection = "BANNED: I've been PERMANENTLY BANNED from Twitter, Facebook, Instagram, PayPal, Venmo, GoFundMe, Uber, Lyft, Medium, TeeSpring, and virtually every other major tech platform. Why? Because I report stories like this one. Big Tech doesn't want independent journalists exposing the truth. They claim it's about 'terms of service' violations, but we all know it's political censorship. They're TERRIFIED of the information I'm sharing with you right now. That's how you know it's important.";
    
    paragraphs.splice(bannedIndex, 0, bannedSection);
  }
  
  // Add an "EXCLUSIVE" section
  if (paragraphs.length > 4) {
    const exclusiveIndex = Math.floor(paragraphs.length * 0.75);
    const exclusiveSection = "EXCLUSIVE: My sources have provided me with information that NO OTHER journalist has access to. This is the kind of reporting that gets you deplatformed in America today. The mainstream media won't touch this story because they're complicit in the cover-up. They're not journalists—they're propagandists protecting the establishment. Real journalism means being willing to report the truth regardless of the consequences, and I've paid a heavy price for my commitment to truth.";
    
    paragraphs.splice(exclusiveIndex, 0, exclusiveSection);
  }
  
  // Enhance paragraphs with Loomer's signature phrases and style
  return paragraphs.map((paragraph, index) => {
    // Add "BANNED" references
    if (index % 3 === 0) {
      paragraph = paragraph.replace(/censored|silenced|removed/gi, 'BANNED');
    }
    
    // Add "EXCLUSIVE" phrases
    if (index % 4 === 1) {
      paragraph += " EXCLUSIVE!";
    }
    
    // Add "EXPOSED" references
    if (index % 5 === 2) {
      paragraph += " I've EXPOSED this!";
    }
    
    return paragraph;
  });
}
