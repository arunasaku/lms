const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with default users...");

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { memberId: 'admin' },
    update: {},
    create: {
      memberId: 'admin',
      name: 'System Admin',
      role: 'ADMIN',
      password: adminPassword,
    },
  });
  console.log("Admin user created/verified:", admin.memberId);

  const memberPassword = await bcrypt.hash('member123', 10);
  const member = await prisma.user.upsert({
    where: { memberId: 'M001' },
    update: {},
    create: {
      memberId: 'M001',
      name: 'Test Member',
      role: 'MEMBER',
      password: memberPassword,
    },
  });
  console.log("Test member created/verified:", member.memberId);
  
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
