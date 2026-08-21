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

  const [totalBooks, totalMembers, activeLoans, recentLoans, allLoans] = await Promise.all([
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
    })
  ]);
  
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
