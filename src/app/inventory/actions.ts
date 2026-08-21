"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getBookTitle(accNo: string) {
  if (!accNo) return null;
  const book = await prisma.book.findUnique({ where: { accNo }, select: { title: true, status: true } });
  return book ? { title: book.title, status: book.status } : null;
}

export async function verifyBook(formData: FormData) {
  const accNo = formData.get("accNo") as string;
  const status = formData.get("status") as string; // AVAILABLE, REPAIR, DISCARDED

  if (!accNo) {
    return { success: false, error: "Accession No is required." };
  }

  try {
    const book = await prisma.book.findUnique({ where: { accNo } });
    
    if (!book) {
      return { success: false, error: `Book with Accession No ${accNo} not found in database.` };
    }

    if (book.status === "BORROWED") {
      return { success: false, error: `Book ${accNo} is currently BORROWED by a member. Please use the 'Verify Borrowed Cards' tab.` };
    }

    await prisma.book.update({
      where: { id: book.id },
      data: {
        status: status || "AVAILABLE",
        lastVerified: new Date(),
      }
    });

    revalidatePath("/inventory");
    return { success: true, message: `Physical book verified: ${book.title}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyBorrowedBook(formData: FormData) {
  const accNo = formData.get("accNo") as string;

  if (!accNo) {
    return { success: false, error: "Accession No is required." };
  }

  try {
    const book = await prisma.book.findUnique({ where: { accNo } });
    
    if (!book) {
      return { success: false, error: `Book with Accession No ${accNo} not found in database.` };
    }

    if (book.status !== "BORROWED") {
      return { success: false, error: `Book ${accNo} is NOT borrowed (Status: ${book.status}). Please use the 'Physical Books' tab.` };
    }

    // Update lastVerified, but keep status as BORROWED
    await prisma.book.update({
      where: { id: book.id },
      data: {
        lastVerified: new Date(),
      }
    });

    revalidatePath("/inventory");
    return { success: true, message: `Borrowed book verified from card: ${book.title}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
