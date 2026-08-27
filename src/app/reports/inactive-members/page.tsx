import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function InactiveMembersReportPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find members who have NO loans, OR whose latest loan was before 6 months ago.
  // We can just find all members and filter, or use Prisma relation filters.
  const allMembers = await prisma.user.findMany({
    where: { role: "MEMBER" },
    include: {
      loans: {
        orderBy: { borrowDate: "desc" },
        take: 1
      }
    },
    orderBy: { memberId: "asc" }
  });

  const inactiveMembers = allMembers.filter(member => {
    if (member.loans.length === 0) return true; // Never borrowed
    const lastLoanDate = new Date(member.loans[0].borrowDate);
    return lastLoanDate < sixMonthsAgo;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/reports" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition mb-6 shadow-sm border border-slate-200">
            &larr; Back to Reports
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Inactive Members</h2>
          <p className="text-slate-500">Members who haven't borrowed a book in over 6 months (or never).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Inactive Members ({inactiveMembers.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          {inactiveMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Great news! All members have been active recently.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">Member ID</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Name & Email</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Joined Date</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Last Active</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inactiveMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm font-mono text-slate-600">{member.memberId}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email || "No email"}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-rose-600 font-medium">
                      {member.loans.length === 0 
                        ? "Never" 
                        : new Date(member.loans[0].borrowDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      <Link href={`/members/${member.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                        View Profile
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
