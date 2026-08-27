import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportsHubPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permDashboard = (session?.user as any)?.permDashboard;

  if (role === "MEMBER" || (role === "STAFF" && !permDashboard)) {
    redirect("/catalog");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Reports & Analytics</h2>
        <p className="text-slate-500 mt-2">Comprehensive insights and reporting for library management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/circulation/reports" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition group block">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Fines Report</h3>
          </div>
          <p className="text-slate-600 text-sm">Track collected fines over a specific period. View detailed logs of member payments.</p>
        </Link>

        <Link href="/reports/popular-books" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition group block">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Popular Books</h3>
          </div>
          <p className="text-slate-600 text-sm">Discover the most borrowed books of all time to guide your next acquisitions.</p>
        </Link>

        <Link href="/reports/weeding" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-300 transition group block">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Weeding Report</h3>
          </div>
          <p className="text-slate-600 text-sm">Identify books that have never been borrowed. Useful for discarding old or unpopular books to free up shelf space.</p>
        </Link>

        <Link href="/reports/inactive-members" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-300 transition group block">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Inactive Members</h3>
          </div>
          <p className="text-slate-600 text-sm">List of members who have not borrowed any books in a long time. Useful for outreach and engagement.</p>
        </Link>
      </div>
    </div>
  );
}
