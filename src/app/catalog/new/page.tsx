import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewBookForm from "./NewBookForm";

export default async function NewBookPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role === "MEMBER") {
    redirect("/catalog");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/catalog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Catalog
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Add New Book</h2>
          <p className="text-slate-500 text-sm mt-1">Enter the details of the new book to add it to the catalog.</p>
        </div>
      </div>
      
      <NewBookForm />
    </div>
  );
}
