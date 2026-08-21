const { PrismaClient } = require('@prisma/client');
const { fmAbayaToUnicode } = require('sinhala-unicode-coverter');

const prisma = new PrismaClient();

function isLegacySinhala(text) {
  if (!text) return false;
  if (/[ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(text)) {
    return true;
  }
  if (/[.;,][a-zA-Z]/.test(text)) {
    return true;
  }
  const words = text.split(/\s+/);
  let nonEnglishLookingWords = 0;
  for (let w of words) {
    if (!/[aeiouyAEIOUY]/.test(w.replace(/[^a-zA-Z]/g, '')) && w.replace(/[^a-zA-Z]/g, '').length > 0) {
      nonEnglishLookingWords++;
    }
  }
  if (nonEnglishLookingWords >= 1) return true;
  return false;
}

async function main() {
  console.log("Starting Sinhala Unicode Migration...");
  
  // Read all books in chunks to avoid memory issues
  let skip = 0;
  const limit = 1000;
  let updatedCount = 0;
  
  while (true) {
    const books = await prisma.book.findMany({
      skip,
      take: limit
    });
    
    if (books.length === 0) break;
    
    for (const book of books) {
      let changed = false;
      let newTitle = book.title;
      let newAuthor = book.author;
      let newPublisher = book.publisher;
      
      if (isLegacySinhala(newTitle)) {
        newTitle = fmAbayaToUnicode(newTitle);
        changed = true;
      }
      if (book.author && isLegacySinhala(newAuthor)) {
        newAuthor = fmAbayaToUnicode(newAuthor);
        changed = true;
      }
      if (book.publisher && isLegacySinhala(newPublisher)) {
        newPublisher = fmAbayaToUnicode(newPublisher);
        changed = true;
      }
      
      if (changed) {
        await prisma.book.update({
          where: { id: book.id },
          data: {
            title: newTitle,
            author: newAuthor,
            publisher: newPublisher
          }
        });
        updatedCount++;
      }
    }
    
    skip += limit;
    console.log(`Processed ${skip} records...`);
  }
  
  console.log(`Migration complete! Converted ${updatedCount} books to Sinhala Unicode.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
