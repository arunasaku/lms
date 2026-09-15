import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Delete test loans
    const delLoans = await prisma.loan.deleteMany({
      where: {
        OR: [
          { user: { memberId: "M005" } },
          { user: { name: { contains: "Test", mode: "insensitive" } } },
          { finePaid: true }
        ]
      }
    });

    // Delete test users (M005)
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { memberId: "M005" },
          { name: { contains: "Test", mode: "insensitive" } }
        ]
      }
    });

    for (const u of testUsers) {
      await prisma.loan.deleteMany({ where: { userId: u.id } });
      await prisma.reservation.deleteMany({ where: { userId: u.id } });
      await prisma.review.deleteMany({ where: { userId: u.id } });
      await prisma.adminChatMessage.deleteMany({
        where: { OR: [{ senderId: u.id }, { receiverId: u.id }] }
      });
      await prisma.user.delete({ where: { id: u.id } });
    }

    // Revalidate Next.js page caches
    revalidatePath("/");
    revalidatePath("/circulation");
    revalidatePath("/circulation/reports");
    revalidatePath("/circulation/fines");
    revalidatePath("/reports");
    revalidatePath("/tools");

    return NextResponse.json({
      success: true,
      message: "Test data deleted successfully and caches revalidated!",
      deletedLoansCount: delLoans.count
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
