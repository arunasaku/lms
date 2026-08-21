import EditBookForm from "./EditBookForm";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permCatalog = (session?.user as any)?.permCatalog;
  
  if (role === "MEMBER" || (role === "STAFF" && !permCatalog)) {
    redirect("/catalog");
  }

  const { id } = await params;
  
  const book = await prisma.book.findUnique({
    where: { id }
  });
  
  if (!book) {
    redirect("/catalog");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/catalog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Catalog
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Edit Book</h2>
          <p className="text-slate-500 text-sm mt-1">Update the details of the book.</p>
        </div>
      </div>
      
      <EditBookForm book={book} />
    </div>
  );
}
