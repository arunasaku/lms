import { transliterate } from '@felix-tech/singlish-js'

export function generateVariations(text: string) {
  if (!text) return [];
  const pairs = [
    ['ල', 'ළ'],
    ['න', 'ණ'],
    ['ශ', 'ෂ'],
    ['ශ', 'ස'],
    ['ෂ', 'ස'],
    ['ට', 'ඨ'],
    ['ත', 'ට'], // For t mapping to both
    ['ද', 'ඩ'], // For d mapping to both
    ['ධ', 'ඪ'], // For dh mapping to both
    ['උ', 'ඌ'], // For u/oo
    ['ඉ', 'ඊ'], // For i/ee
    ['අ', 'ආ'], // For a/aa
  ];
  
  let results = new Set<string>([text]);
  
  for (const [char1, char2] of pairs) {
    const currentResults = Array.from(results);
    for (const res of currentResults) {
      if (res.includes(char1)) {
        results.add(res.replace(new RegExp(char1, 'g'), char2));
      }
      if (res.includes(char2)) {
        results.add(res.replace(new RegExp(char2, 'g'), char1));
      }
    }
  }
  
  return Array.from(results);
}

export function generateEnglishVariations(text: string) {
  if (!text) return [];
  // Basic Sinhala to English mapping for search purposes
  const map: Record<string, string[]> = {
    'අ': ['a'], 'ආ': ['aa', 'a'], 'ඇ': ['ae', 'a'], 'ඈ': ['aae', 'ae'], 
    'ඉ': ['i'], 'ඊ': ['ii', 'i', 'ee'], 'උ': ['u'], 'ඌ': ['uu', 'u', 'oo'], 
    'එ': ['e'], 'ඒ': ['ee', 'e'], 'ඔ': ['o'], 'ඕ': ['oo', 'o'],
    
    'ක': ['k', 'ka'], 'ඛ': ['k', 'ka'], 'ග': ['g', 'ga'], 'ඝ': ['g', 'ga'],
    'ච': ['ch', 'cha'], 'ඡ': ['ch', 'cha'], 'ජ': ['j', 'ja'], 
    'ට': ['t', 'ta'], 'ඨ': ['t', 'ta'], 'ඩ': ['d', 'da'], 'ඪ': ['d', 'da'], 'ණ': ['n', 'na'],
    'ත': ['th', 't', 'tha', 'ta'], 'ථ': ['th', 't', 'tha', 'ta'], 'ද': ['dh', 'd', 'dha', 'da'], 'ධ': ['dh', 'd', 'dha', 'da'], 'න': ['n', 'na'],
    'ප': ['p', 'pa'], 'ඵ': ['p', 'pa'], 'බ': ['b', 'ba'], 'භ': ['b', 'bh', 'ba'], 'ම': ['m', 'ma'],
    'ය': ['y', 'ya'], 'ර': ['r', 'ra'], 'ල': ['l', 'la'], 'ව': ['w', 'v', 'wa', 'va'], 
    'ශ': ['sh', 'sha'], 'ෂ': ['sh', 'sha'], 'ස': ['s', 'sa'], 'හ': ['h', 'ha'], 'ළ': ['l', 'la'],
    'ෆ': ['f', 'fa'],

    'ා': ['a', 'aa'], 'ැ': ['ae', 'a'], 'ෑ': ['aae', 'ae'], 'ි': ['i'], 'ී': ['ii', 'i', 'ee'],
    'ු': ['u'], 'ූ': ['uu', 'u', 'oo'], 'ෘ': ['ru'], 'ෙ': ['e'], 'ේ': ['ee', 'e'],
    'ෛ': ['ai'], 'ො': ['o'], 'ෝ': ['oo', 'o'], 'ෞ': ['au'], '්': [''],
    'ං': ['n', 'ng'], 'ඃ': ['h']
  };

  let results = new Set<string>([text]);

  // A simple pass: if the text contains Sinhala characters, generate a transliterated version.
  // This is a naive character-by-character replacement. For better results, we just do a direct mapping.
  // Since "මඩොල්" has "ම", "ඩ", "ො", "ල", "්", replacing them directly might give "mdaol" which is wrong.
  // Actually, standard transliteration is complex. Let's do a simpler approach:
  // Instead of full text mapping, we'll map common Sinhala words/syllables if needed, 
  // or we can rely on a simpler regex replacement for the entire string.
  
  let engVersion = '';
  let engVersion2 = ''; // Alternative (e.g. w vs v, th vs t)
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = i < text.length - 1 ? text[i+1] : '';
    const isNextVowelModifier = ['ා', 'ැ', 'ෑ', 'ි', 'ී', 'ු', 'ූ', 'ෘ', 'ෙ', 'ේ', 'ෛ', 'ො', 'ෝ', 'ෞ', '්'].includes(nextChar);
    
    let base = map[char] ? map[char][0] : char;
    let base2 = map[char] ? (map[char].length > 1 ? map[char][1] : map[char][0]) : char;
    
    // If it's a consonant and doesn't have a modifier, it inherently has 'a'
    // But since `map` gives e.g. 'k', we append 'a' unless the next char is a modifier
    const isConsonant = Object.keys(map).includes(char) && !['අ','ආ','ඇ','ඈ','ඉ','ඊ','උ','ඌ','එ','ඒ','ඔ','ඕ','ා','ැ','ෑ','ි','ී','ු','ූ','ෘ','ෙ','ේ','ෛ','ො','ෝ','ෞ','්','ං','ඃ'].includes(char);
    
    if (isConsonant) {
      if (!isNextVowelModifier) {
        engVersion += base + 'a';
        engVersion2 += base2 + 'a';
      } else {
        engVersion += base;
        engVersion2 += base2;
      }
    } else {
      engVersion += base;
      engVersion2 += base2;
    }
  }

  if (engVersion !== text) results.add(engVersion);
  if (engVersion2 !== text) results.add(engVersion2);
  if (engVersion) results.add(engVersion.replace(/\s+/g, ''));
  if (engVersion2) results.add(engVersion2.replace(/\s+/g, ''));

  return Array.from(results);
}

export function buildSearchConditions(query: string, searchFields: string[]) {
  if (!query) return {};

  const sinhalaQuery = transliterate(query);
  
  // Create versions with and without spaces
  const queryNoSpace = query.replace(/\s+/g, '');
  const sinhalaNoSpace = sinhalaQuery.replace(/\s+/g, '');
  
  const sinhalaVariations = [
    ...generateVariations(sinhalaQuery),
    ...generateVariations(sinhalaNoSpace)
  ];
  
  const queryVariations = [
    ...generateVariations(query),
    ...generateVariations(queryNoSpace)
  ];

  const reverseEngVariations = [
    ...generateEnglishVariations(query),
    ...generateEnglishVariations(queryNoSpace)
  ];

  // Merge all unique search strings
  const allSearchTerms = Array.from(new Set([
    query,
    queryNoSpace,
    ...sinhalaVariations,
    ...queryVariations,
    ...reverseEngVariations
  ])).filter(t => t.length > 0);

  const orConditions: any[] = [];
  
  for (const term of allSearchTerms) {
    for (const field of searchFields) {
      orConditions.push({ [field]: { contains: term } });
    }
  }

  return { OR: orConditions };
}
