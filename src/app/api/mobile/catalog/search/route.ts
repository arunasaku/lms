import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;

    const whereCondition: any = query.trim()
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } },
            { accNo: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereCondition,
        select: {
          id: true,
          accNo: true,
          title: true,
          title2: true,
          author: true,
          author2: true,
          publisher: true,
          year: true,
          category: true,
          shelfLoc: true,
          status: true,
          itemType: true,
          isbn: true,
        },
        orderBy: { title: "asc" },
        skip,
        take: limit,
      }),
      prisma.book.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Mobile Catalog Search Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
