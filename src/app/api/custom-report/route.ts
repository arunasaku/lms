import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const permCatalog = (session?.user as any)?.permCatalog;
    
    // Hide from normal members
    if (role !== "ADMIN" && role !== "LIBRARIAN" && !permCatalog) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const books = await prisma.book.findMany({
      orderBy: { accNoInt: 'asc' }
    });

    return NextResponse.json(books);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
