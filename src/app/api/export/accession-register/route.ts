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
    
    if (role !== "ADMIN" && role !== "LIBRARIAN" && !permCatalog) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const books = await prisma.book.findMany({
      orderBy: { accNoInt: 'asc' }
    });

    // Generate CSV content
    const headers = [
      "Accession No", 
      "Date Added", 
      "Title", 
      "Author", 
      "Publisher", 
      "Year", 
      "Vendor", 
      "Price", 
      "Bill No", 
      "ISBN", 
      "DDC", 
      "Item Type", 
      "Category", 
      "Shelf Location", 
      "Status"
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return "";
      const s = String(str);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    let csvContent = headers.join(",") + "\n";

    for (const book of books) {
      const row = [
        book.accNo,
        book.dateAdded,
        book.title,
        book.author,
        book.publisher,
        book.year,
        book.vendor,
        book.price,
        book.billNo,
        book.isbn,
        book.ddc,
        book.itemType,
        book.category,
        book.shelfLoc,
        book.status
      ];
      csvContent += row.map(escapeCsv).join(",") + "\n";
    }

    // Add UTF-8 BOM so Excel opens it with proper encoding for Sinhala characters
    const bom = "\uFEFF";
    
    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="accession_register.csv"',
      }
    });

  } catch (error) {
    console.error("Error exporting accession register:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}