const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const books = await prisma.book.findMany({
    where: { title: { contains: '¥' } }
  });
  console.log('Count:', books.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
