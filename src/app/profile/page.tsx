import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).memberId) {
    redirect("/login");
  }

  // Fetch user profile and loans
  const user = await prisma.user.findUnique({
    where: { memberId: (session.user as any).memberId },
    include: {
      loans: {
        include: {
          book: true,
        },
        orderBy: {
          borrowDate: 'desc'
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const activeLoans = user.loans.filter(loan => !loan.returnDate);
  const pastLoans = user.loans.filter(loan => loan.returnDate);

  // Calculate due dates for active loans
  const today = new Date();
  today.setHours(0,0,0,0);

  const getDueDateStatus = (dueDate: Date) => {
    const due = new Date(dueDate);
    due.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, color: "text-rose-600 bg-rose-100 border-rose-200" };
    } else if (diffDays === 0) {
      return { text: "Due Today", color: "text-amber-600 bg-amber-100 border-amber-200" };
    } else {
      return { text: `${diffDays} days left`, color: "text-emerald-700 bg-emerald-100 border-emerald-200" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">My Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Details Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
              <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-sm">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
              <p className="text-sm font-medium text-indigo-600 mt-1">{user.memberId}</p>
              <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                {user.role}
              </div>
            </div>
            <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">NIC</p>
                  <p className="text-slate-800 font-medium">{user.nic || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupation</p>
                  <p className="text-slate-800 font-medium">{user.occupation || "Not specified"}</p>
                </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                <p className="text-slate-800 font-medium">{user.email || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                <p className="text-slate-800 font-medium">{user.phone || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</p>
                <p className="text-slate-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Books Information */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Loans */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Currently Borrowed ({activeLoans.length})
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {activeLoans.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>You haven't borrowed any books currently.</p>
                  <Link href="/catalog" className="text-indigo-600 hover:underline text-sm font-medium mt-2 inline-block">Browse Catalog</Link>
                </div>
              ) : (
                activeLoans.map(loan => {
                  const status = getDueDateStatus(loan.dueDate);
                  return (
                    <div key={loan.id} className="p-6 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{loan.book.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">Acc No: <span className="font-mono">{loan.book.accNo}</span> • By {loan.book.author || 'Unknown'}</p>
                        <p className="text-sm text-slate-600 mt-2">
                          Borrowed on: <span className="font-medium">{new Date(loan.borrowDate).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500 mb-1">Due Date</p>
                        <p className="font-bold text-slate-800 mb-2">{new Date(loan.dueDate).toLocaleDateString()}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Past Loans History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Borrowing History
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="p-4 font-semibold">Book</th>
                    <th className="p-4 font-semibold">Borrowed</th>
                    <th className="p-4 font-semibold">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastLoans.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">
                        No past borrowing history found.
                      </td>
                    </tr>
                  ) : (
                    pastLoans.map(loan => (
                      <tr key={loan.id} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <p className="font-medium text-slate-800">{loan.book.title}</p>
                          <p className="text-xs font-mono text-slate-500">{loan.book.accNo}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {new Date(loan.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium">
                          {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
