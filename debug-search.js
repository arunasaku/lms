const { PrismaClient } = require('@prisma/client');
const { transliterate } = require('@felix-tech/singlish-js');

const prisma = new PrismaClient({ log: ['query'] });

async function check() {
  const query = "gam peraliya";
  const sinhalaQuery = transliterate(query);
  const sinhalaNoSpace = sinhalaQuery.replace(/\\s+/g, '');
  
  const words = query.split(/\\s+/).filter(w => w.length > 0);
  const sinhalaWords = words.map(w => transliterate(w));
  
  console.log("query:", query);
  console.log("sinhalaQuery:", sinhalaQuery);
  console.log("sinhalaNoSpace:", sinhalaNoSpace);
  console.log("sinhalaWords:", sinhalaWords);

  const orConditions = [
    { title: { contains: query } },
    { title: { contains: sinhalaQuery } },
    { title: { contains: sinhalaNoSpace } },
  ];
  
  for (const sw of sinhalaWords) {
    if (sw.length > 2) {
       orConditions.push({ title: { contains: sw } })
    }
  }

  const books = await prisma.book.findMany({
    where: { OR: orConditions }
  });
  
  console.log(`Found ${books.length} books`);
  console.log(books.map(b => b.title));
}
check().then(() => prisma.$disconnect());
