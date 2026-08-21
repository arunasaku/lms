function generateVariations(text) {
  if (!text) return [];
  
  // Pairs of ambiguous characters
  const pairs = [
    ['ල', 'ළ'],
    ['න', 'ණ'],
    ['ශ', 'ෂ'],
    ['ශ', 'ස'],
    ['ෂ', 'ස']
  ];
  
  let results = new Set([text]);
  
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

console.log(generateVariations("ගම්පෙරලිය"));
