const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (user.email === "") {
      console.log(`Fixing user ${user.memberId}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { email: null }
      });
    }
  }
  console.log("Done");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
