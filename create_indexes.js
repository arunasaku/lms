const { PrismaClient } = require('@prisma/client');

const dbs = [
  { name: 'Pilapitiya (LMS-Hen)', url: 'postgresql://postgres.rjuolghatjdmitqejlxj:bookangel1971%40gmail.com@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' },
  { name: 'Galahitiyawa', url: 'postgresql://postgres.jnbbgcmstemiaqoqlbhc:lms-galahitiyawa123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' },
  { name: 'Amunugoda', url: 'postgresql://postgres.ndixhnzpzncivihwyutb:Amunugoda123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }
];

async function run() {
  for (const db of dbs) {
    console.log(`\n--- Adding index on Book(accNoInt) for ${db.name} ---`);
    const client = new PrismaClient({ datasources: { db: { url: db.url } } });
    try {
      await client.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Book_accNoInt_idx" ON "Book"("accNoInt");
      `);
      console.log(`Index successfully ensured on ${db.name}`);
    } catch (err) {
      console.error(`Error creating index on ${db.name}:`, err.message);
    } finally {
      await client.$disconnect();
    }
  }
}

run();
