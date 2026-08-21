const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Populating accNoInt field...");
  
  // We will do this in batches if there are many books
  const books = await prisma.book.findMany({
    select: { id: true, accNo: true }
  });
  
  console.log(`Found ${books.length} books. Updating...`);
  
  let updatedCount = 0;
  for (const book of books) {
    const accNoInt = parseInt(book.accNo, 10);
    if (!isNaN(accNoInt)) {
      await prisma.book.update({
        where: { id: book.id },
        data: { accNoInt }
      });
      updatedCount++;
      if (updatedCount % 1000 === 0) console.log(`Updated ${updatedCount}...`);
    }
  }
  
  console.log(`Done! Successfully updated ${updatedCount} books.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
