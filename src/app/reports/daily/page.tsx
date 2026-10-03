import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReportControls from "./ReportControls";

export default async function DailyReportPage({ searchParams }: { searchParams: Promise<{ date?: string }> | { date?: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  // Handle Next.js 15 async searchParams
  const params = await searchParams;
  const dateParam = params?.date || new Date().toISOString().split('T')[0];
  
  const targetDate = new Date(dateParam);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [issuedBooks, returnedBooks, config] = await Promise.all([
    prisma.loan.findMany({
      where: { borrowDate: { gte: startOfDay, lte: endOfDay } },
      include: { book: true, user: true },
      orderBy: { borrowDate: 'desc' }
    }),
    prisma.loan.findMany({
      where: { returnDate: { gte: startOfDay, lte: endOfDay } },
      include: { book: true, user: true },
      orderBy: { returnDate: 'desc' }
    }),
    prisma.systemConfig.findUnique({ where: { id: 1 } })
  ]);

  const totalFineCollected = returnedBooks
    .filter(l => l.finePaid && l.finePaidDate && l.finePaidDate >= startOfDay && l.finePaidDate <= endOfDay)
    .reduce((sum, loan) => sum + loan.fine, 0);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 p-4">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Daily Transaction Report</h2>
          <p className="text-slate-500 mt-1">Detailed summary of library activities.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
            Back to Dashboard
          </Link>
          <ReportControls defaultDate={dateParam} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{config?.instituteName || 'Institute Name'}</h1>
          <h2 className="text-xl text-slate-700">{config?.libraryName || 'Library System'}</h2>
          <h3 className="text-lg font-medium text-slate-600 mt-4 border-b pb-2 inline-block">Daily Transactions Report : {formatDate(targetDate)}</h3>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10 text-center">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 print:border-slate-300">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total Issued</p>
            <p className="text-3xl font-bold text-slate-800">{issuedBooks.length}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 print:border-slate-300">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total Returned</p>
            <p className="text-3xl font-bold text-slate-800">{returnedBooks.length}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 print:border-slate-300">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Fines Collected</p>
            <p className="text-3xl font-bold text-slate-800">Rs. {totalFineCollected.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-10">
          <h4 className="text-lg font-bold text-slate-800 mb-4 bg-slate-100 p-2 rounded print:bg-transparent print:border-b print:p-0">Books Issued ({issuedBooks.length})</h4>
          {issuedBooks.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-700">
                  <th className="p-2 font-semibold">Time</th>
                  <th className="p-2 font-semibold">Accession No</th>
                  <th className="p-2 font-semibold">Book Title</th>
                  <th className="p-2 font-semibold">Member</th>
                  <th className="p-2 font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {issuedBooks.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="p-2 text-slate-600">{formatTime(loan.borrowDate)}</td>
                    <td className="p-2 font-mono">{loan.book.accNo}</td>
                    <td className="p-2 text-slate-800 font-medium">{loan.book.title}</td>
                    <td className="p-2 text-slate-700">{loan.user.name} <span className="text-xs text-slate-400">({loan.user.memberId})</span></td>
                    <td className="p-2 text-slate-600">{formatDate(loan.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic p-2">No books issued on this date.</p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-4 bg-slate-100 p-2 rounded print:bg-transparent print:border-b print:p-0">Books Returned ({returnedBooks.length})</h4>
          {returnedBooks.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-700">
                  <th className="p-2 font-semibold">Time</th>
                  <th className="p-2 font-semibold">Accession No</th>
                  <th className="p-2 font-semibold">Book Title</th>
                  <th className="p-2 font-semibold">Member</th>
                  <th className="p-2 font-semibold text-right">Fine Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {returnedBooks.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="p-2 text-slate-600">{loan.returnDate ? formatTime(loan.returnDate) : '-'}</td>
                    <td className="p-2 font-mono">{loan.book.accNo}</td>
                    <td className="p-2 text-slate-800 font-medium">{loan.book.title}</td>
                    <td className="p-2 text-slate-700">{loan.user.name} <span className="text-xs text-slate-400">({loan.user.memberId})</span></td>
                    <td className="p-2 text-right text-slate-700">
                      {loan.fine > 0 ? (
                        <span className={loan.finePaid ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                          Rs. {loan.fine.toFixed(2)} {loan.finePaid ? "(Paid)" : "(Unpaid)"}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 italic p-2">No books returned on this date.</p>
          )}
        </div>
        
        <div className="mt-16 text-center text-sm text-slate-400 print:block">
          Report generated on {new Date().toLocaleString('en-GB')}
        </div>
      </div>
    </div>
  );
}
