import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function PopularBooksReportPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  // Find books ordered by the number of loans they have
  const books = await prisma.book.findMany({
    include: {
      _count: {
        select: { loans: true }
      }
    },
    orderBy: {
      loans: {
        _count: 'desc'
      }
    },
    take: 100 // Top 100
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reports" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition mb-6 shadow-sm border border-slate-200">
            &larr; Back to Reports
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Popular Books Report</h2>
          <p className="text-slate-500">Top 100 most borrowed books of all time.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Top Borrowed Books</h3>
        </div>
        
        <div className="overflow-x-auto">
          {books.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No borrowing history found yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600 w-16 text-center">Rank</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Accession No</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Title & Author</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 text-right">Total Borrows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book, index) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm font-bold text-slate-400 text-center">
                      #{index + 1}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-600">{book.accNo}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{book.title}</div>
                      <div className="text-xs text-slate-500">{book.author || "Unknown"}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                        book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="p-4 text-base font-bold text-indigo-600 text-right">
                      {book._count.loans}
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
