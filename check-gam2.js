const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    where: {
      title: {
        contains: 'ගම්පෙර'
      }
    }
  });
  console.log("Books with 'ගම්පෙර':", books.map(b => b.title));
}
check().then(() => prisma.$disconnect());
