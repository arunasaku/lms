import { getFineReports } from "../actions";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function FinesReportPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
  const params = await searchParams;
  
  // Default to this month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const defaultStart = firstDay.toISOString().split("T")[0];
  const defaultEnd = today.toISOString().split("T")[0];
  
  const startDateStr = params.start || defaultStart;
  const endDateStr = params.end || defaultEnd;

  const fines = await getFineReports(startDateStr, endDateStr);
  const totalFines = fines.reduce((sum, loan) => sum + loan.fine, 0);

  // Get current rate
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const currentRate = config ? config.dailyFineRate : 5.0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/circulation" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition mb-6 shadow-sm border border-slate-200">
            &larr; Back to Circulation
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Fines Report</h2>
          <p className="text-slate-500">Current Daily Fine Rate: Rs. {currentRate.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <input 
              type="date" 
              name="start" 
              defaultValue={startDateStr}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <input 
              type="date" 
              name="end" 
              defaultValue={endDateStr}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" 
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition font-medium">
            Generate Report
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Collected Fines</h3>
            <div className="text-xl font-bold text-emerald-600">
              Total: Rs. {totalFines.toFixed(2)}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {fines.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No fines collected in this period.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-sm font-semibold text-slate-600">Paid On</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">Member</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">Book</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-right">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="p-3 text-sm text-slate-600">
                        {loan.finePaidDate ? new Date(loan.finePaidDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{loan.user?.name}</div>
                        <div className="text-xs text-slate-500">{loan.user?.memberId}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 line-clamp-1">{loan.book?.title}</div>
                        <div className="text-xs text-slate-500">{loan.book?.accNo}</div>
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 text-right">
                        {loan.fine.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
