// Charlie Kirk Style Content Rewriter
// Based on Charlie Kirk's distinctive writing and speaking style

import { RewrittenContent } from './limbaughStyleRewriter';

export function applyCharlieKirkStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Charlie Kirk style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative in Charlie Kirk's style
  // Focus on campus/youth issues, America First themes, and direct challenges
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Kirk style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case
    if (title.toLowerCase().includes('campus') || title.toLowerCase().includes('university') || title.toLowerCase().includes('college')) {
      const prefixes = [
        "Campus Indoctrination: ", 
        "The Left's War on Students: ", 
        "Academic Freedom Crisis: ", 
        "Campus Thought Police: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('america') || title.toLowerCase().includes('patriot')) {
      const prefixes = [
        "America First: ", 
        "Defending Our Nation: ", 
        "Patriots Must Know: ", 
        "The Fight for America: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "FACT: ", 
        "The Truth About ", 
        "Why Americans Should Care: ",
        "The Left Doesn't Want You To See "
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

function transformContent(content: string, keyElements: any): string {
  // Break content into paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  // Create a completely new set of paragraphs in Charlie Kirk style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Kirk-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i, keyElements);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Kirk-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i, keyElements));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1], keyElements));
  }
  
  // Add additional Kirk-style paragraphs for authenticity
  const enhancedParagraphs = addKirkEnhancements(newParagraphs, keyElements);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: any): string {
  // Create a completely new opening paragraph in Charlie Kirk style
  const openingPhrases = [
    "Let me be clear about something. ",
    "Here's what you need to understand. ",
    "This is absolutely critical. ",
    "The radical left doesn't want you to know this. ",
    "I'm going to tell you something that the mainstream media won't. ",
    "Young Americans need to understand this. ",
    "This is a perfect example of what we're fighting against. "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `What's happening with ${mainTopic} is exactly what we've been warning about at Turning Point USA. `,
      `The left's agenda on ${mainTopic} is destroying our country's future. `,
      `${mainTopic} is ground zero for the battle between American values and radical leftism. `,
      `Young Americans are being lied to about ${mainTopic} every single day. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Kirk style
    newOpening += rewordInKirkStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Kirk-style statement
    const genericStatements = [
      "We're seeing a fundamental attack on our constitutional rights and American values. ",
      "The radical left is pushing an agenda that undermines everything that made America great. ",
      "This is exactly why we need to stand up and fight for our country's founding principles. ",
      "The mainstream media won't tell you the truth, but the facts are clear. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'critical')
    .replace(/problem|issue|concern/gi, 'crisis')
    .replace(/said|stated|mentioned/gi, 'admitted');
}

function rewordInKirkStyle(text: string): string {
  // Reword text in Charlie Kirk's distinctive style
  // Focus on campus issues, America First themes, and direct challenges
  
  // Replace neutral phrases with Kirk-style phrases
  let rewordedText = text
    .replace(/people are concerned about/gi, 'patriots are fighting against')
    .replace(/some experts believe/gi, 'the facts clearly show')
    .replace(/it is possible that/gi, 'make no mistake,')
    .replace(/there are indications that/gi, 'we have proof that')
    .replace(/according to some sources/gi, 'despite what the mainstream media tells you');
  
  // Add Kirk's signature phrases
  const kirkPhrases = [
    "This is exactly what we talk about at Turning Point USA. ",
    "The radical left can't hide from these facts. ",
    "This is why we need to defend our constitutional rights. ",
    "Young Americans deserve to know the truth. "
  ];
  
  // Add a Kirk phrase to longer text
  if (rewordedText.length > 100) {
    const kirkPhrase = kirkPhrases[Math.floor(Math.random() * kirkPhrases.length)];
    rewordedText += kirkPhrase;
  }
  
  return rewordedText;
}

function createNewParagraph(originalParagraph: string, index: number, keyElements: any): string {
  // Create a completely new paragraph based on the original content
  
  // Start with a Kirk-style transition phrase
  const transitionPhrases = [
    "Here's what's really happening. ",
    "Let me break this down for you. ",
    "The facts are undeniable. ",
    "This is where it gets interesting. ",
    "The mainstream media won't tell you this. ",
    "Let's look at what's really going on. ",
    "This is the part they don't want you to see. "
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
  
  // Completely reword the main point in Kirk style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInKirkStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Kirk-style statement
    const genericStatements = [
      "The radical left continues to push policies that undermine American values. ",
      "We're seeing a systematic attempt to silence conservative voices. ",
      "This is exactly why we need to stand up for our constitutional rights. ",
      "Young Americans are being indoctrinated with leftist propaganda every day. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "Why aren't more people talking about this? ",
      "Isn't it interesting how the left always avoids these facts? ",
      "How can anyone still believe the mainstream narrative? ",
      "When will Americans wake up to what's really happening? ",
      "Doesn't this prove exactly what we've been saying? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add statistical references if available
  if (keyElements.statistics.length > 0 && index % 2 === 0) {
    const statIndex = index % keyElements.statistics.length;
    const statistic = keyElements.statistics[statIndex];
    newParagraph += ` The data is clear: ${statistic} tells you everything you need to know about this situation. `;
  }
  
  // Add America First themes occasionally
  if (index % 4 === 0) {
    const americaFirstPhrases = [
      " This is why America First policies are so important. ",
      " We need to put American citizens and American values first. ",
      " This is a direct threat to our constitutional republic. ",
      " The founding fathers would be appalled by what's happening today. ",
      " We must return to the principles that made America great. "
    ];
    
    const americaFirstPhrase = americaFirstPhrases[Math.floor(Math.random() * americaFirstPhrases.length)];
    newParagraph += americaFirstPhrase;
  }
  
  // Replace neutral language with more passionate assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'will')
    .replace(/some people think|some believe/gi, 'the facts show')
    .replace(/it is possible that/gi, 'make no mistake,')
    .replace(/it seems that/gi, 'it\'s clear that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number, keyElements: any): string {
  // Create an additional Kirk-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'campus_focus',
    'constitutional_rights',
    'media_criticism',
    'america_first',
    'call_to_action'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'campus_focus':
      return "What's happening on college campuses is a microcosm of the larger cultural battle in America. Young Americans are being indoctrinated with radical leftist ideology that teaches them to hate their own country. At Turning Point USA, we're fighting back by empowering students with the truth about American exceptionalism and the dangers of socialism. The future of our nation depends on winning this battle for the hearts and minds of the next generation.";
      
    case 'constitutional_rights':
      return "Our constitutional rights are under attack like never before. The First Amendment, Second Amendment, religious liberty - all of these fundamental freedoms are being systematically undermined by the radical left. They want to silence conservative voices, disarm law-abiding citizens, and remove God from the public square. We must stand firm in defense of the Constitution and the principles that made America the greatest nation in human history.";
      
    case 'media_criticism':
      return "The mainstream media has become nothing more than a propaganda arm for the radical left. They suppress stories that don't fit their narrative and amplify false information that advances their agenda. This is why alternative media and social platforms are so important - they allow the truth to bypass the corrupt legacy media gatekeepers. Americans are waking up to this manipulation, which is why trust in mainstream media is at an all-time low.";
      
    case 'america_first':
      return "America First isn't just a slogan - it's a commitment to putting the interests of American citizens above globalist agendas. For too long, our leaders have sacrificed American jobs, American security, and American sovereignty on the altar of globalism. We need policies that prioritize American workers, protect American borders, and preserve American values. This isn't isolationism - it's common sense patriotism that recognizes the unique role America plays in the world.";
      
    case 'call_to_action':
      return "This isn't just about politics - it's about the future of our country and the freedoms we cherish. Each of us has a responsibility to get involved, speak the truth, and stand up for what's right. Join the movement of patriots who are fighting to preserve the American dream for future generations. Share these facts with your friends and family, support organizations that defend constitutional principles, and never be intimidated into silence. The time for action is now.";
      
    default:
      return "The facts I've shared with you today are just the tip of the iceberg. There's a coordinated effort to fundamentally transform America away from its founding principles of limited government, individual liberty, and free markets. But the good news is that millions of Americans are waking up and pushing back against this radical agenda. By standing together and speaking the truth boldly, we can preserve the American experiment for generations to come.";
  }
}

function createClosingParagraph(originalParagraph: string, keyElements: any): string {
  // Create a strong closing paragraph in Charlie Kirk style
  
  // Start with a Kirk-style closing phrase
  const closingPhrases = [
    "Let me leave you with this final thought. ",
    "Here's the bottom line. ",
    "This is what it all comes down to. ",
    "The choice before us is clear. ",
    "The facts speak for themselves. ",
    "This is why our work is so important. ",
    "The future of our country depends on this. "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Create a completely new closing paragraph
  let newClosing = closingPhrase;
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[keyElements.mainIdeas.length - 1];
    // Completely reword the main idea in Kirk style
    newClosing += rewordInKirkStyle(mainIdea);
  }
  
  // Add a call to action
  const callsToAction = [
    " We must stand up for American values and constitutional principles before it's too late. ",
    " The time for bold action and courageous truth-telling is now. ",
    " Young Americans must reclaim their campuses and their country from radical leftism. ",
    " Patriots across this great nation need to unite and fight for the America we love. ",
    " This is why we need to support leaders who put America First and defend our freedoms. "
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  newClosing += callToAction;
  
  // Add a final Kirk-style statement
  const finalStatements = [
    "The future of our constitutional republic is at stake.",
    "America is worth fighting for.",
    "We will not surrender our country to the radical left.",
    "The American dream depends on our courage today.",
    "This is the defining battle of our generation."
  ];
  
  const finalStatement = finalStatements[Math.floor(Math.random() * finalStatements.length)];
  newClosing += ` ${finalStatement}`;
  
  return newClosing;
}

function addKirkEnhancements(paragraphs: string[], keyElements: any): string[] {
  // Add Charlie Kirk style enhancements to the paragraphs
  
  // Add a "FACT CHECK" section in the middle
  if (paragraphs.length > 3 && keyElements.facts.length > 0) {
    const factIndex = Math.floor(paragraphs.length / 2);
    const factStatement = keyElements.facts[0];
    const factCheck = `FACT CHECK: Despite what the left claims, the truth is clear. ${rewordInKirkStyle(factStatement)} This is exactly why we need to question the mainstream narrative and look at the actual evidence.`;
    
    paragraphs.splice(factIndex, 0, factCheck);
  }
  
  // Add a "CAMPUS SPOTLIGHT" section if relevant topics are present
  const campusRelated = keyElements.topics.some((topic: string) => 
    ['campus', 'university', 'college', 'student', 'education', 'academic'].includes(topic.toLowerCase())
  );
  
  if (campusRelated && paragraphs.length > 4) {
    const campusIndex = Math.floor(paragraphs.length * 0.75);
    const campusSpotlight = "CAMPUS SPOTLIGHT: What's happening on college campuses is a microcosm of the larger cultural battle. Young Americans are being indoctrinated with radical leftist ideology that teaches them to hate their own country and embrace socialism. At Turning Point USA, we're fighting back by empowering students with the truth about American exceptionalism and free market principles. The future of our nation depends on winning this battle for the hearts and minds of the next generation.";
    
    paragraphs.splice(campusIndex, 0, campusSpotlight);
  }
  
  // Enhance paragraphs with Kirk's signature phrases and style
  return paragraphs.map((paragraph, index) => {
    // Add "Big Government" references
    if (index % 3 === 0) {
      paragraph = paragraph.replace(/government|administration|officials/gi, match => `Big ${match}`);
    }
    
    // Add emphasis on freedom and liberty
    if (index % 4 === 1) {
      paragraph += " This is fundamentally about our freedom and liberty.";
    }
    
    // Add references to the Constitution
    if (index % 5 === 2) {
      paragraph += " The Constitution is clear on this issue.";
    }
    
    return paragraph;
  });
}
