const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    where: {
      title: {
        contains: 'ගම්'
      }
    },
    take: 10
  });
  console.log("Books with 'ගම්':", books.map(b => b.title));
}
check().then(() => prisma.$disconnect());
