const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

function isReallySinhala(text) {
  if (!text) return false;
  
  // 1. Has extended ASCII (128-255). Very high confidence it is Sinhala FM Abhaya.
  // We check for specific characters common in FM Abhaya
  if (/[ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(text)) {
    return true;
  }
  
  // 2. Contains specific punctuation used as letters in FM Abhaya:
  // ; (ත), , (ල), . (ග)
  // BUT we must be careful. In English, ; and , and . are followed by spaces.
  // In FM Abhaya, they are part of words. So if they are followed immediately by a letter:
  if (/[.;,][a-zA-Z]/.test(text)) {
    return true;
  }
  
  // 3. Very long words with no vowels. e.g., 'uiqrka', 'l;d'
  // If a word has > 3 letters and no English vowels, it's highly likely FM Abhaya.
  const words = text.split(/\s+/);
  for (let w of words) {
    const lettersOnly = w.replace(/[^a-zA-Z]/g, '');
    if (lettersOnly.length > 2 && !/[aeiouyAEIOUY]/.test(lettersOnly)) {
      return true;
    }
  }
  
  return false;
}

async function fixDB() {
  console.log("Reading Excel...");
  const workbook = XLSX.readFile("E:\\\\Pen drive\\\\LMS\\\\Accession Ledger.xlsx");
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const dataRows = rows.slice(1);
  let fixedCount = 0;
  
  console.log("Scanning for falsely converted books...");
  
  for (const row of dataRows) {
    if (!row[1]) continue;
    const accNo = String(row[1]);
    const origTitle = row[2] ? String(row[2]) : "Untitled";
    const origAuthor = row[3] ? String(row[3]) : null;
    const origPublisher = row[4] ? String(row[4]) : null;
    
    // If the original text doesn't meet the strict Sinhala criteria, it should NOT have been converted.
    const titleShouldBeOriginal = !isReallySinhala(origTitle);
    const authorShouldBeOriginal = origAuthor ? !isReallySinhala(origAuthor) : false;
    const publisherShouldBeOriginal = origPublisher ? !isReallySinhala(origPublisher) : false;
    
    if (titleShouldBeOriginal || authorShouldBeOriginal || publisherShouldBeOriginal) {
      // Fetch the book from DB
      const book = await prisma.book.findUnique({ where: { accNo } });
      if (!book) continue;
      
      let needsUpdate = false;
      const data = {};
      
      if (titleShouldBeOriginal && book.title !== origTitle) {
        data.title = origTitle;
        needsUpdate = true;
      }
      if (authorShouldBeOriginal && book.author !== origAuthor) {
        data.author = origAuthor;
        needsUpdate = true;
      }
      if (publisherShouldBeOriginal && book.publisher !== origPublisher) {
        data.publisher = origPublisher;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await prisma.book.update({
          where: { id: book.id },
          data
        });
        fixedCount++;
      }
    }
  }
  
  console.log(`Fixed ${fixedCount} records that were falsely converted to Sinhala.`);
}

fixDB()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
