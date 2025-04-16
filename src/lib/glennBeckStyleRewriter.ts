// Glenn Beck Style Content Rewriter
// Based on Glenn Beck's distinctive writing and speaking style

import { RewrittenContent } from './limbaughStyleRewriter';

interface KeyElements {
  facts: string[];
  quotes: string[];
  statistics: string[];
  people: string[];
  topics: string[];
  mainIdeas: string[];
  historicalReferences: string[];
}

export function applyGlennBeckStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Glenn Beck style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative in Glenn Beck's style
  // Focus on constitutional principles, historical connections, and warnings
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Beck style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case
    if (title.toLowerCase().includes('constitution') || title.toLowerCase().includes('freedom') || title.toLowerCase().includes('liberty')) {
      const prefixes = [
        "Constitutional Crisis: ", 
        "The Founders Warned Us: ", 
        "Liberty Alert: ", 
        "Freedom Under Attack: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('history') || title.toLowerCase().includes('america') || title.toLowerCase().includes('founding')) {
      const prefixes = [
        "History Teaches Us: ", 
        "The Forgotten History of ", 
        "What the Founders Would Say About ", 
        "America's Crossroads: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "The Coming Storm: ", 
        "Connect the Dots: ", 
        "Warning Signs: ",
        "The Truth Behind "
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
  const keyElements: KeyElements = {
    facts: [],
    quotes: [],
    statistics: [],
    people: [],
    topics: [],
    mainIdeas: [],
    historicalReferences: []
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
  
  // Extract historical references
  for (const sentence of sentences) {
    if (/history|founding fathers|constitution|1776|1787|washington|jefferson|madison|hamilton|franklin|adams/i.test(sentence)) {
      keyElements.historicalReferences.push(sentence.trim());
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
  
  // Create a completely new set of paragraphs in Glenn Beck style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Beck-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i, keyElements);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Beck-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1], keyElements));
  }
  
  // Add additional Beck-style paragraphs for authenticity
  const enhancedParagraphs = addBeckEnhancements(newParagraphs);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: KeyElements): string {
  // Create a completely new opening paragraph in Glenn Beck style
  const openingPhrases = [
    "I want you to imagine something. ",
    "Let me take you back in history for a moment. ",
    "There's something happening in America that should concern all of us. ",
    "Our Founding Fathers warned us about this. ",
    "I've been studying this for years, and what I've found will shock you. ",
    "Connect the dots with me for a moment. ",
    "The Constitution provides a clear answer to this issue. "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `What's happening with ${mainTopic} is exactly what the Founders feared. `,
      `The situation with ${mainTopic} has historical parallels that we need to understand. `,
      `${mainTopic} represents a critical moment for our constitutional republic. `,
      `The truth about ${mainTopic} is being hidden from the American people. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Beck style
    newOpening += rewordInBeckStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Beck-style statement
    const genericStatements = [
      "We're at a crossroads in American history, and the path we choose will determine the future of our republic. ",
      "The Constitution provides a framework for liberty that's being systematically dismantled. ",
      "History shows us that when a nation abandons its founding principles, decline is inevitable. ",
      "The warning signs are all around us, but we're not connecting the dots. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'critical')
    .replace(/problem|issue|concern/gi, 'crisis')
    .replace(/said|stated|mentioned/gi, 'warned');
}

function rewordInBeckStyle(text: string): string {
  // Reword text in Glenn Beck's distinctive style
  // Focus on constitutional principles, historical connections, and warnings
  
  // Replace neutral phrases with Beck-style phrases
  let rewordedText = text
    .replace(/people are concerned about/gi, 'Americans are waking up to the danger of')
    .replace(/some experts believe/gi, 'history teaches us')
    .replace(/it is possible that/gi, 'mark my words:')
    .replace(/there are indications that/gi, 'the warning signs show that')
    .replace(/according to some sources/gi, 'if you connect the dots');
  
  // Add Beck's signature phrases
  const beckPhrases = [
    "This is what the Founders warned us about. ",
    "The Constitution is clear on this issue. ",
    "History is repeating itself right before our eyes. ",
    "We need to return to first principles. "
  ];
  
  // Add a Beck phrase to longer text
  if (rewordedText.length > 100) {
    const beckPhrase = beckPhrases[Math.floor(Math.random() * beckPhrases.length)];
    rewordedText += beckPhrase;
  }
  
  return rewordedText;
}

function createNewParagraph(originalParagraph: string, index: number, keyElements: KeyElements): string {
  // Create a completely new paragraph based on the original content
  
  // Start with a Beck-style transition phrase
  const transitionPhrases = [
    "Now, let's connect the dots. ",
    "Here's what you need to understand. ",
    "The historical parallels are striking. ",
    "The Constitution is clear on this. ",
    "Let me show you something important. ",
    "This is where it gets interesting. ",
    "The Founders anticipated this very situation. "
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
  
  // Completely reword the main point in Beck style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInBeckStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Beck-style statement
    const genericStatements = [
      "The principles of the Constitution are being eroded by those who swore to uphold them. ",
      "History shows us that liberty is fragile and must be vigilantly defended. ",
      "We're witnessing the systematic dismantling of the republic our Founders established. ",
      "The warning signs are all around us, but too many Americans are distracted. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "What would the Founders say about this? ",
      "Have we forgotten the lessons of history? ",
      "Can you see the pattern emerging? ",
      "Where in the Constitution does it authorize this? ",
      "Are we connecting the dots yet? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add historical references if available
  if (keyElements.historicalReferences.length > 0 && index % 2 === 0) {
    const refIndex = index % keyElements.historicalReferences.length;
    const reference = keyElements.historicalReferences[refIndex];
    newParagraph += ` History provides context: ${rewordInBeckStyle(reference)} `;
  }
  
  // Add constitutional references occasionally
  if (index % 4 === 0) {
    const constitutionalPhrases = [
      " The Constitution specifically addresses this in Article I. ",
      " Our Founders created a system of checks and balances for exactly this reason. ",
      " The Bill of Rights exists to protect us from precisely this kind of overreach. ",
      " This is exactly the kind of tyranny that the Declaration of Independence condemned. ",
      " The Federalist Papers warned about this exact scenario. "
    ];
    
    const constitutionalPhrase = constitutionalPhrases[Math.floor(Math.random() * constitutionalPhrases.length)];
    newParagraph += constitutionalPhrase;
  }
  
  // Replace neutral language with more Beck-style assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'will')
    .replace(/some people think|some believe/gi, 'history shows us')
    .replace(/it is possible that/gi, 'mark my words:')
    .replace(/it seems that/gi, 'it\'s clear that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number): string {
  // Create an additional Beck-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'historical_parallel',
    'constitutional_principle',
    'warning_signs',
    'faith_values',
    'call_to_action'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'historical_parallel':
      return "History doesn't repeat itself, but it often rhymes. What we're seeing today has clear historical parallels. In the late 1700s, the Founders recognized the dangers of centralized power and created a constitutional republic with checks and balances. They studied the rise and fall of past republics and designed a system to prevent the very crisis we're facing now. If we ignore these historical lessons, we're doomed to repeat the failures of past civilizations that surrendered their liberty for the false promise of security.";
      
    case 'constitutional_principle':
      return "The Constitution isn't just a piece of parchment—it's the foundation of our republic. The Founders created a brilliant system of limited government, separation of powers, and individual rights. They understood that power corrupts, and they designed a framework to prevent tyranny. But today, we're witnessing a systematic effort to undermine these constitutional principles. Each branch of government is exceeding its constitutional authority, and the result is the erosion of our liberties. We must return to first principles and restore constitutional governance.";
      
    case 'warning_signs':
      return "There are warning signs all around us, but we need to connect the dots. When government grows beyond its constitutional limits, when debt spirals out of control, when rights are restricted in the name of security, when dependency replaces self-reliance—these are the warning signs of a republic in decline. History shows us that liberty is fragile and can be lost in a single generation. We're seeing the same patterns that preceded the fall of other great nations throughout history. The time to recognize these warning signs is now, before it's too late.";
      
    case 'faith_values':
      return "Faith and values have always been the bedrock of American society. The Founders understood that our rights come from God, not government, and that a moral people is essential for self-governance. As John Adams said, 'Our Constitution was made only for a moral and religious people. It is wholly inadequate to the government of any other.' The systematic removal of faith from the public square isn't just a religious issue—it's a threat to the very foundation of our republic. When we abandon the moral principles that guided our Founders, we undermine the entire American experiment.";
      
    case 'call_to_action':
      return "This isn't just about politics—it's about preserving the republic for our children and grandchildren. Each of us has a responsibility to understand our Constitution, know our history, and stand for the principles that made America exceptional. We need to educate ourselves and others, engage in the civic process, and hold our representatives accountable to their oath to uphold the Constitution. The power ultimately rests with We the People, and it's time for us to reclaim our rightful role as citizens of a constitutional republic. The future of liberty depends on what we do right now.";
      
    default:
      return "Let me be clear: I'm not asking you to take my word for it. Do your own research. Read the Founders' writings. Study the Constitution. Look at the historical patterns. Connect the dots yourself. The evidence is overwhelming that we're facing a critical moment in our nation's history. The choices we make now will determine whether we preserve the republic or lose it. As Benjamin Franklin said when asked what kind of government the Constitutional Convention had created: 'A republic, if you can keep it.' That responsibility now falls to us.";
  }
}

function createClosingParagraph(originalParagraph: string, keyElements: KeyElements): string {
  // Create a strong closing paragraph in Glenn Beck style
  
  // Start with a Beck-style closing phrase
  const closingPhrases = [
    "Let me leave you with this final thought. ",
    "The choice before us is clear. ",
    "History is calling us to action. ",
    "The Founders gave us a roadmap. ",
    "We stand at a crossroads. ",
    "The warning signs couldn't be clearer. ",
    "The Constitution provides the answer. "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Create a completely new closing paragraph
  let newClosing = closingPhrase;
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[keyElements.mainIdeas.length - 1];
    // Completely reword the main idea in Beck style
    newClosing += rewordInBeckStyle(mainIdea);
  }
  
  // Add a call to action
  const callsToAction = [
    " We must return to constitutional principles before it's too late. ",
    " The time to stand for liberty and the Constitution is now. ",
    " Each of us has a responsibility to preserve the republic for future generations. ",
    " We need to connect the dots and recognize the warning signs before us. ",
    " It's time to reclaim the vision of liberty that our Founders gave us. "
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  newClosing += callToAction;
  
  // Add a final Beck-style statement
  const finalStatements = [
    "The future of our republic hangs in the balance.",
    "May God continue to bless the United States of America.",
    "The Constitution is the solution.",
    "We must be the guardians of liberty in our time.",
    "History is watching what we do right now."
  ];
  
  const finalStatement = finalStatements[Math.floor(Math.random() * finalStatements.length)];
  newClosing += ` ${finalStatement}`;
  
  return newClosing;
}

function addBeckEnhancements(paragraphs: string[]): string[] {
  // Add Glenn Beck style enhancements to the paragraphs
  
  // Add a "HISTORY LESSON" section in the middle
  if (paragraphs.length > 3) {
    const historyIndex = Math.floor(paragraphs.length / 2);
    const historyLesson = "HISTORY LESSON: The Founders studied the rise and fall of republics throughout history. They knew that democracies often collapse into tyranny when the people vote themselves benefits from the public treasury. They designed our constitutional republic with checks and balances specifically to prevent the concentration of power. As Benjamin Franklin said, 'When the people find that they can vote themselves money, that will herald the end of the republic.' We're seeing this warning play out before our eyes.";
    
    paragraphs.splice(historyIndex, 0, historyLesson);
  }
  
  // Add a "CONSTITUTIONAL PERSPECTIVE" section
  if (paragraphs.length > 4) {
    const constitutionIndex = Math.floor(paragraphs.length * 0.75);
    const constitutionalPerspective = "CONSTITUTIONAL PERSPECTIVE: The Constitution isn't a living, breathing document that changes with the times—it's a contract between the government and the people with a specific amendment process. The Founders created a limited government with enumerated powers, meaning the federal government can only do what the Constitution specifically authorizes it to do. Everything else is reserved to the states or to the people, as the Tenth Amendment clearly states. When we ignore these constitutional boundaries, we undermine the rule of law and threaten the very foundation of our republic.";
    
    paragraphs.splice(constitutionIndex, 0, constitutionalPerspective);
  }
  
  // Enhance paragraphs with Beck's signature phrases and style
  return paragraphs.map((paragraph, index) => {
    // Add chalkboard references
    if (index % 3 === 0) {
      paragraph = paragraph.replace(/connection|link|relationship/gi, 'dot to connect');
    }
    
    // Add emphasis on the Constitution
    if (index % 4 === 1) {
      paragraph += " The Constitution is clear on this.";
    }
    
    // Add references to the Founders
    if (index % 5 === 2) {
      paragraph += " This is exactly what the Founders feared.";
    }
    
    return paragraph;
  });
}
