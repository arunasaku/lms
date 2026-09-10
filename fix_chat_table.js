const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking and creating AdminChatMessage table if missing...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AdminChatMessage" (
        "id" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "receiverId" TEXT,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP(3),
        "disappearAfterSeconds" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "AdminChatMessage_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'AdminChatMessage_senderId_fkey'
        ) THEN
          ALTER TABLE "AdminChatMessage" 
          ADD CONSTRAINT "AdminChatMessage_senderId_fkey" 
          FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'AdminChatMessage_receiverId_fkey'
        ) THEN
          ALTER TABLE "AdminChatMessage" 
          ADD CONSTRAINT "AdminChatMessage_receiverId_fkey" 
          FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("SUCCESS: AdminChatMessage table created or verified!");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
