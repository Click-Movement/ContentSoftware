// Rush Limbaugh Style Content Rewriter
// Based on the Rush Limbaugh writing style guide and rewriting system

export interface RewrittenContent {
  title: string;
  content: string;
}


interface KeyElements {
  facts: string[];
  quotes: string[];
  statistics: string[];
  people: string[];
  topics: string[];
  mainIdeas: string[];
}

export function applyLimbaughStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative (but not all caps)
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Rush Limbaugh style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative but avoid all caps
  // Add emotional intensity and framing
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Limbaugh style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case (not all caps)
    if (title.toLowerCase().includes('biden') || title.toLowerCase().includes('democrat')) {
      const prefixes = [
        "The Real Truth About ", 
        "What They Won't Tell You: ", 
        "Biden's Latest Disaster: ", 
        "Liberal Agenda Exposed: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // Create a completely new title rather than just modifying the original
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('trump') || title.toLowerCase().includes('republican')) {
      const prefixes = [
        "Vindicated: ", 
        "The Truth Emerges: ", 
        "What the Media Hides: ", 
        "Conservative Victory: "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // Create a completely new title rather than just modifying the original
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "The Shocking Truth About ", 
        "What Americans Need to Know: ", 
        "The Story They Don't Want You to Hear: ",
        "Exposing the Real Agenda Behind "
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
  
  // Create a completely new set of paragraphs in Limbaugh style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Limbaugh-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Limbaugh-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1]));
  }
  
  // Add additional Limbaugh-style paragraphs for authenticity
  const enhancedParagraphs = addLimbaughEnhancements(newParagraphs, keyElements);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: KeyElements): string {
  // Create a completely new opening paragraph in Limbaugh style
  const openingPhrases = [
    "Folks, let me tell you something. ",
    "My friends, you're not going to believe this. ",
    "I want you to pay close attention to what I'm about to tell you. ",
    "Now, I've been warning about this for years. ",
    "Let me be crystal clear about what's really happening here. ",
    "Rush Limbaugh here, and today we're talking about something important. ",
    "Ladies and gentlemen, what I'm about to tell you is going to shock you. "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `This whole situation with ${mainTopic} is exactly what we've been predicting on this program. `,
      `The mainstream media won't tell you the truth about ${mainTopic}. But I will. `,
      `What's happening with ${mainTopic} is a perfect example of what's wrong in America today. `,
      `The liberals think you're too stupid to understand what's really going on with ${mainTopic}. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Limbaugh style
    newOpening += rewordInLimbaughStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Limbaugh-style statement
    const genericStatements = [
      "The left wants you to believe their narrative, but the facts tell a completely different story. ",
      "What we're seeing here is a perfect example of how the elite try to manipulate public opinion. ",
      "This is exactly the kind of story the drive-by media either ignores or completely distorts. ",
      "Once again, we're witnessing the consequences of policies that undermine American values. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'CRITICAL')
    .replace(/problem|issue|concern/gi, 'DISASTER')
    .replace(/said|stated|mentioned/gi, 'ADMITTED');
}

function createNewParagraph(originalParagraph: string, index: number): string {
  // Create a completely new paragraph based on the original content
  
  // Start with a Limbaugh-style transition phrase
  const transitionPhrases = [
    "Now, here's the thing. ",
    "But it gets even better. ",
    "And let me tell you something else. ",
    "Here's what they don't want you to know. ",
    "The real story is much deeper. ",
    "Let's be perfectly clear about this. ",
    "I want to make sure you understand this next point. "
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
  
  // Completely reword the main point in Limbaugh style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInLimbaughStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Limbaugh-style statement
    const genericStatements = [
      "This is exactly what happens when you let the left control the narrative. ",
      "We've seen this pattern over and over again from the liberal establishment. ",
      "The American people deserve better than these failed policies and empty promises. ",
      "This is what happens when ideology trumps common sense and traditional values. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "Now, why would they do this? I'll tell you why. ",
      "You know what this really means, don't you? ",
      "Can you believe what they're trying to pull here? ",
      "Does anyone actually buy this nonsense? ",
      "How many times have we seen this exact same playbook? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add emotional intensity markers
  const emotionalMarkers = [
    " - and I mean EVERY word of this - ",
    " - and this is the part they don't want you to hear - ",
    " - now pay attention to this part - ",
    " - and this is absolutely CRITICAL - ",
    " - and I've been saying this for YEARS - "
  ];
  
  // Insert emotional marker in the middle of longer paragraphs
  if (newParagraph.length > 100) {
    const middleIndex = Math.floor(newParagraph.length / 2);
    const sentenceBreak = newParagraph.indexOf('. ', middleIndex);
    if (sentenceBreak !== -1) {
      const marker = emotionalMarkers[Math.floor(Math.random() * emotionalMarkers.length)];
      newParagraph = newParagraph.substring(0, sentenceBreak + 1) + marker + newParagraph.substring(sentenceBreak + 1);
    }
  }
  
  // Add mockery or humor for certain topics
  if (/democrat|liberal|left|progressive/i.test(newParagraph)) {
    newParagraph = newParagraph.replace(/democrat(s|ic)?/gi, match => `the so-called "${match}"`);
    newParagraph = newParagraph.replace(/liberal(s)?/gi, 'lib$1');
  }
  
  // Add patriotic references occasionally
  if (index % 4 === 0) {
    const patrioticPhrases = [
      " This is not what our Founding Fathers intended. ",
      " This is an assault on our constitutional rights. ",
      " This is what happens when we forget what makes America exceptional. ",
      " This is a direct attack on the values that built this great nation. ",
      " This is exactly why we need to fight to preserve our American way of life. "
    ];
    
    const patrioticPhrase = patrioticPhrases[Math.floor(Math.random() * patrioticPhrases.length)];
    newParagraph += patrioticPhrase;
  }
  
  // Replace neutral language with more passionate assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'WILL')
    .replace(/some people think|some believe/gi, 'We all know')
    .replace(/it is possible that/gi, 'Make no mistake,')
    .replace(/it seems that/gi, 'It\'s crystal clear that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number): string {
  // Create an additional Limbaugh-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'media_criticism',
    'historical_perspective',
    'personal_anecdote',
    'audience_connection',
    'prediction'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'media_criticism':
      return "The drive-by media won't tell you any of this, folks. They're too busy pushing their narrative and protecting their liberal friends. CNN, MSNBC, the New York Times - they're all part of the same corrupt establishment that's trying to fundamentally transform America. They don't report the news anymore; they manufacture it to fit their agenda.";
      
    case 'historical_perspective':
      return "You know, I've been doing this program for decades, and I've seen this pattern over and over again. The left uses the same playbook every time. They create a crisis, blame conservatives, propose a government solution that gives them more power, and then use that power to restrict your freedoms. It's as predictable as the sunrise.";
      
    case 'personal_anecdote':
      return "I was talking to a friend of mine the other day - a real American success story, built his business from nothing - and he told me he's never seen anything like what's happening today. He said, 'Rush, they're making it impossible for people like me to succeed anymore.' And he's right. The deck is being stacked against the producers, the job creators, the backbone of this country.";
      
    case 'audience_connection':
      return "I know many of you listening right now are nodding your heads. You see what's happening in your communities, in your businesses, in your children's schools. You're living with the consequences of these failed policies every single day. And you're smart enough to know that what you're being told by the elite doesn't match reality. You're not alone, my friends.";
      
    case 'prediction':
      return "Mark my words, this is just the beginning. If we don't stand up and fight back, things are going to get a lot worse before they get better. The left won't stop until they've transformed this country into something our founders wouldn't recognize. But I believe in the American spirit. I believe that when pushed too far, the silent majority will finally say 'enough is enough.'";
      
    default:
      return "Let me tell you something, folks. This whole situation is a perfect example of what we've been talking about on this program for years. It's not about the specific policies or personalities - it's about a fundamental difference in vision for America. One side believes in liberty, personal responsibility, and limited government. The other side believes in control, dependency, and the nanny state.";
  }
}

function createClosingParagraph(originalParagraph: string): string {
  // Create a completely new closing paragraph in Limbaugh style
  
  const closingPhrases = [
    "And that, my friends, is exactly what we've been saying all along. ",
    "Make no mistake about it - this is just the beginning. ",
    "The bottom line is this: ",
    "Remember, you heard it here first. ",
    "And that's the way it is - no matter what the drive-by media tells you. "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Extract key information from the original paragraph
  const sentences = originalParagraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let mainPoint = '';
  
  if (sentences.length > 0) {
    // Take a key sentence from the original paragraph
    const sentenceIndex = Math.min(Math.floor(Math.random() * sentences.length), sentences.length - 1);
    mainPoint = sentences[sentenceIndex].trim();
  }
  
  // Completely reword the main point in Limbaugh style
  let newClosing = closingPhrase;
  
  if (mainPoint) {
    newClosing += rewordInLimbaughStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Limbaugh-style statement
    const genericStatements = [
      "We're witnessing a pivotal moment in American history, and the stakes couldn't be higher. ",
      "The battle for America's future is happening right now, and we can't afford to sit on the sidelines. ",
      "The truth is finally coming to light, despite all efforts to keep it hidden from the American people. ",
      "The contrast between conservative principles and liberal failures has never been more obvious. "
    ];
    
    newClosing += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add a strong call to action
  const callsToAction = [
    " And that's why this matters to every American who cares about this great nation.",
    " This is why we need to stay vigilant and informed, my friends.",
    " Remember this the next time you head to the voting booth.",
    " Don't let them get away with it. America is counting on you.",
    " The fight for America's soul continues, and we're just getting started."
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  
  return newClosing + callToAction;
}

function addLimbaughEnhancements(paragraphs: string[], keyElements: KeyElements): string[] {
  const enhancedParagraphs = [...paragraphs];
  
  // Add a paragraph with rhetorical questions after the first few paragraphs
  if (enhancedParagraphs.length > 2) {
    const rhetoricalParagraph = "Now, ask yourself this: Why aren't we hearing about this from the drive-by media? Why is the mainstream press ignoring what's right in front of their faces? It's because it doesn't fit their narrative, folks. It's because they're more interested in pushing their agenda than reporting the truth.";
    enhancedParagraphs.splice(2, 0, rhetoricalParagraph);
  }
  
  // Add a paragraph with mockery if we have identified people
  if (keyElements.people.length > 0) {
    const person = keyElements.people[0];
    const mockeryParagraph = `And let's talk about ${person} for a moment. Do you really think ${person} cares about you? About your family? About your future? Please! ${person} is just another politician who says whatever it takes to get elected, then does whatever the special interests want. I've seen this movie before, folks, and I know exactly how it ends.`;
    
    // Insert mockery paragraph in the middle
    const middleIndex = Math.floor(enhancedParagraphs.length / 2);
    enhancedParagraphs.splice(middleIndex, 0, mockeryParagraph);
  }
  
  // Add a paragraph with statistics if we have them
  if (keyElements.statistics.length > 0) {
    const stat = keyElements.statistics[0];
    const statParagraph = `Let me hit you with some numbers that the mainstream media won't tell you. ${stat}. That's right, ${stat}! And they expect us to just nod our heads and go along with their program. Well, I'm sorry, but that's not how it works in America. We don't just roll over when someone tries to pull the wool over our eyes.`;
    
    // Insert statistics paragraph near the end
    enhancedParagraphs.splice(enhancedParagraphs.length - 1, 0, statParagraph);
  }
  
  // Add a "ditto" paragraph near the end
  const dittoParagraph = "I know what you're thinking. You're sitting there nodding your head saying, 'Rush is right again.' Well, ditto, my friends. Ditto.";
  enhancedParagraphs.splice(enhancedParagraphs.length - 1, 0, dittoParagraph);
  
  return enhancedParagraphs;
}

function rewordInLimbaughStyle(text: string): string {
  // Completely reword the text in Rush Limbaugh's style
  // This is a key function for avoiding plagiarism
  
  // Extract the main subject and action from the text
  // const words = text.split(' ');
  const mainSubject = extractMainSubject(text);
  const mainAction = extractMainAction(text);
  
  // Create a completely new sentence about the same subject and action
  if (mainSubject && mainAction) {
    const subjectPhrases = [
      `Let me tell you about ${mainSubject}. They`,
      `The truth about ${mainSubject} is that they`,
      `Here's what you need to understand about ${mainSubject}. They`,
      `${capitalizeFirstLetter(mainSubject)}`
    ];
    
    const actionPhrases = [
      `are absolutely ${mainAction}`,
      `have been ${mainAction} for years`,
      `continue to ${mainAction} despite all evidence`,
      `won't stop ${mainAction} until they get what they want`
    ];
    
    const subjectPhrase = subjectPhrases[Math.floor(Math.random() * subjectPhrases.length)];
    const actionPhrase = actionPhrases[Math.floor(Math.random() * actionPhrases.length)];
    
    return `${subjectPhrase} ${actionPhrase}. `;
  }
  
  // If we couldn't extract a clear subject and action, use a template
  const templates = [
    "This is exactly what we've been warning about on this program. ",
    "The American people deserve to know the truth about this. ",
    "This is a perfect example of what's wrong with Washington today. ",
    "You won't hear this perspective from the mainstream media. ",
    "Let me break this down in a way that makes sense. "
  ];
  
  return templates[Math.floor(Math.random() * templates.length)] + 
         "What's really happening here is a fundamental clash of values and visions for America. ";
}

function extractMainSubject(text: string): string {
  // Simple extraction of potential subject
  const subjects = [
    'the Democrats', 'the Republicans', 'the liberals', 'the left', 'the media',
    'the government', 'the bureaucrats', 'the elites', 'the establishment',
    'these politicians', 'the American people', 'the taxpayers', 'the voters'
  ];
  
  // Check if any of these subjects appear in the text
  for (const subject of subjects) {
    if (text.toLowerCase().includes(subject.toLowerCase())) {
      return subject;
    }
  }
  
  // Extract potential subject based on position in sentence
  const words = text.split(' ');
  if (words.length > 2) {
    // Often the subject is at the beginning of the sentence
    return words.slice(0, 2).join(' ');
  }
  
  return 'the people involved';
}

function extractMainAction(text: string): string {
  // Simple extraction of potential action
  const actions = [
    'trying to deceive', 'pushing their agenda', 'manipulating the facts',
    'ignoring the truth', 'attacking our values', 'undermining our freedoms',
    'spending our money', 'expanding government', 'raising taxes',
    'destroying jobs', 'implementing regulations', 'changing the rules'
  ];
  
  // Check if any of these actions appear in the text
  for (const action of actions) {
    if (text.toLowerCase().includes(action.toLowerCase())) {
      return action;
    }
  }
  
  // Default actions if none found
  const defaultActions = [
    'not telling you the whole story',
    'hiding the real agenda',
    'misleading the American people',
    'trying to fundamentally transform America'
  ];
  
  return defaultActions[Math.floor(Math.random() * defaultActions.length)];
}
