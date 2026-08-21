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

    const book = await prisma.book.findUnique({ where: { accNo } });
    if (!book) return { success: false, error: "Book not found." };

    if (book.status !== "AVAILABLE") {
      return { success: false, error: `Book is currently ${book.status}.` };
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

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
    
    // Calculate Fine (e.g. Rs. 5 per day)
    if (returnDate > activeLoan.dueDate) {
      const diffTime = Math.abs(returnDate.getTime() - activeLoan.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * 5; 
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
