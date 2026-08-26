import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { memberIds } = await request.json();

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json({ error: 'Invalid member IDs array' }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: {
        memberId: {
          in: memberIds,
        },
      },
      select: {
        memberId: true,
        name: true,
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members by ID:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
