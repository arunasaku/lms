import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardCharts from "@/components/DashboardCharts";

const prisma = new PrismaClient()

export default async function Home() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const [totalBooks, totalMembers, activeLoans, recentLoans, allLoans, overdueLoans, config] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.loan.count({ where: { status: 'ACTIVE' } }),
    prisma.loan.findMany({
      take: 5,
      orderBy: { borrowDate: 'desc' },
      include: {
        book: true,
        user: true,
      }
    }),
    prisma.loan.findMany({
      include: {
        user: true,
        book: true
      }
    }),
    prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lte: tomorrow }
      },
      orderBy: { dueDate: 'asc' },
      include: {
        book: true,
        user: true,
      }
    }),
    prisma.systemConfig.findUnique({ where: { id: 1 } })
  ]);
  
  const waTemplate = config?.whatsappTemplate || "Hi {name}, your borrowed book '{title}' is overdue (Due: {due_date}). Please return it as soon as possible.";

  const getWaLink = (phone: string | null, name: string, title: string, dueDate: Date) => {
    if (!phone) return null;
    let text = waTemplate
      .replace(/{name}/g, name)
      .replace(/{title}/g, title)
      .replace(/{due_date}/g, new Date(dueDate).toLocaleDateString());
    let cleanPhone = phone.trim().replace(/^0/, '94');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Aggregate data for charts
  const userBorrowCounts: Record<string, {name: string, loans: number}> = {};
  const bookBorrowCounts: Record<string, {title: string, borrows: number}> = {};

  allLoans.forEach(loan => {
    // Top Borrowers
    if (loan.user) {
      if (!userBorrowCounts[loan.userId]) {
        userBorrowCounts[loan.userId] = { name: loan.user.name, loans: 0 };
      }
      userBorrowCounts[loan.userId].loans++;
    }
    
    // Popular Books
    if (loan.book) {
      if (!bookBorrowCounts[loan.bookId]) {
        bookBorrowCounts[loan.bookId] = { title: loan.book.title, borrows: 0 };
      }
      bookBorrowCounts[loan.bookId].borrows++;
    }
  });

  const topBorrowers = Object.values(userBorrowCounts)
    .sort((a, b) => b.loans - a.loans)
    .slice(0, 5);

  const popularBooks = Object.values(bookBorrowCounts)
    .sort((a, b) => b.borrows - a.borrows)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Books</p>
            <p className="text-3xl font-bold text-slate-800">{totalBooks.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Registered Members</p>
            <p className="text-3xl font-bold text-slate-800">{totalMembers.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-lg">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Loans</p>
            <p className="text-3xl font-bold text-slate-800">{activeLoans.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Charts Component */}
      <DashboardCharts topBorrowers={topBorrowers} popularBooks={popularBooks} />
      
      {/* Overdue Books Section */}
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-rose-100 flex justify-between items-center bg-rose-50">
          <h3 className="text-xl font-bold text-rose-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Action Required: Overdue & Due Soon
          </h3>
          <span className="bg-rose-200 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">{overdueLoans.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Accession No</th>
                <th className="p-4 font-semibold">Book Title</th>
                <th className="p-4 font-semibold">Borrower</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Overdue From (Due Date)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueLoans.map(loan => (
                <tr key={loan.id} className="hover:bg-rose-50/50 transition">
                  <td className="p-4 text-sm font-mono text-slate-600">{loan.book.accNo}</td>
                  <td className="p-4 font-medium text-slate-800">{loan.book.title}</td>
                  <td className="p-4 text-sm text-slate-700">{loan.user.name} <span className="text-slate-400 text-xs font-normal">({loan.user.memberId})</span></td>
                  <td className="p-4 text-sm text-slate-600 flex items-center gap-2">
                    {loan.user.phone || "-"}
                    {loan.user.phone && (
                      <a href={getWaLink(loan.user.phone, loan.user.name, loan.book.title, loan.dueDate)!} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600 transition" title="Send WhatsApp Message">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-sm font-bold text-rose-600">{new Date(loan.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {overdueLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No overdue books right now. Great job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Recent Circulation Activity</h3>
          <Link href="/circulation" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Go to Circulation &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Member</th>
                <th className="p-4 font-semibold">Book Title</th>
                <th className="p-4 font-semibold">Borrow Date</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLoans.map(loan => (
                <tr key={loan.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">{loan.user.name} <span className="text-slate-400 text-xs font-normal">({loan.user.memberId})</span></td>
                  <td className="p-4 text-sm text-slate-700">{loan.book.title}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(loan.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      loan.status === 'ACTIVE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No recent circulation activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
