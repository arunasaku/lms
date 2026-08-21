const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`User: ${user.memberId}, Email: '${user.email}'`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
