const { fmAbayaToUnicode } = require('sinhala-unicode-coverter');

const samples = [
  'lsysß jkh iy ;j;a l;d',
  ',dcd foõÿj iy ;j;a l;d',
  'Wodr fhdaOhd iy .xÕdj',
  'uiqrka iy ;j;a l;d',
  'mqKaKd odish iy ;j;a l;d',
  'The Swiss family Robinson',
  'Gullivers Travels'
];

function isLegacySinhala(text) {
  if (!text) return false;
  // Common legacy symbols that rarely appear in normal English titles
  if (/[ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(text)) {
    return true;
  }
  
  // Many FM-Abhaya words start with . (e.g. .xÕdj) or use ; (e.g. ;j;a) or , (e.g. ,dcd)
  if (/[.;,][a-zA-Z]/.test(text)) {
    return true;
  }

  // Purely English check: if it contains only basic ASCII a-z A-Z 0-9 space and standard punctuation, 
  // AND doesn't have the weird combinations above, it MIGHT be English.
  // But 'lsysß' has 'ß' which is caught by the first regex. 'uiqrka' has no extended chars!
  // 'uiqrka iy ;j;a l;d' -> caught by ';j;a' (using semicolon).
  
  // Let's count words. If a word has no vowels (e.g. 'l;d'), it's not English.
  const words = text.split(/\s+/);
  let nonEnglishLookingWords = 0;
  for (let w of words) {
    // English words usually have at least one vowel (a,e,i,o,u,y)
    // In FM-Abhaya, 'l;d' has no english vowels (l, ;, d)
    // 'jkh' has no english vowels (j, k, h)
    // 'iy' has no english vowels (i, y -> wait i and y are vowels)
    if (!/[aeiouyAEIOUY]/.test(w.replace(/[^a-zA-Z]/g, '')) && w.replace(/[^a-zA-Z]/g, '').length > 0) {
      nonEnglishLookingWords++;
    }
  }
  
  if (nonEnglishLookingWords >= 1) return true;
  
  return false;
}

for (const s of samples) {
  const isSinhala = isLegacySinhala(s);
  console.log(`"${s}" -> isSinhala: ${isSinhala}`);
  if (isSinhala) {
    console.log(`   Converted: ${fmAbayaToUnicode(s)}`);
  }
}
