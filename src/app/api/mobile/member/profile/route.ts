import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const memberId = searchParams.get("memberId");

    if (!userId && !memberId) {
      return NextResponse.json(
        { error: "userId or memberId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (userId) whereClause.id = userId;
    if (memberId) whereClause.memberId = { equals: memberId, mode: "insensitive" };

    const user = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        memberId: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        mobileNo: true,
        memberType: true,
        salutation: true,
        address: true,
        registeredDate: true,
        renewedDate: true,
        loans: {
          where: { status: "ACTIVE" },
          include: {
            book: {
              select: {
                id: true,
                accNo: true,
                title: true,
                author: true,
                category: true,
                itemType: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
        },
        reservations: {
          where: { status: "PENDING" },
          include: {
            book: {
              select: {
                id: true,
                accNo: true,
                title: true,
                author: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total active fine balance
    const activeLoans = user.loans.map((loan) => {
      const now = new Date();
      const dueDate = new Date(loan.dueDate);
      let calculatedFine = loan.fine;
      
      if (now > dueDate) {
        const diffDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
        calculatedFine = Math.max(loan.fine, diffDays * 5.0); // Rs. 5 per day fallback rate
      }

      return {
        ...loan,
        currentFine: calculatedFine,
        isOverdue: now > dueDate,
      };
    });

    const totalFine = activeLoans.reduce((sum, item) => sum + item.currentFine, 0);

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        memberId: user.memberId,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone || user.mobileNo,
        memberType: user.memberType,
        salutation: user.salutation,
        address: user.address,
        registeredDate: user.registeredDate,
        activeLoansCount: activeLoans.length,
        totalFineBalance: totalFine,
        activeLoans,
        pendingReservations: user.reservations,
      },
    });
  } catch (error: any) {
    console.error("Mobile Profile Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
