import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { accNos } = await request.json();

    if (!accNos || !Array.isArray(accNos)) {
      return NextResponse.json({ error: 'Invalid accession numbers array' }, { status: 400 });
    }

    const books = await prisma.book.findMany({
      where: {
        accNo: {
          in: accNos,
        },
      },
      select: {
        accNo: true,
        title: true,
        ddc: true,
        author: true,
        year: true,
        category: true,
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books by accNo:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
