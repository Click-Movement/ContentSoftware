// Tomi Lahren Style Content Rewriter
// Based on Tomi Lahren's distinctive writing and speaking style

import { RewrittenContent } from './limbaughStyleRewriter';

export function applyTomiLahrenStyle(title: string, content: string): RewrittenContent {
  // 1. Transform the title to be more attention-grabbing and provocative
  const transformedTitle = transformTitle(title);
  
  // 2. Extract key facts, quotes, and data points from the original content
  const keyElements = extractKeyElements(content);
  
  // 3. Apply the Tomi Lahren style transformation to the content
  const transformedContent = transformContent(content, keyElements);
  
  return {
    title: transformedTitle,
    content: transformedContent
  };
}

function transformTitle(title: string): string {
  // Make title more provocative in Tomi Lahren's style
  // Focus on direct, bold statements with patriotic themes
  
  // Check if title already has strong language
  const hasStrongLanguage = /outrage|scandal|disaster|crisis|shocking|breaking/i.test(title);
  
  // Create a completely rewritten title in Lahren style
  if (!hasStrongLanguage) {
    // Sample transformations with proper case
    if (title.toLowerCase().includes('liberal') || title.toLowerCase().includes('left') || title.toLowerCase().includes('democrat')) {
      const prefixes = [
        "Liberal Hypocrisy: ", 
        "The Left's Latest Failure: ", 
        "Snowflakes Meltdown Over ", 
        "Final Thoughts on "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else if (title.toLowerCase().includes('america') || title.toLowerCase().includes('patriot') || title.toLowerCase().includes('freedom')) {
      const prefixes = [
        "Standing for America: ", 
        "Patriots Defend ", 
        "Freedom Alert: ", 
        "Real Americans Know "
      ];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      return `${prefix}${capitalizeFirstLetter(title)}`;
    } else {
      // General transformation with proper case
      const emphasisPhrases = [
        "Final Thoughts: ", 
        "Let Me Tell You Something About ", 
        "The Truth About ",
        "No Safe Spaces: "
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
    patrioticThemes: []
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
  
  // Extract patriotic themes
  for (const sentence of sentences) {
    if (/america|freedom|liberty|constitution|patriot|flag|military|veteran|police|law enforcement/i.test(sentence)) {
      keyElements.patrioticThemes.push(sentence.trim());
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
  
  // Create a completely new set of paragraphs in Tomi Lahren style
  // This ensures originality while preserving key facts
  const newParagraphs: string[] = [];
  
  // Add a strong opening paragraph with direct audience address
  newParagraphs.push(createOpeningParagraph(paragraphs[0], keyElements));
  
  // Transform each original paragraph into a new Lahren-style paragraph
  // Skip the first and last paragraphs as we handle them separately
  for (let i = 1; i < paragraphs.length - 1; i++) {
    // Create a completely new paragraph based on the original content
    const newParagraph = createNewParagraph(paragraphs[i], i, keyElements);
    newParagraphs.push(newParagraph);
    
    // Every few paragraphs, add an additional Lahren-style paragraph
    // to increase originality and authenticity
    if (i % 2 === 0 && i < paragraphs.length - 2) {
      newParagraphs.push(createAdditionalParagraph(i, keyElements));
    }
  }
  
  // Add a strong closing paragraph
  if (paragraphs.length > 1) {
    newParagraphs.push(createClosingParagraph(paragraphs[paragraphs.length - 1], keyElements));
  }
  
  // Add additional Lahren-style paragraphs for authenticity
  const enhancedParagraphs = addLahrenEnhancements(newParagraphs, keyElements);
  
  // Join paragraphs with proper HTML paragraph tags for WordPress formatting
  // Use <p> tags instead of newlines to ensure proper spacing in WordPress
  return enhancedParagraphs.map(p => `<p>${p}</p>`).join('');
}

function createOpeningParagraph(originalParagraph: string, keyElements: any): string {
  // Create a completely new opening paragraph in Tomi Lahren style
  const openingPhrases = [
    "Let me give you my final thoughts on this. ",
    "I'm not going to sugarcoat this for you. ",
    "Here's the deal, folks. ",
    "Let's be clear about something. ",
    "I'm about to trigger some snowflakes with this one. ",
    "America, we need to talk about this. ",
    "I don't care who this offends, but "
  ];
  
  const openingPhrase = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  
  // Extract the main topic from the original paragraph
  const mainTopic = keyElements.topics.length > 0 ? keyElements.topics[0] : '';
  
  // Create a completely new paragraph that introduces the topic
  let newOpening = openingPhrase;
  
  // Add content about the main topic
  if (mainTopic) {
    const topicIntros = [
      `The left's approach to ${mainTopic} is exactly what's wrong with America today. `,
      `Real Americans are tired of the nonsense surrounding ${mainTopic}. `,
      `The liberal elite want to control the narrative on ${mainTopic}, but I'm not buying it. `,
      `It's time for some straight talk about ${mainTopic} that won't make it into your safe spaces. `
    ];
    
    newOpening += topicIntros[Math.floor(Math.random() * topicIntros.length)];
  }
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[0];
    // Completely reword the main idea in Lahren style
    newOpening += rewordInLahrenStyle(mainIdea);
  } else {
    // If no main ideas were extracted, create a generic Lahren-style statement
    const genericStatements = [
      "The left wants to silence conservative voices while claiming to champion free speech. ",
      "Liberal hypocrisy is on full display, and it's time someone called it out. ",
      "While the snowflakes are busy being offended, real Americans are working hard and loving their country. ",
      "The mainstream media won't tell you the truth, but I will, whether you like it or not. "
    ];
    
    newOpening += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Add emphasis to key points
  return newOpening
    .replace(/important|significant|crucial/gi, 'critical')
    .replace(/problem|issue|concern/gi, 'disaster')
    .replace(/said|stated|mentioned/gi, 'called out');
}

function rewordInLahrenStyle(text: string): string {
  // Reword text in Tomi Lahren's distinctive style
  // Focus on direct, bold statements with patriotic themes
  
  // Replace neutral phrases with Lahren-style phrases
  let rewordedText = text
    .replace(/people are concerned about/gi, 'real Americans are fed up with')
    .replace(/some experts believe/gi, 'despite what the liberal elite claim')
    .replace(/it is possible that/gi, "let\\'s be honest:")
    .replace(/there are indications that/gi, 'it\'s clear that')
    .replace(/according to some sources/gi, 'while the mainstream media won\'t admit it');
  
  // Add Lahren's signature phrases
  const lahrenPhrases = [
    " And that's not just my opinion, that's a fact. ",
    " Sorry, not sorry. ",
    " Let that sink in. ",
    " That's what real Americans believe. "
  ];
  
  // Add a Lahren phrase to longer text
  if (rewordedText.length > 100) {
    const lahrenPhrase = lahrenPhrases[Math.floor(Math.random() * lahrenPhrases.length)];
    rewordedText += lahrenPhrase;
  }
  
  return rewordedText;
}

function createNewParagraph(originalParagraph: string, index: number, keyElements: any): string {
  // Create a completely new paragraph based on the original content
  
  // Start with a Lahren-style transition phrase
  const transitionPhrases = [
    "Here's the thing. ",
    "Let me break it down for you. ",
    "This is where it gets real. ",
    "The left won't tell you this, but ",
    "While the snowflakes are triggered, ",
    "Let's talk about what really matters. ",
    "I don't care who this offends, but "
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
  
  // Completely reword the main point in Lahren style
  let newParagraph = transitionPhrase;
  
  if (mainPoint) {
    newParagraph += rewordInLahrenStyle(mainPoint);
  } else {
    // If no main point was extracted, create a generic Lahren-style statement
    const genericStatements = [
      "the left continues to push their agenda while ignoring the concerns of everyday Americans. ",
      "liberal elites sit in their ivory towers judging the rest of us for loving our country. ",
      "real Americans are tired of being lectured to by celebrities and politicians who don't share their values. ",
      "we need to stand up for our rights and freedoms before they're taken away. "
    ];
    
    newParagraph += genericStatements[Math.floor(Math.random() * genericStatements.length)];
  }
  
  // Every few paragraphs, add a rhetorical question
  if (index % 3 === 1) {
    const questions = [
      "When will the left admit they're wrong? ",
      "How much more of this liberal nonsense are we supposed to take? ",
      "Why are conservatives always expected to apologize while liberals get a free pass? ",
      "Does anyone still believe the mainstream media? ",
      "When did loving America become controversial? "
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    newParagraph = `${question}${newParagraph}`;
  }
  
  // Add patriotic references if available
  if (keyElements.patrioticThemes.length > 0 && index % 2 === 0) {
    const patrioticIndex = index % keyElements.patrioticThemes.length;
    const patrioticTheme = keyElements.patrioticThemes[patrioticIndex];
    newParagraph += ` As a proud American, I believe: ${rewordInLahrenStyle(patrioticTheme)} `;
  }
  
  // Add millennial references occasionally
  if (index % 4 === 0) {
    const millennialPhrases = [
      " As a millennial, I'm tired of my generation being stereotyped as snowflakes who need safe spaces. ",
      " Unlike many in my generation, I believe in hard work, personal responsibility, and love of country. ",
      " My generation needs to wake up and realize that freedom isn't free. ",
      " I may be a millennial, but I don't need trigger warnings or participation trophies. ",
      " Young conservatives like me are fighting back against the leftist indoctrination on college campuses. "
    ];
    
    const millennialPhrase = millennialPhrases[Math.floor(Math.random() * millennialPhrases.length)];
    newParagraph += millennialPhrase;
  }
  
  // Replace neutral language with more Lahren-style assertions
  newParagraph = newParagraph
    .replace(/may|might|could/gi, 'will')
    .replace(/some people think|some believe/gi, 'real Americans know')
    .replace(/it is possible that/gi, "let\\'s be honest:")
    .replace(/it seems that/gi, 'it\'s obvious that');
  
  return newParagraph;
}

function createAdditionalParagraph(index: number, keyElements: any): string {
  // Create an additional Lahren-style paragraph to increase originality
  
  // Different types of additional paragraphs
  const paragraphTypes = [
    'liberal_hypocrisy',
    'patriotic_values',
    'millennial_conservative',
    'media_bias',
    'political_correctness'
  ];
  
  const paragraphType = paragraphTypes[index % paragraphTypes.length];
  
  switch (paragraphType) {
    case 'liberal_hypocrisy':
      return "The hypocrisy of the left knows no bounds. They preach tolerance but can't tolerate conservative viewpoints. They champion free speech but try to silence anyone who disagrees with them. They claim to support women but attack conservative women with vile insults. They say they're against hate but spew hatred toward anyone who loves America. The double standards are astounding, but not surprising. This is who they are, and it's time we stop pretending otherwise. Their hypocrisy is on full display for all to see.";
      
    case 'patriotic_values':
      return "I'm not ashamed to love my country. I'm proud to stand for the flag and kneel for the fallen. I respect our military, law enforcement, and first responders who put their lives on the line every day to keep us safe. These aren't controversial statements—they're values that used to unite Americans. Now the left has made patriotism political. They've made loving America controversial. Well, I'm not apologizing for my patriotism. Real Americans still believe in these values, despite what the coastal elites might think.";
      
    case 'millennial_conservative':
      return "As a millennial conservative, I'm constantly told I'm on the 'wrong side of history.' But I know better. I don't need safe spaces or trigger warnings. I don't need the government to solve my problems or pay off my debts. I believe in hard work, personal responsibility, and American exceptionalism. My generation has been indoctrinated by leftist professors and a biased media, but many of us see through the lies. We're fighting back against the socialist agenda being pushed on young Americans, and we're not backing down.";
      
    case 'media_bias':
      return "The mainstream media isn't even trying to hide their bias anymore. They're not journalists—they're activists pushing a leftist agenda. They ignore stories that don't fit their narrative and amplify those that do. They give Democrats softball questions while attacking Republicans relentlessly. They claim to be objective while clearly taking sides. It's no wonder trust in media is at an all-time low. Americans are waking up to the propaganda machine, and that terrifies the media elites who have controlled the narrative for so long.";
      
    case 'political_correctness':
      return "Political correctness is killing this country. We're so afraid of offending someone that we can't even speak the truth anymore. Well, I'm not playing that game. I don't care if my words trigger you or hurt your feelings. Facts don't care about your feelings. The real world doesn't come with trigger warnings or safe spaces. The sooner we stop coddling people and start speaking honestly about the challenges we face, the sooner we can actually solve problems instead of just virtue signaling about them.";
      
    default:
      return "Here's my final thought: America is still the greatest country on Earth, despite what the left wants you to believe. We're not perfect, but we're exceptional. We offer more freedom, more opportunity, and more prosperity than any other nation. That's why people risk everything to come here. That's why our enemies fear us and our allies need us. So I'll never apologize for loving this country, and neither should you. If that offends the snowflakes, so be it. I'm not in the business of protecting feelings—I'm in the business of telling the truth.";
  }
}

function createClosingParagraph(originalParagraph: string, keyElements: any): string {
  // Create a strong closing paragraph in Tomi Lahren style
  
  // Start with a Lahren-style closing phrase
  const closingPhrases = [
    "Those are my final thoughts. ",
    "Let me leave you with this. ",
    "Here's the bottom line. ",
    "This is what real Americans believe. ",
    "I'll say what others are afraid to say. ",
    "Let me wrap this up with some straight talk. ",
    "I don't care who this triggers, but "
  ];
  
  const closingPhrase = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // Create a completely new closing paragraph
  let newClosing = closingPhrase;
  
  // Add a main idea from the original content, but completely reworded
  if (keyElements.mainIdeas.length > 0) {
    const mainIdea = keyElements.mainIdeas[keyElements.mainIdeas.length - 1];
    // Completely reword the main idea in Lahren style
    newClosing += rewordInLahrenStyle(mainIdea);
  }
  
  // Add a call to action
  const callsToAction = [
    " It's time for Americans to stand up and be counted. ",
    " We need to take our country back from the radical left. ",
    " Real Americans need to make their voices heard. ",
    " We can't let the liberal elite dictate our values. ",
    " Freedom isn't free, and it's time we fought to preserve it. "
  ];
  
  const callToAction = callsToAction[Math.floor(Math.random() * callsToAction.length)];
  newClosing += callToAction;
  
  // Add a final Lahren-style statement
  const finalStatements = [
    "That's just the way it is, and I'm not sorry about it.",
    "And if that offends you, I'm definitely not sorry.",
    "Those are my final thoughts, and that's the truth.",
    "I said what I said, and I mean every word.",
    "That's America first, and that's how it should be."
  ];
  
  const finalStatement = finalStatements[Math.floor(Math.random() * finalStatements.length)];
  newClosing += ` ${finalStatement}`;
  
  return newClosing;
}

function addLahrenEnhancements(paragraphs: string[], keyElements: any): string[] {
  // Add Tomi Lahren style enhancements to the paragraphs
  
  // Add a "FINAL THOUGHTS" section in the middle
  if (paragraphs.length > 3) {
    const finalThoughtsIndex = Math.floor(paragraphs.length / 2);
    const finalThoughts = "FINAL THOUGHTS: I'm tired of the left's constant attacks on our values, our freedoms, and our way of life. I'm tired of being told that loving America is somehow controversial. I'm tired of watching conservatives apologize for standing up for what they believe in. We need to stop playing defense and start going on offense. We need to stop letting the left control the narrative. We need to speak the truth unapologetically, even if it triggers the snowflakes. That's what I do every day, and that's what more Americans need to do if we want to save this country.";
    
    paragraphs.splice(finalThoughtsIndex, 0, finalThoughts);
  }
  
  // Add a "LIBERAL HYPOCRISY" section
  if (paragraphs.length > 4) {
    const hypocrisyIndex = Math.floor(paragraphs.length * 0.75);
    const hypocrisySection = "LIBERAL HYPOCRISY: The left preaches tolerance but can't tolerate conservative viewpoints. They champion free speech but try to silence anyone who disagrees with them. They claim to support women but attack conservative women with vile insults. They say they're against hate but spew hatred toward anyone who loves America. The double standards are astounding, but not surprising. This is who they are, and it's time we stop pretending otherwise. Their hypocrisy is on full display for all to see.";
    
    paragraphs.splice(hypocrisyIndex, 0, hypocrisySection);
  }
  
  // Enhance paragraphs with Lahren's signature phrases and style
  return paragraphs.map((paragraph, index) => {
    // Add "snowflake" references
    if (index % 3 === 0) {
      paragraph = paragraph.replace(/liberal|leftist|progressive/gi, 'snowflake');
    }
    
    // Add "sorry not sorry" phrases
    if (index % 4 === 1) {
      paragraph += " Sorry, not sorry.";
    }
    
    // Add "real Americans" references
    if (index % 5 === 2) {
      paragraph += " That's what real Americans believe.";
    }
    
    return paragraph;
  });
}
