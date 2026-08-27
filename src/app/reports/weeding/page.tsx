import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function WeedingReportPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  // Find books that have never been borrowed (0 loans)
  const books = await prisma.book.findMany({
    where: {
      loans: {
        none: {}
      }
    },
    orderBy: { accNoInt: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reports" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition mb-6 shadow-sm border border-slate-200">
            &larr; Back to Reports
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Weeding Report</h2>
          <p className="text-slate-500">Books that have never been borrowed.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Unborrowed Books ({books.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          {books.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Great news! Every book in the library has been borrowed at least once.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">Accession No</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Title & Author</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Added Date</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm font-mono text-slate-600">{book.accNo}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{book.title}</div>
                      <div className="text-xs text-slate-500">{book.author || "Unknown"}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {book.dateAdded || "N/A"}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                        book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <Link href={`/catalog/edit/${book.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Review Book
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
