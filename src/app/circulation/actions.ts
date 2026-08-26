"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getMemberName(memberId: string) {
  if (!memberId) return null;
  const user = await prisma.user.findUnique({ where: { memberId }, select: { name: true } });
  return user ? user.name : null;
}

export async function getBookTitle(accNo: string) {
  if (!accNo) return null;
  const book = await prisma.book.findUnique({ where: { accNo }, select: { title: true } });
  return book ? book.title : null;
}

export async function issueBook(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const accNo = formData.get("accNo") as string;

  if (!memberId || !accNo) {
    return { success: false, error: "Member ID and Accession No are required." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { memberId } });
    if (!user) return { success: false, error: "Member not found." };

    // Check 1: Prevent borrowing if there are unpaid fines
    const unpaidFinesCount = await prisma.loan.count({
      where: {
        userId: user.id,
        fine: { gt: 0 },
        finePaid: false
      }
    });
    if (unpaidFinesCount > 0) {
      return { success: false, error: "සාමාජිකයාට ගෙවීමට ඇති දඩ මුදල් (Unpaid fines) පවතී. දඩ මුදල් ගෙවා අවසන් වනතුරු පොත් ලබාගත නොහැක." };
    }

    // Check 2: Max 2 books per member
    const activeLoansCount = await prisma.loan.count({
      where: {
        userId: user.id,
        status: "ACTIVE"
      }
    });
    if (activeLoansCount >= 2) {
      return { success: false, error: "සාමාජිකයා දැනටමත් පොත් 2ක් ලබාගෙන ඇත. උපරිම ලබාගත හැක්කේ පොත් 2ක් පමණි." };
    }

    const book = await prisma.book.findUnique({ where: { accNo } });
    if (!book) return { success: false, error: "Book not found." };

    if (book.status !== "AVAILABLE") {
      return { success: false, error: `Book is currently ${book.status}.` };
    }

    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    const borrowDays = config?.borrowPeriodDays || 14;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    // Transaction to update book and create loan
    await prisma.$transaction([
      prisma.loan.create({
        data: {
          bookId: book.id,
          userId: user.id,
          dueDate,
        }
      }),
      prisma.book.update({
        where: { id: book.id },
        data: { status: "BORROWED" }
      })
    ]);

    revalidatePath("/circulation");
    return { success: true, message: `Book '${book.title}' successfully issued to ${user.name}. Due Date: ${dueDate.toLocaleDateString()}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function returnBook(formData: FormData) {
  const accNo = formData.get("accNo") as string;

  if (!accNo) {
    return { success: false, error: "Accession No is required." };
  }

  try {
    const book = await prisma.book.findUnique({ where: { accNo } });
    if (!book) return { success: false, error: "Book not found." };

    const activeLoan = await prisma.loan.findFirst({
      where: {
        bookId: book.id,
        status: "ACTIVE"
      }
    });

    if (!activeLoan) {
      return { success: false, error: "No active loan found for this book." };
    }

    const returnDate = new Date();
    let fine = 0;
    
    // Calculate Fine using adjustable rate
    if (returnDate > activeLoan.dueDate) {
      let dailyFineRate = 5.0;
      try {
        let config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
        if (!config) {
          config = await prisma.systemConfig.create({ data: { id: 1, dailyFineRate: 5.0 } });
        }
        dailyFineRate = config.dailyFineRate;
      } catch (e) {
        // Fallback
      }

      const diffTime = Math.abs(returnDate.getTime() - activeLoan.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * dailyFineRate; 
    }

    await prisma.$transaction([
      prisma.loan.update({
        where: { id: activeLoan.id },
        data: {
          status: "RETURNED",
          returnDate,
          fine
        }
      }),
      prisma.book.update({
        where: { id: book.id },
        data: { status: "AVAILABLE" }
      })
    ]);

    revalidatePath("/circulation");
    return { 
      success: true, 
      message: `Book returned successfully. ${fine > 0 ? `Late Fine: Rs. ${fine}` : 'No fine.'}` 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markFineAsPaid(loanId: string) {
  try {
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        finePaid: true,
        finePaidDate: new Date()
      }
    });
    revalidatePath("/circulation/fines");
    revalidatePath("/circulation/reports");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDailyFineRate(rate: number) {
  try {
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { dailyFineRate: rate },
      create: { id: 1, dailyFineRate: rate }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnpaidFines() {
  const loans = await prisma.loan.findMany({
    where: {
      fine: { gt: 0 },
      finePaid: false,
    },
    include: {
      book: { select: { title: true, accNo: true } },
      user: { select: { name: true, memberId: true } }
    },
    orderBy: { returnDate: 'desc' }
  });
  return loans;
}

export async function getFineReports(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  // Add 1 day to endDate to make it inclusive
  endDate.setDate(endDate.getDate() + 1);

  const loans = await prisma.loan.findMany({
    where: {
      fine: { gt: 0 },
      finePaid: true,
      finePaidDate: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      book: { select: { title: true, accNo: true } },
      user: { select: { name: true, memberId: true } }
    },
    orderBy: { finePaidDate: 'desc' }
  });
  return loans;
}
