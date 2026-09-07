const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Pilapitiya (LMS-Hen)', url: 'postgresql://postgres.rjuolghatjdmitqejlxj:bookangel1971%40gmail.com@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' },
  { name: 'Galahitiyawa', url: 'postgresql://postgres.jnbbgcmstemiaqoqlbhc:lms-galahitiyawa123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' },
  { name: 'Amunugoda', url: 'postgresql://postgres.ndixhnzpzncivihwyutb:Amunugoda123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }
];

async function run() {
  for (const db of dbs) {
    console.log(`\n--- Processing ${db.name} ---`);
    const client = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      const updated = await client.$executeRawUnsafe(`
        UPDATE "Book" 
        SET "accNoInt" = CAST(REGEXP_REPLACE("accNo", '[^0-9]', '', 'g') AS INTEGER) 
        WHERE "accNo" ~ '[0-9]' AND "accNoInt" IS NULL;
      `);
      console.log(`Updated accNoInt rows: ${updated}`);
      
      const total = await client.book.count();
      const nullCount = await client.book.count({ where: { accNoInt: null } });
      console.log(`Total books: ${total}, Books with null accNoInt: ${nullCount}`);
    } catch (err) {
      console.error(`Error on ${db.name}:`, err.message);
    } finally {
      await client.$disconnect();
    }
  }
}

run();
