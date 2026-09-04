import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    return NextResponse.json({
      libraryName: config?.libraryName || 'Library',
      instituteName: config?.instituteName || ''
    });
  } catch (e) {
    return NextResponse.json({ libraryName: 'Library', instituteName: '' });
  }
}
