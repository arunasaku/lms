const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    const password = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        memberId: 'admin',
        name: 'Admin User',
        role: 'ADMIN',
        password
      }
    });
    console.log('Created admin with password 123456');
  } else {
    const password = await bcrypt.hash('123456', 10);
    await prisma.user.update({
      where: { id: users[0].id },
      data: { password }
    });
    console.log(`Reset password for ${users[0].memberId} to 123456`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
