"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function reserveBook(bookId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).memberId) {
    return { success: false, error: "You must be logged in to reserve a book." };
  }

  const memberId = (session.user as any).memberId;

  try {
    const user = await prisma.user.findUnique({ where: { memberId } });
    if (!user) return { success: false, error: "User not found." };

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return { success: false, error: "Book not found." };

    if (book.status === "AVAILABLE") {
      return { success: false, error: "This book is currently available on the shelf. You can borrow it directly without reserving." };
    }

    // Check if user already has an active reservation for this book
    const existingRes = await prisma.reservation.findFirst({
      where: {
        userId: user.id,
        bookId: book.id,
        status: "PENDING"
      }
    });

    if (existingRes) {
      return { success: false, error: "You have already reserved this book." };
    }

    await prisma.reservation.create({
      data: {
        userId: user.id,
        bookId: book.id,
      }
    });

    revalidatePath("/opac");
    revalidatePath(`/opac/book/${bookId}`);
    revalidatePath("/profile");

    return { success: true, message: "Book reserved successfully. You will be notified when it becomes available." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addReview(bookId: string, rating: number, comment: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).memberId) {
    return { success: false, error: "You must be logged in to submit a review." };
  }

  const memberId = (session.user as any).memberId;

  try {
    const user = await prisma.user.findUnique({ where: { memberId } });
    if (!user) return { success: false, error: "User not found." };

    // Check if user already reviewed
    const existing = await prisma.review.findFirst({
      where: {
        userId: user.id,
        bookId: bookId
      }
    });

    if (existing) {
      // Update
      await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment }
      });
    } else {
      // Create
      await prisma.review.create({
        data: {
          userId: user.id,
          bookId: bookId,
          rating,
          comment
        }
      });
    }

    revalidatePath(`/opac/book/${bookId}`);
    return { success: true, message: "Review submitted successfully!" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
